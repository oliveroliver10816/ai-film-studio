# Primary-source facts I verified myself on this box (2026-07-31)

Not from an agent, not from memory — fetched and read directly.

## MOVA — the open joint video+audio model

- HF: `OpenMOSS-Team/MOVA-360p` (87,997 dl/30d, 215 likes) and `OpenMOSS-Team/MOVA-720p`
  (216 dl, 131 likes). Both **`license: apache-2.0`**, both lastModified 2026-02-11/15.
- GitHub `OpenMOSS/MOVA`. Paper arXiv **2602.08794**, published 2026-02-09.
- Abstract, verbatim: *"MOVA employs a Mixture-of-Experts (MoE) architecture, with a total of
  32B parameters, of which 18B are active during inference. It supports IT2VA (Image-Text to
  Video-Audio) generation task."*
- Card, verbatim: *"generates high-fidelity video and synchronized audio in a single inference
  pass"*; *"state-of-the-art performance in multilingual lip-synchronization and
  environment-aware sound effects"*.
- ⭐ **`pyproject.toml` pins `torch` with NO version** — `dependencies = ["torch", "torchvision", …]`,
  `requires-python = ">=3.12"`. **No cu124 pin ⇒ no Blackwell/sm_120 blocker.** (Contrast:
  LongCat pins `torch==2.6.0+cu124`; ByteDance Bernini-R pins `torch==2.5.1+cu124` — both
  need a rebuild on Blackwell.)
- Uses **`yunchang`** ⇒ Ulysses/Ring **sequence parallel**, which is the parallelism that scales
  over PCIe. Right shape for a 2-card rig with no NVLink. Flag: `--cp_size`.
- ⭐ **`scripts/inference_single.py` defaults: `--num_frames 193`, `--fps 24.0`, `--height 720`,
  `--width 1280`, `--num_inference_steps 50`, `--cfg_scale 5.0`.**
  193 ÷ 24 = **8.04 s at 720p24** — the exact shape of the reference film's shots.
- ⚠ **`--ref_path` is REQUIRED and is passed as `image=ref_img`** — it is *single-image
  conditioning* (I2V first frame), **not** multi-photo identity conditioning. MOVA has no
  "give it 3 photos of the actor" feature. **All cross-shot identity has to come from the
  keyframe you feed it.**
- Dialogue goes in the prompt, Veo-style: `… he says, "I would also say that this election…"`.
  Multi-person speech is a documented mode.
- LoRA training table from the repo README, measured by the authors at **360p / 8 s**:

  | Mode | VRAM/GPU | Host RAM | Their hardware | Step time |
  |---|---|---|---|---|
  | Low-resource LoRA, 1 GPU | ≈18 GB | ≈80 GB | RTX 4090 | **600 s** |
  | Accelerate LoRA, 1 GPU | **≈100 GB** | ≥128 GB | H100 | n/a |
  | Accelerate + FSDP, 8 GPU | ≈50 GB | ≥128 GB | H100 | 22.2 s |

  ⚠ **The fast single-GPU LoRA path wants ~100 GB — the PRO 6000 has 96 GB.** It does not fit.
  ⚠ **Host RAM ≥128 GB** for that path; the workstation spec on file is 64 GB.
- ComfyUI: `richservo/comfyui-mova` (announced by the MOVA repo 2026-03-09). Supports both
  360p and 720p, and ⭐ **"Audio injection — feed pre-generated audio (speech, music) to drive
  lip sync"** — so an external TTS can drive it.
- Repo TODO: everything ticked except **Diffusers Integration**.
- Acknowledges Wan, SGLang, diffusers, DiffSynth-Studio, HunyuanVideo-Foley.

## Licences read from the raw file / HF API

| Model | Licence | 30-day downloads | Source |
|---|---|---|---|
| Wan 2.2 (repo LICENSE.txt) | **Apache-2.0**, read in full | — | raw.githubusercontent.com/Wan-Video/Wan2.2 |
| `Wan-AI/Wan2.2-I2V-A14B` | apache-2.0 | 19,654 | HF API |
| `Wan-AI/Wan2.2-S2V-14B` (audio-driven) | apache-2.0 | 67,301 | HF API |
| `Qwen/Qwen-Image` | apache-2.0 | 203,888 | HF API |
| `Lightricks/LTX-2.3` | other (LTX-2 Community) | **2,192,827** | HF API |
| `Lightricks/LTX-2.3-fp8` | other | 791,966 | HF API |
| `ByteDance/Bernini-R` | apache-2.0 | 240 (292 likes) | HF API |
| `OpenMOSS-Team/MOVA-360p` | apache-2.0 | 87,997 | HF API |

