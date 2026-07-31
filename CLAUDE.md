# ai-film-studio — reference teardown + the free local film pipeline

**Status (2026-07-31): RESEARCH DELIVERED + DEPLOYED. Nothing installed, nothing generated, ₹0 spent.**

**LIVE:** https://oliveroliver10816.github.io/ai-film-studio/ (noindex, PUBLIC repo
`oliveroliver10816/ai-film-studio`, collaborators SilentAurora245 + mary3862jon).
Deploy QA on the live URL: 200 + all 9 assets, 35 interactive strip segments read out shot data
on hover, 0 console errors, no horizontal overflow desktop 1440 + mobile 390, `noindex, nofollow`
confirmed in the served HTML.
Successor to `video-engine` (which answered *"is this feasible?"*). This folder answers
*"how do we get THAT level, keep one face across shots, and do it on free software on the Blackwell box?"*

Deliverable: `index.html` — single page, noindex, dark, signature = the film's 35 measured cuts
drawn to scale as an interactive strip.

## Bob's decisions, 2026-07-31 (these override the research where they conflict)

1. **ENGLISH ONLY — Korean and Hindi are dropped.** This removes the project's single biggest
   unknown (nobody had published a ko/hi lip-sync result). Chatterbox is no longer needed at all.
2. **Bridge built** — see `bridge/`. Everything the PC does is tracked and charted.
3. **Stills come from Google Flow (Veo 3.1)**, audio from **ElevenLabs** produced by Bob's VA from a
   spec sheet we write (voice, settings, script) — 11Labs is NOT API-connected, output arrives as
   mp3/wav. ⇒ MOVA drops to non-dialogue shots only (it invents its own voice); **LongCat-Video-Avatar
   is the dialogue tool** because it animates to audio we supply.
   ⚠ **Flow images CAN be upscaled to 2K/4K in the UI before download** — Bob's correction, applied
   to `veo-flow-multi/CLAUDE.md`, whose "not available" line was about our tool's unimplemented
   endpoint, not the product. Keyframes only need ≥1280×720 anyway; the final master is upscaled
   on our own GPU for free.
4. **The "90-shot runner" explained:** a script that feeds the shot list to the GPU one clip at a
   time, unattended overnight, and reports which shots came out usable. Without it someone clicks 90
   times.
5. **First deliverable = a 60-second ORIGINAL STORY TRAILER**, same genre and cut grammar as the
   reference, in English. ~9–10 sustained shots + a flash montage. I write script, cast and shot list.

## ⭐ MACHINE INVENTORY — measured over the bridge 2026-08-01, not assumed

**The PC:** `DESKTOP-SFLR7D9`, Windows 11 Pro, PS 5.1. Ryzen 9 9950X3D (16C/32T), **61.6 GB RAM**.
Disk free: C 1127 GB · **D 5613 GB** · E 1835 GB.

- ⚠⚠ **ONE GPU, not two — RTX PRO 6000 Blackwell Workstation, 97,887 MiB. There is no RTX 5090 in
  this machine.** Every dual-card plan in `video-engine` and in the sections below is **void**: no
  bf16-on-the-big-card / quantised-on-the-5090 split, no cross-card scheduling, no sequence
  parallel. Driver 582.08, CUDA runtime 13.0, **compute capability 12.0 = sm_120**.
- ⭐⭐ **THE BLACKWELL BLOCKER IS ALREADY SOLVED ON THIS BOX.** The existing ComfyUI portable ships
  **python 3.13.6 + torch 2.8.0+cu129**, and its `arch list` is
  `['sm_70','sm_75','sm_80','sm_86','sm_90','sm_100','sm_120']` with `cuda.is_available() = True`
  on the PRO 6000. We do **not** have to build a torch environment from scratch — the research's
  "repo pins torch 2.6.0+cu124 = no sm_120" problem is an environment we already have the answer to.
- **Already on disk, free:** **Wan 2.2 TI2V-5B** (~21 GB incl. `umt5-xxl` encoder + VAE) at
  `D:\Vova\WAN_T2V`, **VibeVoice-1.5B** TTS, Juggernaut-XL v9 + SD 1.5, and **117 GB of HF cache**
  (39.5 GB on C:, 77.4 GB on D:). Four ComfyUI installs exist; the **portable at
  `D:\Vova\ComfyUI_windows_portable` is the live one** — the others are Electron shells.
