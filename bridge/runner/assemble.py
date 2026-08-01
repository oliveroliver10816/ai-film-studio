#!/usr/bin/env python3
"""Cut THE ARRANGEMENT together: ten shots, a flash montage, a title card, four voice lines.

Everything is re-encoded through one filter graph rather than stream-copied, because the
sources come from different generations and a concat demuxer will silently desync audio if
any timebase differs.

The montage is built from tails of shots we have already rendered — fourteen fresh
generations would be the expensive way to make the least important four seconds of the film.
"""

import json, os, subprocess, sys, math

FF = r"D:\aifilm\tools\ffmpeg\bin\ffmpeg.exe"
FP = r"D:\aifilm\tools\ffmpeg\bin\ffprobe.exe"
SHOTS_DIR = r"D:\aifilm\out\shots"
VOICE_DIR = r"D:\aifilm\out\voice"
WORK = r"D:\aifilm\out\assembly"
OUT = r"D:\aifilm\out\THE_ARRANGEMENT.mp4"
W, H, FPS = 1280, 704, 24

# shot -> frames, matching what was rendered
PLAN = [("S01",125),("S02",149),("S03",101),("S04",153),("S05",105),
        ("S06",165),("S07",109),("S08",165),("S09",109),("S10",105)]

# fourteen flash cuts, each 0.293 s, taken from a timestamp inside a shot we already have
MONTAGE = [("S05",1.2),("S01",3.0),("S08",2.0),("S03",2.4),("S05",3.2),("S09",2.6),
           ("S02",4.4),("S01",1.4),("S04",5.0),("S07",2.2),("S10",3.0),("S04",2.0),
           ("S09",3.4),("S06",5.5)]
FLASH = 0.293


def run(args, **kw):
    return subprocess.run(args, capture_output=True, text=True, **kw)


def probe(path):
    r = run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    try:
        return float(r.stdout.strip())
    except Exception:
        return 0.0


def find_shot(shot):
    if not os.path.isdir(SHOTS_DIR):
        return None
    c = sorted(f for f in os.listdir(SHOTS_DIR) if f.startswith(shot) and f.lower().endswith((".mp4", ".webm", ".mkv")))
    return os.path.join(SHOTS_DIR, c[0]) if c else None


