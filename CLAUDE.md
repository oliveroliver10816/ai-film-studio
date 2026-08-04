# ai-film-studio — reference teardown + the free local film pipeline

## ⭐ CHAPTER ONE — the Seedance shot package (2026-08-03)

**LIVE: https://oliveroliver10816.github.io/ai-film-studio/chapter-one/** (noindex)
`chapter-one/index.html` + `chapter-one/shots.js`. **12 shots × 10.0 s = 120 s, 13 spoken lines,
2 characters.** *THE ARRANGEMENT — Chapter One: "The Signature"* is the full scene the 60-second
trailer's four lines were cut from, same locked cast, one room, one night.

**Bob's decisions that set this up (2026-08-02/03) — do not re-litigate:**
- 🛑 **NEVER suggest fal.ai free credits again.** He signed up himself; **there are none.** The
  July `seedance-batch` note claiming otherwise is WRONG. See memory [[fal-ai-has-no-free-credits]].
- **Route = Dola** (serves **Seedance 2.0 fast**, watermarked, 10 s clips). **His VA creates several
  accounts**, and **we build a pooled driver like `veo-flow-multi`** to drive them.
- 🛑 **NO discussion of buying credits / the paid API / any spend** until the capability test returns
  a result. Test first, then decide.
- ⚠ The watermark-removal method from the tutorial and the bulk-account-farming tools are **both
  declined** and stay declined.

**⭐ The prompt grammar came from ByteDance's own doc**, not from guesswork:
*Dreamina Seedance 2.5 Prompt Guide*, `bytedance.larkoffice.com/docx/A88jd0B47oAd8zxWp5ycZFMfnxh`.
It is **login-gated** — a plain fetch 302s to `accounts.larkoffice.com`; it opens with a **guest
cookie jar** (`curl -c/-b`, hit the doc URL once with `?from=from_copylink`, then again). The doc is
server-rendered into `window.DATA.clientVars` as a **Lark `block_map`** — walk `children` for prose
and `cell_set[rowId+colId].block_id` for tables. **Archived at `docs/seedance-prompt-guide.txt`
(+ `-tables.txt`).** ⚠ SSR gave 239 blocks and the tail (backward video-extension) is cut off.
- **Formula:** Subject + Action → Scene → Visual Style → Camera → Audio.
- ⭐ **Syntax: music `( )` · SFX `< >` · dialogue `{ }` · subtitles `【 】`.**
- ⭐ **Dialogue control = language + regional variety/accent + delivery style + speaker + `{line}`.**
- ⭐ **`0-3 seconds: … 3-7 seconds: …` with an explicit `End state:` per range** is the lever that
  places a line inside a 10 s clip. Ranges must be consecutive and non-overlapping.
- **References must be mapped one-by-one** (`@Image 1 defines X's face only. Do not use its
  background.`) — never "@Images 1-4 define four characters respectively".
- ⚠ **The guide uses `< >` for BOTH sound effects AND character placeholders.** Our prompts write
  character names in plain capitals and reserve `< >` for SFX only. Do not mix the two.

### ⭐ STRUCTURED (JSON) PROMPT LAYER — added 2026-08-04

Trigger: Bob sent `x.com/voyzlab/status/2084332023544455378` — same model, same WW1-trench scene,
plain-text vs JSON prompt, claiming the paragraph version **dropped a gloved hand out of the scene**
while the JSON version kept it. Fix proposed: give small elements their **own field**
(`object_interaction`).

⚠ **Watched the clip frame by frame — the demo does NOT clearly show its own claim.** Both halves
carry a hand early and both lose it later. **Treat the claim as unproven.** The *technique* is still
right, for an independent reason: a labelled field cannot be skimmed past, and **ByteDance's own guide
abandons natural language the moment things get complex**, switching to `[Characters]` / `[Props]` /
`[Scenes]` / `[Stage 1]` blocks. JSON is that instinct taken all the way.

**Our schema is a superset — the post has 6 fields, we ship 12.** It carries scene · subject · action ·
camera · lighting · object_interaction. **It has NO audio, NO dialogue, NO time structure, NO
reference-image roles, NO continuity lock, NO exclusions, NO grade** — i.e. it omits precisely the
things that broke our earlier runs. Ours adds all of those, plus **`physics` and `must_persist` per
object** and an explicit **`end_state`**.