- **Gaps to close:** **ffmpeg missing** · **MSVC / Visual Studio missing** (blocks compiling
  SageAttention from source) · CUDA toolkit **13.1 installed but `nvcc` not on PATH and `CUDA_PATH`
  empty** · system Pythons (3.12.9, 3.10) have **no torch** and there is no conda.
- ⚠ The machine has prior AI work on it under `D:\Vova\...` and `D:\DevCalivan\...` — **do not break
  or repurpose existing installs**; build alongside them.
- ⚠ **MOVA's fast single-GPU LoRA path wants ≥128 GB host RAM; this box has 61.6 GB.** VRAM is fine
  (95.6 GB), host RAM is not. That path is out unless RAM is added — the slow path or LoRA-on-stills
  is what fits.

## The bridge (BUILT + LIVE 2026-07-31)

**https://ai-film-bridge.fleet-fefsba.workers.dev** — Cloudflare Worker + D1 on the Osanix account.
Full detail, endpoint table and the traps in **`bridge/README.md`**. Tokens in
`/root/.config/ai-film-bridge.json`. The PC runs `C:\ai-film-bridge\agent.ps1` as scheduled task
`AIFilmBridge`; **outbound HTTPS only, no ports opened, no admin rights needed after install**.
Dashboard shows: machine + GPU/VRAM/disk live, a **render ledger** (per clip: GPU seconds, peak
VRAM, s per video-second, keep rate) and a **claim ledger** marking every number `estimated` vs
`measured` — 16 rows seeded, and every speed figure we have is still `estimated` because it was
measured on someone else's card.
Tested end to end against the live worker with the real agent under `pwsh`: round trip, non-zero
exit, 2,388,894-char output capped with a footer stating the loss, 15 s timeout kill, orphan
recovery, and token separation 403 in both directions.

## What Bob sent

An 88-second Korean AI trailer, **원수와 결혼하기 / "Marrying my enemy"**, Google Drive
`1iPyYRqQRtPvZbN6DijOK-_Ih3px808Xy`. He called out expressions, clarity, depth, reflections and
face cuts, then asked for open-source-only, local, on the RTX PRO 6000 Blackwell.

⚠ **State change from `video-engine`: the workstation now EXISTS and is running.** That project's
blocker (*"the workstation does not exist yet"*) is cleared. This server still has no GPU, so
nothing here has been executed locally.

## The teardown — see `FORENSICS.md` for the full measured set

- **Native 24 fps, not 30.** mpdecimate keeps 2,128 of 2,654 frames = 80.2% = exactly 24/30.
  The timeline was 30 and the export duplicated frames.
- **35 cuts / 88.47 s.** 15 sustained shots (mean 5.54 s, max 10.0 s) + **20 flash cuts**
  (mean 0.27 s) all packed into 72.4→81.5 s.
- **`meta` atom names a ByteDance CapCut-family desktop editor** (`"product":"vicut"`, `"os":"mac"`,
  a library `musicId`). ⚠ **Cannot separate CapCut from JianYing on this evidence** — one
  independent sighting of the atom exists, on a Windows export, and the only writeup about it is a
  low-quality SEO blog. Don't publish "CapCut, not JianYing".
- ⭐ **The `is_use_ai_*: 0` flags mean "none of the editor's OWN AI buttons were pressed"** — not
  "no AI". Every flag maps to a first-party feature (AI Relight, AI image/video generator, custom
  voices). An editor has no oracle over imported media. Never cite them as provenance.
- **2032×1080 = 60 px of height removed from 1920×1080, then rescaled to 1080 tall.**
  1920 × (1080/1020) = 2032.94 → 2032, and 2032 = 16×127. ⚠ **The number cannot tell you WHERE the
  60 px came off** — all-from-the-bottom gives the same answer. 56 px → 2024, 64 px → 2040.
- ⭐ Google's Flow burns a visible `veo` wordmark bottom-right, and per Google's own help page
  visible watermarking is **applied automatically in India, South Korea and Vietnam**. Published
  removal advice is a 5–10% crop; 60 px of 1080 is 5.6%. **Leading hypothesis, NOT a finding.**
