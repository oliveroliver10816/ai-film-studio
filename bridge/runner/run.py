#!/usr/bin/env python3
"""Render runner for the Blackwell box.

Takes a ComfyUI API workflow, submits it, waits, and reports what actually happened —
including GPU temperature sampled throughout, which is the thing that quietly ruins an
unattended overnight run.

Usage:
  python run.py --workflow D:\\aifilm\\projects\\wf.json --label S02 --model "Wan 2.2 TI2V-5B" \\
                [--shot S02] [--frames 121] [--fps 24] [--res 1280x704] [--seed 1234] \\
                [--bridge-report]

Prints a single JSON object on stdout. Never raises on a render failure — it reports it.
"""

import argparse, json, os, subprocess, sys, threading, time, urllib.request, urllib.error

COMFY = "http://127.0.0.1:8188"
LOGS = r"D:\aifilm\logs"
NVSMI_FIELDS = "temperature.gpu,utilization.gpu,memory.used,power.draw,clocks.current.graphics"


# ----------------------------------------------------------------- gpu sampling
class GpuWatch(threading.Thread):
    """Samples the card every `interval` seconds for the whole render.

    Temperature is the one that matters unattended: a card that thermal-throttles turns a
    predictable overnight queue into a slow one, and nothing else in the pipeline would
    ever tell us. We keep min/max/mean so a throttle shows up as a max, not an average.
    """

    def __init__(self, interval=2.0):
        super().__init__(daemon=True)
        self.interval = interval
        self.samples = []
        self._stop = threading.Event()

    def run(self):
        while not self._stop.is_set():
            try:
                out = subprocess.run(
                    ["nvidia-smi", f"--query-gpu={NVSMI_FIELDS}",
                     "--format=csv,noheader,nounits"],
                    capture_output=True, text=True, timeout=10)
                line = (out.stdout or "").strip().splitlines()
                if line:
                    p = [x.strip() for x in line[0].split(",")]
                    if len(p) >= 5:
                        self.samples.append({
                            "t": time.time(),
                            "temp_c": float(p[0]), "util": float(p[1]),
                            "vram_mb": float(p[2]), "power_w": float(p[3]),
                            "clock_mhz": float(p[4]),
                        })
            except Exception:
                pass
            self._stop.wait(self.interval)

    def stop(self):
        self._stop.set()

    def summary(self):
        if not self.samples:
            return {"samples": 0}
        def stat(k):
            v = [s[k] for s in self.samples]
            return {"min": round(min(v), 1), "max": round(max(v), 1),
                    "mean": round(sum(v) / len(v), 1)}
        s = {"samples": len(self.samples), "temp_c": stat("temp_c"), "util": stat("util"),
             "vram_mb": stat("vram_mb"), "power_w": stat("power_w"), "clock_mhz": stat("clock_mhz")}
        # a Blackwell workstation card throttles in the high 80s; flag it rather than bury it
        s["thermal_warning"] = s["temp_c"]["max"] >= 83
        return s