⚠ **Action rows are parsed from the video prompt's own `N-M seconds:` ranges**, and dialogue/music/SFX
come from `lines`/`music`/`sfx` — so the prose prompt and the JSON prompt **cannot drift apart**. Same
rule as before: never hand-author a second copy of anything. 37 action rows, 12 carrying `end_state`,
avg 7,689 chars per JSON prompt.

⭐ **FIRST GENERATION IS THE A/B, NOT A SHOT.** Run **S07 (THE SIGNATURE)** twice — plain-text prompt
vs JSON prompt, nothing else changed — and judge only whether **the hand and the nib survived**. S07 is
a hand + pen + paper + small-scale physics at the edge of frame: the exact failure mode the post
describes and the most fragile shot in the film. Two generations settle it for our own pipeline
instead of trusting a 618-follower account's screenshot.

**Build rules encoded in the package (each one is a known tell):** no readable text in any frame
(4 shots involve a contract — the folder stays shut, pages sit at 40° to the lens, and the one fact
the audience needs is **read aloud** in S09); no gesturing, hands on the table or at sides; **11 of
12 shots locked off**, one slow push (S09), one handheld drift (S11); the identity/camera/text LOCK
block restated in **all twelve** prompts because the model has no memory between clips; compose for
2.39:1 and crop in ffmpeg rather than asking for bars.

⚠ **The mole is REMOVED from Elena's spec** (it drifted between Flow generations). Adrian's eyebrow
scar stays — it held 3 of 4 and it is how you know the right man turned up.
⚠ **Audio trade, stated on the page:** music is written into all 12 prompts as Bob asked, but
generated score is baked into the same track as the dialogue, so 12 independently-scored clips will
not match and cannot be re-scored without losing the dialogue. Fallback is **one deleted `( )` line
per prompt** → clips return dialogue + ambience + SFX only, and one continuous bed goes under in the
edit.
⚠ **Dialogue, music and SFX are declared ONCE per shot** in `lines`/`music`/`sfx` and the Audio block
is **assembled by `AUDIO(this)`**. The first draft hand-wrote them into the prompt bodies and the
gate caught **20 divergences** between what the page displayed and what the prompt actually said.
Never hand-write an audio line into a prompt body again.

**QA gate, run on the LIVE URL:** 12 cards · 24 copy buttons · 24 prompt blocks · 12 strip segments ·
**0 console errors** · no horizontal overflow at 1440 or 390 · **47 contrast combos, 0 WCAG failures**
(alpha composited against the first opaque ancestor) · clipboard read back and asserted to contain the
real S11 video prompt (2,939 chars) · control-character gate clean.

**Generate in this order:** **S11 first** (two speakers, two lines, one beat, one take — if it fails
the ending needs restaging), then **S04 and S10 as a pair** (identical frames 30 s apart = the face
test). Those three answer four of the five test questions before an account's quota is spent.

## ⭐ DOLA RECON — 2026-08-04, done from the public bundle, no account needed

**VA setup sheet LIVE: https://oliveroliver10816.github.io/ai-film-studio/dola-accounts/** (noindex).
Plain-English, no interpretation asked of the VA; she records fields and copies on-screen wording.
Signup URL: `go.websitewizard.tv/yt/dola-seedance2` → **https://www.dola.com/chat/**.

⭐⭐ **CORRECTION — DOLA IS BYTEDANCE'S OWN APP, NOT A RESELLER.** The 2026-08-02 note calling it a
reseller is **WRONG**. Evidence, all from the served page + JS bundle (reachable from this box, 200):
app served from **`sf-flow-web-cdn.ciciai.com/obj/ocean-flow-web-sg/dola_web/`** (Cici = ByteDance's
international assistant), telemetry to **`mcs-sg.ciciai.com`** and **`mon-va.byteoversea.com`**, i18n
from **`starling-oversea.byteoversea.com`**, assets from **`lf-flow-web-cdn.doubao.com`**, and a
literal i18n key **`aiVideo_tag_seedance_2.0_pc": "Seedance 2.0"`**. ⇒ It is **first-party Seedance
from the maker**, which raises the quality expectation, not lowers it.