- No C2PA box, no surviving watermark. Audio **−24.0 LUFS** (≈10 dB under YouTube's target).
- Identity genuinely holds: male lead in **7 shots**, suited female lead in **4–5**, across rooms,
  wardrobes and lighting. ⚠ But every female face is the same face-type — some of the "control" is
  the model's prior collapsing.
- **Craft is doing half the work**: 5 dialogue lines in 88 s, weak shots framed away
  (back-of-head / silhouette / extreme wide / blown white), shallow DOF hiding everything but one
  face, profile two-shots, and a 20-cut flash montage where nothing has to survive scrutiny.

## The answer — everything below is Apache-2.0 or MIT

⭐ **MOVA** (`OpenMOSS/MOVA`, **Apache-2.0**, arXiv 2602.08794) — 32 B MoE / 18 B active, generates
**video AND synchronized audio in one pass**, multilingual lip-sync. Inference defaults
`--num_frames 193 --fps 24 --height 720 --width 1280` = **8.04 s of 720p24**, the exact shape of the
reference film's shots. ⭐ **`pyproject.toml` pins `torch` with NO version → no `sm_120` blocker.**
Uses `yunchang` (sequence parallel — right for a no-NVLink rig). ComfyUI node: `richservo/comfyui-mova`,
which also does **audio injection**.
⚠ `--ref_path` is single-image I2V conditioning, **not** multi-photo identity conditioning.
⚠ Fast single-GPU LoRA wants **≈100 GB VRAM + ≥128 GB host RAM** — does NOT fit 96 GB / 64 GB.
Low-resource path is ≈18 GB but **600 s/step**.

⭐ **LongCat-Video-Avatar 1.5** (`meituan-longcat/LongCat-Video`, **MIT**) — audio-driven, full-body,
multi-person, video continuation. ⭐ **Replaced Wav2Vec2 with Whisper-Large**, making it the only
tool in its category *structurally* capable of Korean and Hindi. Every rival (InfiniteTalk,
MultiTalk, EchoMimic V3) runs a Chinese/English wav2vec2 encoder.
⚠ README pins `torch==2.6.0+cu124` → **override for Blackwell**.

**Use them differently:** MOVA *invents* the voice (different person every shot); LongCat *animates
to audio you supply*. For a film you want the second — clone one voice per character in
**Chatterbox Multilingual V3** (MIT, 23 languages **incl. ko + hi**, plus a dedicated
`ResembleAI/Chatterbox-Multilingual-hi` finetune) and drive every shot from it.

⚠ **THE BIGGEST UNKNOWN: nobody has published a Korean or Hindi result for ANY of these.**
Whisper-Large makes it architecturally plausible. **First GPU-hour goes to testing exactly this.**

**Consistency is four things:** face (LoRA on our own synthetic actor) · voice (one clone per
character) · wardrobe+set (decided in the keyframe) · grade (match to ONE master ref, never to the
previous shot).

## ⚠ Licence minefield — all clauses read from the raw file

- **All FLUX `[dev]`** incl. FLUX.2 dev / Kontext dev / Krea dev / **klein 9B**: §2(b) non-commercial,
  and §3(a) prohibits commercial use of *"any data produced by the FLUX [dev] Model"* while §2(d)'s
  output grant is written *"except as expressly prohibited herein"* — the carve-out swallows it.
  ✅ **Only `FLUX.2-klein-4B` (+ base-4B, autoencoder, small-decoder) is Apache-2.0** — I read its
  LICENSE.md and it is the real Apache text.
- ⭐ **InsightFace weights are non-commercial** — *"the models trained with these data are available
  for non-commercial research purposes only… both manual-downloading and auto-downloading"*.
  **This silently contaminates InstantID, PuLID, IP-Adapter FaceID, most face-swap nodes, and
  LatentSync.** Their *code* is Apache-2.0; the weights they pull are not.
  ✅ Clean route: LoRA on our own synthetic actor + MediaPipe Face Mesh.
- **All Tencent Hunyuan** — EU/UK/South Korea excluded **and the exclusion reaches Output**.
- **Wav2Lip** — no LICENSE, *"any form of commercial use is strictly prohibited"*.
- **CodeFormer / GFPGAN / SUPIR / GIMM-VFI** — non-commercial. ✅ Use **PMRF** (MIT).
- **XTTS-v2 / F5-TTS weights / Fish-Speech / Spark-TTS** — non-commercial. ✅ Chatterbox, Fun-CosyVoice3.
- **MMAudio / AudioX / MusicGen / TangoFlux** — Apache/MIT code, **CC-BY-NC weights**.
  ✅ **ACE-Step** (Apache-2.0) for score, **ThinkSound** for foley.
- Revenue-conditional: LTX-2 <$10 M · Stability <$1 M · IndexTTS-2 <100 M MAU · Higgs <100 k AAU.

## The rig — ⚠ corrections to `video-engine`'s numbers

- ⭐ **PRO 6000 is 2.41× a 5090 on bf16** (503.8 vs 209.5 dense TFLOPS), because GeForce Blackwell
  half-rates FP16/BF16 **with FP32 accumulate** and the PRO part does not. SDPA and FlashAttention
  both accumulate in FP32.
- ⭐ **Bandwidth is IDENTICAL (1792 GB/s)**, and under **SageAttention's INT8/FP4 the gap collapses
  to 1.20×** — the 5090 escapes a penalty the PRO card never paid. ⇒ put bf16 work on the big card,
  quantised work on the 5090, and treat the 5090 as closer to a peer than a helper.
- **LTX-2.3 measured (5090, fp8, SDPA, 97f@24fps, 1280×704): 49.78 s = 12.316 s/video-second,
  23.66 GiB peak.** VRAM flat across resolutions; **the DiT is only 12–28% of wall time** — the rest
  is tiled VAE decode + audio decode + h264 encode. **Optimise the decode path, not attention.**
- **Wan 2.2 at 720p ≈ 205 s/video-second on an H100** — the licence-clean workhorse, not the fast one.
- **torch on cu130** (cu128 wheels dropped); FA3 is Hopper-only, FA4 targets B200 → **SDPA is the
  default on sm_120**; build SageAttention from source. **Never tensor-parallel these two cards.**
- ⚠ **NVFP4 is out for us**: CUTLASS block-scaled FP4 gated to `sm_100a`, and a same-rig test found
  it **discarding the I2V reference image**. Our whole pipeline is image-conditioned.
- ⚠ **HunyuanVideo 1.5's SSTA cannot run on Blackwell** (`-arch=sm_90a` hardcoded).

## ⭐ The strategic finding

The open-vs-closed gap is **not** in faces or anatomy — parity there, and open *wins* multi-view
consistency. It is in **camera control, dynamic attributes and audio**. Two of those we solve by
building the shot rather than prompting it; the third just arrived under Apache-2.0.
On MSAVBench an **LTX-2.3 keyframe-then-animate pipeline scores 72.63 vs Sora 2's 71.19**.
⚠ One benchmark is not proof and this field's benchmarks have a bad record — but the architecture
it rewards is the one we designed. **The leverage is in the shot list, the keyframe, the continuity
discipline and the cut — the four stages that are not the video model.**

## Next steps — REVISED after Bob's 2026-07-31 decisions

~~Korean/Hindi lip-sync test~~ — **dropped, English only.** The old step 1 no longer exists.

1. **BLOCKED ON BOB:** run the installer once in an Administrator PowerShell on the Blackwell PC.
   Nothing else can start until the agent registers.
2. **Inventory (automatic, mine):** the moment it connects — GPU + driver, CUDA toolkits, every
   Python, torch and whether it sees `sm_120`, ComfyUI, ffmpeg, git, free space per drive.
   Bob says CUDA nightly may already be installed; assume nothing, read it.
3. **Install** what the inventory says is missing, over the bridge.
4. **Benchmark:** one fixed prompt through LongCat-Avatar / Wan 2.2 / LTX-2.3 → replace every
   `estimated` row in the claim ledger with our own measured s-per-video-second, peak VRAM, keep rate.
5. **Cast one actor** in Flow — face, bible, wardrobe — and prove it survives four rooms as stills
   before any video is rendered. Voice spec sheet goes to the VA for ElevenLabs at the same time.
6. **The runner**, then **the 60-second trailer** cut to the reference's grammar, mastered to −14 LUFS.

## Notes
- `FORENSICS.md` = everything measured on the file. `NOTES-verified.md` = primary sources I fetched
  and read myself (licences, model cards, HF download counts).
- ⚠ DaVinci Resolve free **on Linux cannot import or export H.264/H.265** — keep the edit in DNxHR
  and deliver with ffmpeg. Film grain / noise reduction / magic mask are Studio-only ($295).
- Reddit was unreachable to every crawler route tried, so no community sentiment is in this research.
