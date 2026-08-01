#!/usr/bin/env python3
"""Run a batch of ComfyUI workflows back to back, unattended.

Reads a base64 JSON batch: [{shot, model, wf}, ...] and runs each through the same
submit-and-wait path as run.py, sampling the GPU across the whole batch AND per item.

Order matters and is the caller's job: keep all workflows that share a checkpoint together,
because swapping a 38 GB model between items costs more than the renders do.

Writes D:\\aifilm\\logs\\current.json before each item so the live dashboard names what is
running, and prints one JSON summary at the end.
"""

import base64, json, os, subprocess, sys, threading, time, urllib.request, urllib.error

COMFY = "http://127.0.0.1:8188"
CURRENT = r"D:\aifilm\logs\current.json"
NVSMI = "temperature.gpu,utilization.gpu,memory.used,power.draw,clocks.current.graphics"


class GpuWatch(threading.Thread):
    def __init__(self, interval=2.0):
        super().__init__(daemon=True)
        self.interval = interval
        self.samples = []
        self._stop = threading.Event()
        self._mark = 0

    def run(self):
        while not self._stop.is_set():
            try:
                o = subprocess.run(["nvidia-smi", f"--query-gpu={NVSMI}",
                                    "--format=csv,noheader,nounits"],
                                   capture_output=True, text=True, timeout=10)
                ln = (o.stdout or "").strip().splitlines()
                if ln:
                    p = [x.strip() for x in ln[0].split(",")]
                    if len(p) >= 5:
                        self.samples.append({"temp_c": float(p[0]), "util": float(p[1]),
                                             "vram_mb": float(p[2]), "power_w": float(p[3]),
                                             "clock_mhz": float(p[4])})
            except Exception:
                pass
            self._stop.wait(self.interval)

    def stop(self):
        self._stop.set()

    def hottest(self, n=3):
        """Max temperature across the last n samples (~6 s at the 2 s interval)."""
        rows = self.samples[-n:]
        return max((r["temp_c"] for r in rows), default=0.0)

    def mark(self):
        self._mark = len(self.samples)

    def since_mark(self):
        return self._summ(self.samples[self._mark:])

    def all(self):
        return self._summ(self.samples)

    @staticmethod
    def _summ(rows):
        if not rows:
            return {"samples": 0}
        def st(k):
            v = [r[k] for r in rows]
            return {"min": round(min(v), 1), "max": round(max(v), 1),
                    "mean": round(sum(v) / len(v), 1)}
        s = {"samples": len(rows), "temp_c": st("temp_c"), "util": st("util"),
             "vram_mb": st("vram_mb"), "power_w": st("power_w"), "clock_mhz": st("clock_mhz")}
        s["thermal_warning"] = s["temp_c"]["max"] >= 83
        return s


def post(url, obj, timeout=180):
    req = urllib.request.Request(url, data=json.dumps(obj).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def get(url, timeout=60):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode())


def run_one(wf, timeout_s, watch=None, abort_temp=0.0):
    try:
        r = post(f"{COMFY}/prompt", {"prompt": wf, "client_id": "batch"})
    except urllib.error.HTTPError as e:
        return "rejected", None, e.read().decode("utf-8", "replace")[:1200]
    except Exception as e:
        return "unreachable", None, str(e)
    pid = r.get("prompt_id")
    if not pid:
        return "rejected", None, str(r)[:500]
    end = time.time() + timeout_s
    while time.time() < end:
        time.sleep(2)
        # HARD THERMAL ABORT. This card dropped off the PCIe bus after an hour at 94 C.
        # A warning in a log did not stop that and never will — this cancels the render.
        if watch is not None and abort_temp > 0 and watch.hottest(3) >= abort_temp:
            hot = watch.hottest(3)
            try:
                urllib.request.urlopen(urllib.request.Request(f"{COMFY}/interrupt", data=b"{}",
                                       headers={"Content-Type": "application/json"}), timeout=15).read()
            except Exception:
                pass
            return "thermal_abort", None, (f"ABORTED: GPU reached {hot:.0f} C, at or above the "
                                           f"{abort_temp:.0f} C limit. The render was cancelled to "
                                           f"protect the card.")
        try:
            h = get(f"{COMFY}/history/{pid}", timeout=20)
        except Exception:
            continue
        if pid in h:
            e = h[pid]
            st = e.get("status") or {}
            if st.get("status_str") == "error":
                return "error", e, json.dumps(st.get("messages", []))[:1200]
            files = []
            for nid, out in (e.get("outputs") or {}).items():
                for k in ("images", "gifs", "videos"):
                    for f in out.get(k, []) or []:
                        files.append(os.path.join(r"D:\aifilm\out", f.get("subfolder", ""), f.get("filename")))
            return "done", files, None
    return "timeout", None, f"exceeded {timeout_s}s"