def main():
    os.makedirs(WORK, exist_ok=True)
    report = {"shots": [], "montage": len(MONTAGE), "errors": []}

    # ---------------------------------------------------------------- 1. normalise shots
    seg = []
    t = 0.0
    for shot, frames in PLAN:
        src = find_shot(shot)
        if not src:
            report["errors"].append(f"missing rendered shot {shot}")
            continue
        dst = os.path.join(WORK, f"{shot}.mp4")
        r = run([FF, "-y", "-v", "error", "-i", src,
                 "-vf", f"scale={W}:{H}:flags=lanczos,fps={FPS},format=yuv420p",
                 "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "16", dst])
        if r.returncode != 0:
            report["errors"].append(f"{shot} normalise failed: {r.stderr[:200]}")
            continue
        d = probe(dst)
        report["shots"].append({"shot": shot, "start": round(t, 3), "seconds": round(d, 3), "src": src})
        t += d
        seg.append(dst)

    # ---------------------------------------------------------------- 2. flash montage
    for i, (shot, at) in enumerate(MONTAGE):
        src = os.path.join(WORK, f"{shot}.mp4")
        if not os.path.exists(src):
            continue
        dur = probe(src)
        start = min(max(at, 0.0), max(dur - FLASH - 0.05, 0.0))
        dst = os.path.join(WORK, f"M{i:02d}.mp4")
        r = run([FF, "-y", "-v", "error", "-ss", f"{start:.3f}", "-i", src, "-t", f"{FLASH:.3f}",
                 "-vf", f"scale={W}:{H},fps={FPS},format=yuv420p",
                 "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "16", dst])
        if r.returncode == 0:
            seg.append(dst)
        else:
            report["errors"].append(f"montage {i} failed: {r.stderr[:150]}")
    montage_start = round(t, 3)
    t += FLASH * len(MONTAGE)

    # ---------------------------------------------------------------- 3. title card
    title = os.path.join(WORK, "TITLE.mp4")
    # A font path that exists on every Windows install; drawtext needs forward slashes and an
    # escaped colon or the filter parser treats them as separators.
    font = "C\\:/Windows/Fonts/arialbd.ttf"
    tf = (f"drawtext=fontfile='{font}':text='THE ARRANGEMENT':fontcolor=white:fontsize=74:"
          f"x=(w-text_w)/2:y=(h-text_h)/2-18:alpha='if(lt(t,0.35),t/0.35,if(lt(t,2.0),1,max(0,1-(t-2.0)/0.7)))',"
          f"drawtext=fontfile='{font}':text='a 60 second film':fontcolor=0xD89B4E:fontsize=22:"
          f"x=(w-text_w)/2:y=(h-text_h)/2+56:alpha='if(lt(t,0.6),0,if(lt(t,2.0),(t-0.6)/1.4,max(0,1-(t-2.0)/0.7)))'")
    r = run([FF, "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c=black:s={W}x{H}:d=2.70:r={FPS}",
             "-vf", tf, "-c:v", "libx264", "-preset", "medium", "-crf", "16",
             "-pix_fmt", "yuv420p", title])
    if r.returncode == 0:
        seg.append(title)
    else:
        report["errors"].append("title card failed: " + r.stderr[:300])
    title_start = round(t, 3)
    t += 2.70
    total = round(t, 3)

    # ---------------------------------------------------------------- 4. join picture
    lst = os.path.join(WORK, "segments.txt")
    with open(lst, "w", encoding="utf-8") as fh:
        for s in seg:
            fh.write("file '" + s.replace("\\", "/") + "'\n")
    picture = os.path.join(WORK, "picture.mp4")
    r = run([FF, "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
             "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", picture])
    if r.returncode != 0:
        report["errors"].append("concat failed: " + r.stderr[:400])
        print(json.dumps(report)); return 2

    # ---------------------------------------------------------------- 5. sound
    # Voice placement is anchored to the shot each line belongs to, so it stays correct even
    # if a shot's rendered length differs slightly from the plan.
    starts = {s["shot"]: s["start"] for s in report["shots"]}
    lines = [
        ("01_elena_funeral.wav",      starts.get("S01", 0.0) + 1.10),
        ("02_adrian_takeitback.wav",  starts.get("S06", 26.4) + 1.70),
        ("03_elena_allofit.wav",      starts.get("S08", 37.8) + 1.60),
        ("04_elena_notes.wav",        starts.get("S10", 49.2) + 0.40),
    ]
    ain, filt, mixv = [], [], []
    idx = 1  # 0 is the picture
    placed = []
    for fn, at in lines:
        p = os.path.join(VOICE_DIR, fn)
        if not os.path.exists(p):
            report["errors"].append(f"voice missing: {fn}")
            continue
        ain += ["-i", p]
        filt.append(f"[{idx}:a]adelay={int(at*1000)}|{int(at*1000)},volume=1.0[v{idx}]")
        mixv.append(f"[v{idx}]")
        placed.append({"file": fn, "at": round(at, 2), "seconds": round(probe(p), 2)})
        idx += 1
    report["voice"] = placed

    # a low room drone under everything, and one swell into the title — restrained on purpose
    drone_i = idx
    ain += ["-f", "lavfi", "-i", f"sine=frequency=44:duration={total:.2f}:sample_rate=48000"]
    filt.append(f"[{drone_i}:a]volume=0.055,afade=t=in:st=0:d=3,afade=t=out:st={total-2.2:.2f}:d=2.2[drone]")
    idx += 1
    swell_i = idx
    ain += ["-f", "lavfi", "-i", f"sine=frequency=58:duration={total:.2f}:sample_rate=48000"]
    filt.append(f"[{swell_i}:a]volume=0.0,volume='if(lt(t,{title_start-2.5:.2f}),0,min(0.30,(t-{title_start-2.5:.2f})/2.5))':eval=frame,"
                f"afade=t=out:st={title_start+0.9:.2f}:d=1.4[swell]")
    idx += 1

    mixv += ["[drone]", "[swell]"]
    filt.append("".join(mixv) + f"amix=inputs={len(mixv)}:duration=longest:normalize=0[premix]")
    filt.append("[premix]loudnorm=I=-14:TP=-1.5:LRA=11[aout]")

    args = [FF, "-y", "-v", "error", "-i", picture] + ain + \
           ["-filter_complex", ";".join(filt), "-map", "0:v", "-map", "[aout]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", OUT]
    r = run(args)
    if r.returncode != 0:
        report["errors"].append("mix failed: " + r.stderr[:500])
        print(json.dumps(report)); return 3

    report["montage_start"] = montage_start
    report["title_start"] = title_start
    report["total_seconds"] = round(probe(OUT), 3)
    report["output"] = OUT
    report["bytes"] = os.path.getsize(OUT)
    report["ok"] = not report["errors"]
    print("ASSEMBLY_JSON_START" + json.dumps(report) + "ASSEMBLY_JSON_END")
    return 0


if __name__ == "__main__":
    sys.exit(main())