⭐ LTX-2.3 is the most-downloaded video model on HF by a wide margin — 2.19 M/30 d, ~111× Wan 2.2 I2V.

## Other models the live download data surfaced

- **`SulphurAI/Sulphur-2-base`** — 424,844 dl/30d, 1,944 likes, #1 text-to-video by downloads.
  An **uncensored finetune of LTX-2.3** (base_model tag confirms). Ships its own prompt enhancer
  GGUF. Inherits LTX licensing questions; not needed for this work but explains the leaderboard.
- **`ByteDance/Bernini-R`** — Apache-2.0, released 2026-06-01, arXiv 2605.22344.
  *"a unified framework for video generation and editing that combines an MLLM-based semantic
  planner with a DiT-based renderer"*; claims first-tier video **editing** vs closed models on
  their own arena. = Wan2.2-T2V-A14B + source-id RoPE + multi-condition APG guidance.
  ⚠ Pins `torch==2.5.1+cu124`, recommends Hopper for FlashAttention-3 → **Blackwell needs work**;
  the community GGUF route (`neuregex/ComfyUI-BerniniR` + `city96/ComfyUI-GGUF`) sidesteps it,
  but GGUF costs speed and kills SageAttention.

## Image side — live HF download data + licences I read myself

Top **image-editing** models by 30-day downloads (the character-posing lever):

| Model | Licence | dl/30d | Note |
|---|---|---|---|
| `black-forest-labs/FLUX.2-dev` | other, **gated** | 1,365,355 | can't even read the LICENSE without HF auth |
| `Qwen/Qwen-Image-Edit-2509` | **apache-2.0** | 412,584 | |
| ⭐ `black-forest-labs/FLUX.2-klein-4B` | **apache-2.0** — I read LICENSE.md, it is the real Apache 2.0 text | 391,796 | **multi-reference editing**, 13 GB VRAM |
| `black-forest-labs/FLUX.2-klein-9B` | other, **gated** | 338,334 | the 9B is NOT Apache — only the 4B is |
| `black-forest-labs/FLUX.1-Kontext-dev` | other | 235,238 | |
| `Qwen/Qwen-Image-Edit-2511` | **apache-2.0** | 228,005 | |
| ⭐ `dx8152/Qwen-Edit-2509-Multiple-angles` | **apache-2.0** | 206,417 | LoRA, 963 likes |

- **FLUX.2-klein-4B card, verbatim:** *"unifies generation and editing in a single compact
  architecture"* · *"supports multi-reference editing capabilities"* · *"Fully open under
  Apache 2.0"* · *"runs on consumer hardware, with as little as 13GB VRAM"*.
  ⇒ BFL now ships an **Apache-2.0, multi-reference** image model. That is a change from the
  FLUX.1-dev non-commercial situation and it matters for us.
- ⭐ **`dx8152/Qwen-Edit-2509-Multiple-angles`, verbatim:** *"There are no trigger words. You can
  control the camera to move up, down, left, and right, as well as rotate it to the left and
  right. You can also look down or up. The camera can be changed to a wide-angle or close-up
  shot."* ⇒ **this is the character-bible tool** — one approved still, then orbit the camera to
  get the same person from every angle a shot list needs.
  ⚠ The author's own note: *"Some people mentioned that the model has an unstable consistency
  issue. I have re-uploaded a version with more training iterations, hoping to fix the
  consistency problem."* Treat consistency as good-not-perfect.

Top **text-to-image**: `Tongyi-MAI/Z-Image-Turbo` — **apache-2.0**, **1,128,069 dl/30d**,
5,058 likes, lastModified 2026-01-30, arXiv 2511.22699. Single-stream DiT foundation model
from Alibaba Tongyi. `Qwen/Qwen-Image` apache-2.0 203,888. `FLUX.1-dev` is `other` (551,655).
`h94/IP-Adapter-FaceID` still pulls 197,692 — identity transfer is alive and well.

⭐ **The whole recommended stack turns out to be Apache-2.0**: Z-Image-Turbo / Qwen-Image →
FLUX.2-klein-4B + Qwen-Image-Edit-2511 + Multiple-angles LoRA → MOVA → Wan 2.2.
No revenue caps, no geographic carve-outs, no gating.

## Container forensics conclusions (mine, measured)

- No **C2PA / `jumb` box** anywhere in the file; no SynthID detectable without Google's
  waitlisted portal. Provenance is either absent or was stripped by the re-encode.
- `tapt` (clean aperture) + `elst` edit lists on both tracks = QuickTime-family NLE export.
- The only identifying metadata is the `vicut` blob in the 736-byte `meta` atom.