def main():
    b64 = sys.argv[1] if len(sys.argv) > 1 else sys.stdin.read().strip()
    if os.path.isfile(b64):
        b64 = open(b64, "r", encoding="utf-8").read().strip()
    batch = json.loads(base64.b64decode(b64).decode("utf-8"))
    per_timeout = int(os.environ.get("BATCH_ITEM_TIMEOUT", "1800"))
    abort_temp = float(os.environ.get("BATCH_ABORT_TEMP", "87"))

    watch = GpuWatch()
    watch.start()
    results = []
    t_all = time.time()

    cool_to = float(os.environ.get("BATCH_COOL_TO", "0"))     # 0 disables
    cool_max = float(os.environ.get("BATCH_COOL_MAX_S", "240"))

    def cooldown(idx):
        """Let the card come back down before the next item.

        Measured on this box: the GPU climbs to 93 C within three back-to-back renders and
        clocks fall from 2842 MHz to ~1900 MHz — real throttling. On a long unattended queue
        that turns into slower renders and a card held at its thermal limit for hours. Waiting
        a minute between items costs far less than the throttle does.
        """
        if cool_to <= 0:
            return 0.0
        t0 = time.time()
        while time.time() - t0 < cool_max:
            cur = None
            try:
                o = subprocess.run(["nvidia-smi", "--query-gpu=temperature.gpu",
                                    "--format=csv,noheader,nounits"],
                                   capture_output=True, text=True, timeout=10)
                cur = float((o.stdout or "0").strip().splitlines()[0])
            except Exception:
                return time.time() - t0
            if cur <= cool_to:
                break
            time.sleep(5)
        w = time.time() - t0
        if w > 1:
            print(f"      cooled {w:.0f}s before item {idx} (target <= {cool_to:.0f}C)", flush=True)
        return w

    for i, item in enumerate(batch, 1):
        shot = item.get("shot", f"item{i}")
        if i > 1:
            cooldown(i)
        try:
            with open(CURRENT, "w", encoding="utf-8") as fh:
                json.dump({"task": "render", "item": f"{shot} ({i} of {len(batch)}) — {item.get('model','')}",
                           "source": item.get("model", ""), "dest": r"D:\aifilm\out\keys",
                           "total_bytes": None}, fh)
        except Exception:
            pass
        watch.mark()
        t0 = time.time()
        status, files, err = run_one(item["wf"], per_timeout, watch, abort_temp)
        el = time.time() - t0
        g = watch.since_mark()
        print(f"[{i}/{len(batch)}] {shot:<5} {status:<10} {el:7.1f}s  "
              f"temp {g.get('temp_c',{}).get('max','?')}C max  "
              f"vram {int(g.get('vram_mb',{}).get('max',0))}MB  "
              f"{'' if not err else err[:200]}", flush=True)
        results.append({"shot": shot, "model": item.get("model"), "status": status,
                        "elapsed_s": round(el, 2), "files": files if status == "done" else [],
                        "error": err, "gpu": g})
        if status == "thermal_abort":
            print(f"!! THERMAL ABORT on {shot} — stopping the whole batch. {err}", flush=True)
            break

    watch.stop()
    try:
        os.remove(CURRENT)
    except Exception:
        pass
    summary = {"items": len(batch),
               "done": sum(1 for r in results if r["status"] == "done"),
               "failed": sum(1 for r in results if r["status"] != "done"),
               "total_s": round(time.time() - t_all, 1),
               "gpu_whole_batch": watch.all(),
               "results": results}
    print("BATCH_JSON_START" + json.dumps(summary) + "BATCH_JSON_END", flush=True)
    return 0 if summary["failed"] == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