# ----------------------------------------------------------------- comfy plumbing
def post_json(url, obj, timeout=120):
    data = json.dumps(obj).encode("utf-8")
    req = urllib.request.Request(url, data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def get_json(url, timeout=60):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def wait_for_comfy(seconds=180):
    for _ in range(seconds // 3):
        try:
            get_json(f"{COMFY}/system_stats", timeout=5)
            return True
        except Exception:
            time.sleep(3)
    return False


def outputs_of(entry):
    """Every file the graph wrote, flattened, in node order."""
    files = []
    for node_id, out in (entry.get("outputs") or {}).items():
        for key in ("images", "gifs", "videos", "audio"):
            for f in out.get(key, []) or []:
                files.append({"node": node_id, "filename": f.get("filename"),
                              "subfolder": f.get("subfolder", ""), "type": f.get("type", "output")})
    return files


def run_workflow(wf, timeout_s):
    """Submit and wait. Returns (status, entry, err)."""
    try:
        r = post_json(f"{COMFY}/prompt", {"prompt": wf, "client_id": "night-runner"})
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:2000]
        return "rejected", None, f"ComfyUI rejected the graph: {body}"
    except Exception as e:
        return "unreachable", None, str(e)

    pid = r.get("prompt_id")
    if not pid:
        return "rejected", None, f"no prompt_id in response: {r}"

    deadline = time.time() + timeout_s
    while time.time() < deadline:
        time.sleep(2)
        try:
            h = get_json(f"{COMFY}/history/{pid}", timeout=20)
        except Exception:
            continue
        if pid in h:
            entry = h[pid]
            st = (entry.get("status") or {})
            if st.get("status_str") == "error" or st.get("completed") is False:
                msgs = []
                for m in st.get("messages", []) or []:
                    msgs.append(json.dumps(m)[:400])
                return "error", entry, " | ".join(msgs)[:1500]
            return "done", entry, None
    return "timeout", None, f"not finished within {timeout_s}s"


# ----------------------------------------------------------------- bridge report
def report(bridge, token, row):
    try:
        data = json.dumps(row).encode("utf-8")
        req = urllib.request.Request(bridge.rstrip("/") + "/api/render", data=data,
                                     headers={"Content-Type": "application/json",
                                              "x-agent-token": token})
        urllib.request.urlopen(req, timeout=30).read()
        return True
    except Exception:
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workflow", required=True)
    ap.add_argument("--label", default="")
    ap.add_argument("--shot", default="")
    ap.add_argument("--model", default="")
    ap.add_argument("--res", default="")
    ap.add_argument("--frames", type=int, default=0)
    ap.add_argument("--fps", type=int, default=0)
    ap.add_argument("--seed", default="")
    ap.add_argument("--timeout", type=int, default=3600)
    ap.add_argument("--notes", default="")
    ap.add_argument("--bridge-report", action="store_true")
    a = ap.parse_args()

    if not wait_for_comfy():
        print(json.dumps({"ok": False, "error": "ComfyUI not answering on 8188"}))
        return 1

    with open(a.workflow, "r", encoding="utf-8") as fh:
        wf = json.load(fh)

    watch = GpuWatch()
    watch.start()
    t0 = time.time()
    status, entry, err = run_workflow(wf, a.timeout)
    elapsed = time.time() - t0
    watch.stop()
    time.sleep(0.2)
    gpu = watch.summary()

    files = outputs_of(entry) if entry else []
    result = {
        "ok": status == "done" and bool(files),
        "status": status,
        "error": err,
        "label": a.label,
        "shot": a.shot,
        "model": a.model,
        "elapsed_s": round(elapsed, 2),
        "outputs": files,
        "gpu": gpu,
    }
    if a.frames and a.fps:
        vs = a.frames / a.fps
        result["video_seconds"] = round(vs, 3)
        result["s_per_video_second"] = round(elapsed / vs, 3) if vs else None

    if a.bridge_report:
        cfg_path = r"C:\ai-film-bridge\config.json"
        try:
            cfg = json.load(open(cfg_path, "r", encoding="utf-8-sig"))
            note = a.notes
            if gpu.get("samples"):
                note += (f" | GPU temp min/mean/max {gpu['temp_c']['min']}/{gpu['temp_c']['mean']}/"
                         f"{gpu['temp_c']['max']}C, util mean {gpu['util']['mean']}%, "
                         f"power max {gpu['power_w']['max']}W, clock min {gpu['clock_mhz']['min']}MHz")
                if gpu.get("thermal_warning"):
                    note += " | THERMAL WARNING >=83C"
            report(cfg["url"], cfg["token"], {
                "shot": a.shot or a.label, "model": a.model, "resolution": a.res,
                "frames": a.frames or None, "fps": a.fps or None,
                "gpu_seconds": round(elapsed, 2),
                "peak_vram_mb": int(gpu["vram_mb"]["max"]) if gpu.get("samples") else None,
                "gpu_name": "RTX PRO 6000 Blackwell",
                "seed": str(a.seed), "notes": note.strip(" |"),
            })
        except Exception as e:
            result["bridge_report_error"] = str(e)

    print(json.dumps(result))
    return 0 if result["ok"] else 2


if __name__ == "__main__":
    sys.exit(main())
