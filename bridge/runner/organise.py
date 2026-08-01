#!/usr/bin/env python3
"""Reorganise D:\\aifilm\\out into something a human can read at a glance.

The rule: the root of `out` holds FINISHED FILMS and nothing else. Everything that went into
making them lives in a numbered folder named after the stage that produced it.

Idempotent — safe to run repeatedly. Never deletes: anything unrecognised goes to 09_unsorted
so a stray file is visible rather than lost.
"""

import json, os, shutil, sys

OUT = r"D:\aifilm\out"

# numbered so the folder list reads in pipeline order in Explorer
FOLDERS = {
    "01_previous_films": "Earlier finished cuts, superseded but kept",
    "02_cast":           "Locked character reference images — the irreplaceable ones",
    "03_keyframes":      "One approved still per shot, the frame each clip starts from",
    "04_clips":          "Rendered video, one file per shot, before the edit",
    "05_voice":          "Voice recordings and alternate takes",
    "06_edit":           "Working files the edit produced — normalised shots, montage pieces, title",
    "07_tests":          "Model and prompt experiments, kept so results can be compared",
    "08_previews":       "Contact sheets and crops made for reviewing work",
    "09_unsorted":       "Anything that did not match a rule — check and file it",
}

# old folder -> new folder
MOVE_DIR = {
    "castmaster": "02_cast",
    "keys":       "03_keyframes",
    "shots":      "04_clips",
    "voice":      "05_voice",
    "assembly":   "06_edit",
    "test":       "07_tests/2026-08-01_first_qwen_image",
    "bench":      "07_tests/2026-08-01_first_wan_render",
    "fx":         "07_tests/2026-08-01_flux2_prompt_style_AB",
    "fx2":        "07_tests/2026-08-02_flux2_light_as_effect",
    "fx3":        "07_tests/2026-08-02_flux2_resolution_finding",
    "fx4":        "07_tests/2026-08-02_flux2_jargon_removed",
}

FINAL_VIDEO_EXT = (".mp4", ".mov", ".mkv", ".webm")


def unique(path):
    if not os.path.exists(path):
        return path
    stem, ext = os.path.splitext(path)
    i = 2
    while os.path.exists(f"{stem}_{i}{ext}"):
        i += 1
    return f"{stem}_{i}{ext}"


def main():
    if not os.path.isdir(OUT):
        print(json.dumps({"ok": False, "error": f"{OUT} missing"})); return 1

    moved, made = [], []
    for f, desc in FOLDERS.items():
        p = os.path.join(OUT, f)
        if not os.path.isdir(p):
            os.makedirs(p, exist_ok=True); made.append(f)
        with open(os.path.join(p, "WHAT IS THIS.txt"), "w", encoding="utf-8") as fh:
            fh.write(desc + "\n")

    # ---- folders first
    for old, new in MOVE_DIR.items():
        src = os.path.join(OUT, old)
        if not os.path.isdir(src):
            continue
        dst = os.path.join(OUT, new.replace("/", os.sep))
        os.makedirs(dst, exist_ok=True)
        for name in os.listdir(src):
            s = os.path.join(src, name)
            if os.path.isfile(s):
                d = unique(os.path.join(dst, name))
                shutil.move(s, d)
                moved.append((os.path.join(old, name), os.path.relpath(d, OUT)))
        try:
            os.rmdir(src)
        except OSError:
            pass

    # ---- loose files in the root
    for name in list(os.listdir(OUT)):
        s = os.path.join(OUT, name)
        if not os.path.isfile(s):
            continue
        low = name.lower()
        if low.endswith(FINAL_VIDEO_EXT):
            continue                                   # a finished film — it belongs here
        if low.endswith((".jpg", ".jpeg", ".png")):
            # every loose image here was a contact sheet or a crop made for review
            dst = os.path.join(OUT, "08_previews")
        else:
            dst = os.path.join(OUT, "09_unsorted")
        d = unique(os.path.join(dst, name))
        shutil.move(s, d)
        moved.append((name, os.path.relpath(d, OUT)))

    # ---- a map at the top level so the structure explains itself
    readme = ["THE ARRANGEMENT — output folder", "=" * 34, "",
              "The root of this folder holds FINISHED FILMS ONLY.",
              "Everything used to make them sits in a numbered folder below,",
              "in the order the pipeline runs.", ""]
    for f, desc in FOLDERS.items():
        p = os.path.join(OUT, f)
        n = sum(len(files) for _, _, files in os.walk(p)) - 1  # minus WHAT IS THIS.txt
        readme.append(f"  {f:<20} {desc}   [{max(n,0)} files]")
    readme += ["", "Finished films currently in the root:"]
    finals = sorted(x for x in os.listdir(OUT)
                    if os.path.isfile(os.path.join(OUT, x)) and x.lower().endswith(FINAL_VIDEO_EXT))
    for f in finals:
        readme.append(f"  {f}   ({os.path.getsize(os.path.join(OUT, f))/2**20:.1f} MB)")
    with open(os.path.join(OUT, "READ ME FIRST.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(readme) + "\n")

    root_now = sorted(x for x in os.listdir(OUT) if os.path.isfile(os.path.join(OUT, x)))
    print(json.dumps({"ok": True, "created": made, "moved": len(moved),
                      "root_files_now": root_now,
                      "final_videos": finals,
                      "sample_moves": moved[:12]}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