⚠️⚠️ **ARCHITECTURE: veo-flow-multi's Tier B (auth-harvest + direct API replay) probably does NOT
port.** Two blockers found in the bundle:
- **DPoP** — error paths `dpop_auth_headers_empty_after_retry` / `_error` / `_timeout` (RFC 9449).
  Requests are proof-of-possession signed with a browser-held key, so **copying a cookie or bearer
  token is not enough**; the key is typically a non-extractable CryptoKey.
- **`MessageLimitSharkVerify`** — **Shark** is ByteDance's captcha/risk system, wired to the limit path.
⇒ Plan for **Tier A: in-page automation inside one persisted, logged-in session per account**
(`session.fromPartition('persist:dolaN')`, exactly veo-flow-multi's isolation model), where the page
mints its own DPoP proofs. Parallelism still comes from N windows, which is what we want anyway.
⚠ Confidence: the DPoP/Shark strings are strong evidence they exist in the auth/limit paths; **only a
HAR of a real generation settles whether they gate the generation calls.** Do not assert more.

**Generation is a CHAT TOOL CALL, not a REST endpoint.** Paths: `/chat/async/chunk_stream`,
`/chat/completion`, `/chat/create-image`; API namespaces `/samantha/*` and `/alice/*`; auth via
**ByteDance Passport** (`/passport/web/web_login_success`). Tool keys in the bundle:
`video_generation`, `video_generation_prompt`, `image_generation`, `images_generation`,
`creation_video_upload_file_tool`, `video_upload_file_tool`. ⇒ the driver must speak the streaming
chat protocol and parse tool events. Also present: `web_id`/`device_id` fingerprints and an A/B
service (`/samantha/user/ab/get`) — **so Seedance 2.0 may not appear in every account**; the VA sheet
asks her to check per account.

⚠️ **Passport is the same account system as TikTok and CapCut.** A multi-account ban lands at Passport
level. Relevant because TikTok is still in the portfolio's forward plan (ViralBench). Standing rule
from [[no-free-credit-farming]] holds: **never a Google account that touches Bob's Ads/GSC/personal**,
and **do not reuse the persona Gmails that back our 17 GitHub accounts** — those Gmails are the
recovery path for repos we depend on.

**Start at 3 accounts, not 10** — the free quota per account is unmeasured, and burning identities
before measuring it is waste. The sheet has the VA run one fixed test generation to measure it.

**NOT DONE YET:** the pooled Dola driver. What it needs is now precise — **one logged-in account plus
a HAR of one complete run** (image upload → prompt → generate → download). That single file settles
Tier A vs Tier B and gives the request shapes. No password needed. Nothing generated, no account
created, $0 spent.

---

**Status (2026-08-01): ⭐ A COMPLETE 60-SECOND FILM EXISTS, generated end to end on the Blackwell.**
₹0 spent. Every model Apache-2.0 or MIT.

## ⭐ THE ARRANGEMENT — the film

**WATCH: https://oliveroliver10816.github.io/ai-film-studio/film/**
**PLAN: https://oliveroliver10816.github.io/ai-film-studio/plan/** (from the 61-agent audit)

60.375 s · 1280×704 · 24 fps · **−14.36 LUFS**, true peak −4.5 dBTP · 11.3 MB · h264/aac 48 kHz.
10 sustained shots + 14 flash cuts + title card, cut to the reference film's measured grammar.
Produced unattended overnight while Bob slept, on his instruction to use local TTS and not stop.

**How, in order:** 12 Flow cast images → watermark cropped → 11 kept as references →
**10 keyframes** (7 via **Qwen-Image-Edit 2511** conditioned on an approved face, 3 via
**Qwen-Image 2512** text-to-image, 22.4 s average) → **10 shots** via **Wan 2.2 TI2V-5B**
image-to-video → **4 voice lines** via **Microsoft neural TTS** (`edge-tts`, en-GB-Sonia /
en-GB-Ryan) → ffmpeg cut, montage from tails of existing shots, drawtext title, drone + swell,
loudnorm to −14 LUFS.

⭐ **Going local is what solved character consistency.** The face now comes from a reference
image rather than a description, so it is *carried* between shots instead of re-rolled — which
is exactly the failure that produced a different man in 1 of Bob's 4 Flow headshots.

### Measured this night — replaces the estimates
| | |
|---|---|
| Whole batch, 10 shots | **1,084 s for 53.58 s of film = 20.23 GPU-seconds per video-second** |
| Same model, cold card, 1 shot | 16.23 — **the 25% gap is thermal throttling** |
| ⚠ **GPU temperature** | **93–95 °C peak, 88.4 °C mean**, clocks falling 2,835 → 1,612 MHz |
| Cooldown between shots | a 72 °C target **could not hold it down**; back to 95 °C inside one render |
| Peak VRAM | 55.7 GB (images) / 34.5 GB (video) of 95.6 — **heat is the limit, not memory** |
| Keyframe cost | 12–36 s, 22.4 s average |
| Model integrity | **8 of 8 files match the publisher's SHA-256** |

⚠⚠ **THERMALS ARE THE TOP OPEN ITEM.** Case airflow / fan curve should be looked at before any
run longer than an hour. A 10-minute film at this rate is ~3.4 h of GPU, all at the thermal limit.

### The audit
61 agents over six dimensions, **54 findings raised, 52 refuted by per-finding adversarial
review, 2 survived** — both fixed the same night: (1) cast masters existed only on drive D:,
now backed up to `cast/` + `keyframes/` with a SHA-256 manifest; (2) an interpreted `\a`/`\v`
put BEL/VT bytes into three cells of the live trailer page — fixed, and `publish-gate.sh` now
refuses to publish any file containing a control character.

### Assets in this repo
`film/` the finished mp4 + poster + frame sheets · `cast/` 11 irreplaceable masters + MANIFEST ·
`keyframes/` the 10 approved stills · `plan/` the plan of action · `trailer/` shot list and
prompt book · `bridge/` worker, agent, uploader, runner (`run.py`, `batch.py`, `assemble.py`).

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

## Our own stack on the PC — `D:\aifilm` (built 2026-08-01)

Deliberately **outside** `D:\Vova\...`, which is someone else's existing AI work. Do not modify
or repurpose those installs; build alongside them.

```
D:\aifilm\  ├ comfy\  ├ tools\  ├ models\  ├ hf-cache\  ├ projects\  ├ out\  └ logs\
```

- **ffmpeg** (BtbN GPL build) at `D:\aifilm\tools\ffmpeg`, on the machine PATH.
  ⭐ **NVENC present: `h264_nvenc`, `hevc_nvenc`, `av1_nvenc`** — hardware encode on the Blackwell.
- ⭐ **ComfyUI 0.29.2 portable** at `D:\aifilm\comfy` with **python 3.13.14 + torch 2.13.0+cu130**,
  `arch list` includes **sm_120**, 95.6 GB VRAM seen. This is the environment `video-engine` said we
  would have to build by hand — the official portable ships it. **Vova's old portable is 0.3.59 with
  torch 2.8.0+cu129; ours is the one to use.**
- `HF_HOME` repointed to `D:\aifilm\hf-cache` so future model pulls stay off C:.
- ⚠ **The "CUDA v13.1" install is NOT a toolkit** — the folder holds only `extras` and
  `version.json`. There is **no `nvcc`, no compiler**. Fine for running (torch ships its own
  runtime); it blocks compiling SageAttention or flash-attn. Skipped Visual Studio Build Tools
  deliberately rather than spend 7 GB on an optimisation we have not proven we need.
- ⚠ **Do not judge this machine's bandwidth from a GitHub release download.** GitHub's release CDN
  served ComfyUI at **2.7 MB/s**; HuggingFace served the 17 GB Wan 2.2 set at **34.68 MB/s
  (277 Mbps)** on the same machine minutes later — **12.8× faster**. I quoted the GitHub figure as
  the machine's speed and Bob correctly rejected it. **Always name the source host with a speed.**

## THE ARRANGEMENT — the 60-second trailer (written 2026-08-01)

**LIVE:** https://oliveroliver10816.github.io/ai-film-studio/trailer/ (noindex)
Shot list + prompt book + ElevenLabs voice sheet, in `trailer/index.html`.

Original English story in the reference's genre. Logline: *she married the man who took her
father's company; he signed knowing exactly why.* **Two characters, four spoken lines.**

**Timing is copied from the reference's measured grammar, not invented:**
10 sustained shots **averaging 5.32 s** (reference 5.54) = 53.20 s · **14 flash cuts at 0.293 s**
(reference 0.27) = 4.10 s · 2.70 s title = **60.00 s exactly**.

⭐ **The script is written to exploit what the reference exploits.** Every wide is dark or backlit,
every close-up is one face on a plain field, three shots are hands/objects/silhouette only, and
there are no crowds, no fine hand-work and no readable on-screen text — the four things that still
give generated video away. S02 is deliberately the shot already proven on this machine.

- ⭐ **Cast = a SIX-VIEW TURNAROUND SHEET per character in one image** (Bob's idea, and better than
  my first version's single portrait): front · ¾ left · ¾ right · profile · rear ¾ · full length,
  all from **one generation**, so identity is guaranteed rather than hoped for. Upscale the sheet to
  4K in Flow before download so each view is still ~800 px. 12 single-angle prompts ship as backup.
  ⚠ **The sheet is lit FLAT and NEUTRAL on mid-grey (1:1, no rim, 5600K) — the opposite of every
  other prompt on the page, and deliberate.** A reference face carrying dramatic side light drags
  that light into every shot built from it. My first draft got this wrong.
- ⚠ **Never a face-swap node** — InstantID/PuLID/IP-Adapter FaceID/LatentSync all pull
  non-commercial InsightFace weights.
- **Voice sheet is written for a VA with no judgement calls:** fixed settings (stability 45,
  similarity 80, style 0, speed 0.92), voices chosen by **description not name** because libraries
  differ between accounts, one file per line with the exact filename, and an **audition step before
  the other three lines are made**. ⚠ It states that length comes from pauses not word count, and
  that the same text does not produce the same duration twice.
- Flash montage is mostly **re-used tails of shots already rendered** — fourteen fresh generations
  would be the expensive way to make the least important 4 seconds.
- Master to **−14 LUFS** (the reference sits at −24, ten under platform target — do not copy that).

**Prompt detail is a standing instruction from Bob** — *"the more detailed the prompt is, the more
curated the image output will be"*. Every still prompt is written in a fixed order: subject →
wardrobe → set → light direction, colour temperature and shadow ratio → lens, aperture and focus
point → film stock and grade. Character descriptions are **substituted into each shot prompt at
render time**, so every copied block is self-contained (~2,000 chars) and needs no other context.

## CAST REVIEW — first 12 images, 2026-08-01

Bob generated **12 separate images** in Flow (not the six-view sheet) at **2752×1536**, uploaded
through the link. All pulled back through the bridge and inspected as native-resolution face crops
side by side — not judged from thumbnails.

**ELENA — PASSES. Lock her.** Same bone structure, hair, lip and eyes across front, both
three-quarters, profile and full length. Five usable angles plus the rear = the whole sheet.
- ⚠ **The mole drifts**: below the eye in the front view, beside the mouth in one three-quarter.
  Side is consistent, height is not. **Decision: drop the mole from the spec** — it is decorative,
  it is the least stable feature, and a mole that moves between shots is exactly what an audience
  notices without knowing why.
- ⚠ It sits on her **RIGHT**; our written spec said LEFT. Change the spec, never the images.

**ADRIAN — one image is a DIFFERENT MAN.** `Man_..._0530` has **no eyebrow scar** and a narrower
face. `0530__1_`, `0532` and `0532__1_` agree with each other and carry the scar. **Discard 0530.**
Still needed: one more three-quarter from the other side, generated from `0530__1_` as reference.

⭐ **This is the headline finding: separate generations do not hold a face — 1 in 4 drifted to a
different person.** It is the exact failure a single six-view sheet avoids, and it means *no amount
of automation fixes consistency*; automating this pipeline just produces different faces faster.

⚠ **Every Flow image carries a Gemini watermark** — four-pointed star, ~55 px, bottom-right, about
115 px in from each edge. Must be cropped before use. Our keyframes are re-framed to 1280×704
anyway, so this costs nothing if it is remembered.

## ⭐ THE UPLOAD LINK — files go straight onto the render machine (built 2026-08-01)

⚠ **Bob generates images on a DIFFERENT PC from the Blackwell**, so "save it to D:\aifilm\inbox"
was not usable. Solved without any cloud storage in between:

**Permanent link:** `https://ai-film-bridge.fleet-fefsba.workers.dev/inbox?k=<upload_token>`
(token in `/root/.config/ai-film-bridge.json`). It 302s to whatever the machine's current public
address is.

- **`bridge/uploader/uploader.py` runs ON the PC** (system python 3.12.9, no dependencies) serving a
  drag-and-drop page and writing into `D:\aifilm\inbox\{cast,keyframes,voice}`.
  ⭐ **Raw `PUT` with the filename in the URL, not multipart** — nothing to parse, and it survives
  `cgi` being removed in Python 3.13. Body is written to `.part` and renamed only on a complete
  read, so a dropped connection never leaves a truncated file that looks finished.
- **Exposed by a Cloudflare quick tunnel** (`cloudflared tunnel --url`) — no domain, no DNS, no
  Cloudflare account on the machine, **no inbound port opened**.
  ⚠ **R2 was the first choice and is NOT enabled on the Osanix account** (`code: 10042`), which is
  what pushed this to the better design anyway.
- ⚠ **A quick tunnel's hostname is random and changes on every restart.** The agent reads
  `D:\aifilm\logs\tunnel-url.txt` and reports it with each heartbeat; the worker's `/inbox`
  route redirects to the latest one. That is why the bookmark is permanent and the tunnel is not.
- Scheduled task **`AIFilmInbox`** restarts uploader + tunnel at every logon (alongside
  `AIFilmBridge`).
- Auth: `upload_token` on both the page and every PUT. **403 verified with no key and a wrong key**,
  on the public URL. ⚠ Anyone with the full link can write to the machine — never paste it publicly.
- Path traversal tested with encoded `..%2f`, `..%5c` and `C:%5C` — all contained inside the target
  folder. Tested end to end: browser upload → bytes on disk with an intact PNG header and exact
  size, then the test file removed.

**Blocked on Bob for exactly three things:** the two turnaround sheets from Flow, the voice audition
pick, and then ten keyframes. Everything else runs over the bridge unattended.

Page QA: 25 strip segments summing to **60.00**, copy-to-clipboard verified against the real
clipboard, **0 WCAG AA contrast failures**, 0 console errors, no overflow at 1440 or 390.

## ⭐ FIRST RENDER — measured on our card, 2026-08-01

ComfyUI 0.29.2 running headless at `127.0.0.1:8188`, driven entirely over the bridge.
Workflow: `UNETLoader → ModelSamplingSD3 (shift 8.0) → Wan22ImageToVideoLatent → KSampler
(20 steps, cfg 5.0, euler/simple) → VAEDecode → CreateVideo → SaveVideo`.

| | measured |
|---|---|
| clip | 1280×704, **121 frames @ 24 fps = 5.04 s** |
| wall time | **81.85 s** |
| **GPU seconds per second of video** | **16.23** |
| peak VRAM | **28.8 GB of 95.6 GB — only 30% of the card** |
| output | h264 mp4, 486 KB, verified with ffprobe |

⭐ **A frame was pulled back through the bridge as base64 and looked at** — coherent cinematic
image (woman behind rain-streaked glass, city bokeh, correct framing), not noise. Do this on every
benchmark: a `success` status proves the graph ran, not that the video is real.

⇒ **A 60-second film costs ~16 minutes of GPU at this setting** with one usable take per shot,
~49 minutes at three takes per shot. ⚠ Still an extrapolation until we render a real shot list.

⚠ **The `~205 s/video-second` figure carried from the research is misleading for us** — that was a
**14B** model on an H100. Our **5B** on the PRO 6000 is **16.23**. Never compare across model sizes.
⚠ VRAM at 30% means there is a lot of headroom: bigger model, higher resolution or longer clips are
all available before the card is the limit.

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
