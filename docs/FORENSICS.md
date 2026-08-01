# Reference clip — measured forensics

Source: Google Drive `1iPyYRqQRtPvZbN6DijOK-_Ih3px808Xy`, downloaded 2026-07-31.
Title card: **원수와 결혼하기 — "Marrying my enemy"**. Korean dialogue, burned-in English subtitles.

Everything below is **measured on this box**, not recalled.

## Container

| Property | Value | How measured |
|---|---|---|
| Duration | 88.47 s | ffprobe |
| Resolution | **2032 × 1080** (1.881:1) | ffprobe |
| Container frame rate | 30/1 | ffprobe |
| Total frames | 2,654 | ffprobe |
| Video codec | h264, yuv420p, ~12.0 Mb/s | ffprobe |
| Audio | AAC 44.1 kHz stereo | ffprobe |
| Container brand | `qt` (QuickTime), handler "Core Media" | ffprobe |
| creation_time | 2026-07-25T09:18:56Z | ffprobe |

## ⭐ The editor left its fingerprint

`com.apple.quicktime.artwork` atom contains a JSON blob:

```json
{"data":{"editType":"default","is_use_ai_image_generation":0,"is_use_ai_sound":0,
"is_use_ai_video_generation":0,"is_use_voice_clone":"0","motion_blur_cnt":0,
"musicId":"7377823385822480438","os":"mac","product":"vicut",
"videoId":"4ee4c144-afad-40c0-b519-3cae87a5b497",
"videoParams":{"mu":1,"tx":3,"vs":9}},"source_type":"vicut"}
```

- `"product":"vicut"` / `"source_type":"vicut"` — the piece was **assembled in a consumer NLE on a Mac**, not exported from the generator.
- `musicId` present + `"mu":1` → the score is a **library track from the editor's own music catalogue**, not generated.
- The `is_use_ai_*` flags are all `0`. ⚠ **These almost certainly describe the host app's OWN built-in AI features, not whether AI was used at all** — clips generated elsewhere and imported would still read 0. (Sub-agent verification requested; do not cite these flags as evidence of anything until it lands.)

**What this establishes regardless of the flag question:** the film is a **multi-clip edit**, with an imported score and burned-in titles. Nobody generated 88 seconds in one pass.

## ⭐ Native frame rate is 24, not 30

`mpdecimate` over the whole file: **2,128 unique frames of 2,654 = 80.2%**.
`24 ÷ 30 = 80.0%`. Per-shot spot checks: 80.0%, 81.3%, 82.9%.

⇒ The source clips are **24 fps**; the timeline was set to 30 fps and the export
**duplicated frames** rather than blending or interpolating. 24 fps is the native
output rate of several frontier generators and is *not* what the common open models emit
(Wan 2.2 = 16 fps). Useful fingerprint.

## Shot structure — 17 sustained shots + a flash montage

Cuts detected (scene threshold 0.12), seconds:

```
0 · 8.93 · 10.93 · 15.03 · 24.13 · 26.23 · 30.13 · 35.20 · 45.20 · 50.77 · 60.27 · 67.43 · 72.43
   ── flash montage 72.9 → 81.5 (≈14 flash transitions, 0.1–0.4 s each) ──   86.07
```

After collapsing double-detections on white flashes: **35 cuts in 88.47 s**, avg 2.53 s/cut.

- **15 sustained shots** (≥1.5 s): mean 5.54 s, min 2.00 s, max 10.00 s.
  Durations: 8.93 · 2.00 · 4.10 · 9.10 · 2.10 · 3.90 · 5.07 · **10.00** · 5.57 ·
  **9.50** · 7.16 · 5.00 · 3.73 · 4.60 · 2.40 s.
- **20 flash cuts**: mean 0.27 s, 5.31 s of screen time total, all inside 72.4→81.5 s.

⭐ **Three shots run 9.1 / 9.5 / 10.0 seconds continuous** (a fourth at 8.93 s).
That is past the single-generation limit of every open model and most closed ones.
Either a long-capable generator or a clean extension — no visible seam found in the
35.2→45.2 s shot.

## Cast and recurrence (the character-consistency claim)

| Character | Appears in | Environments | Wardrobe changes |
|---|---|---|---|
| Male lead (black suit) | 7 shots | office wide, corridor, rooftop night ×4 | 2 |
| Female lead, low bun | 4–5 shots | sunset office, office wide, corridor, night office, apartment | 3 |
| Female lead, long hair | 4 shots | doorway close-up, rooftop night ×3 | 2 |
| Older man, grey | 1 shot | study | — |
| Blonde woman | 2 shots | night window | — |
| Boardroom crowd | 1 shot | boardroom | — |

⇒ **Cross-shot identity is genuinely held** for the two leads across different rooms,
lighting and clothes. That is the thing to reproduce.

⚠ Honest caveat: every female face in the piece sits in a narrow band of the same
face-type. Some of the apparent "consistency" is the model's prior collapsing, not
control. Two of the women are only distinguishable by hair.

## What actually reads as expensive (pixel level, 1:1 crops)

1. **Reflections, and they are the strongest signal.** Glass desk with the hand
   meeting its own reflection at the contact point; a mirror-polished floor in a
   wide two-shot carrying both figures plus window mullions; a night window
   carrying a full second view of the actor's face; a mirrored corridor wall.
   Reflections are the classic failure mode — getting them approximately right is
   frontier-class behaviour.
2. **Skin at 1:1.** Visible pores on cheek and nose, vellus hair along the jaw,
   asymmetric brows, natural under-eye shading, a specular break on the lower lip.
   Not the plastic "AI portrait" surface.
3. **Depth.** Bokeh circles scale correctly with distance, foreground blur is
   applied to the *near* plane too, and there is atmospheric haze on the far city.
4. **Visemes.** Across 1.5 s of dialogue the mouth moves through closed-bilabial →
   open vowel with teeth and tongue visible → rounded. Real articulation, jaw drop
   and throat tension included — not a lip-flap.

## The tells that are still there

- **Background text is letterform-shaped noise.** The framed award plaques behind
  the older man contain no readable characters at native resolution.
- **Reflections are learned, not traced.** In the night-window shot the reflected
  face is softer, slightly differently angled, and the hair resolves to mush —
  approximately right, wrong in detail.
- **Crowds are hidden, not solved.** The boardroom is backlit into near-silhouette
  with an anamorphic flare streak across frame; no face there is resolved.
- **Green patch** on the rooftop deck bottom-left of the title shot.
- Hair strands crossing the forehead dissolve into skin instead of casting shadow.

## Finish layer

- FFT radial profile at 40 s decays smoothly to Nyquist with **no cliff** ⇒ not a
  naive bicubic upscale; either near-native or a *learned* upscaler.
- 2032 × 1080 is not a generator output size. It is a **custom canvas** — 1.881:1,
  a slight crop off 16:9 towards cinema.
- Audio: **integrated −24.0 LUFS**, true peak −7.4 dBFS, LRA 10.3 LU. That is
  ~10 dB under YouTube's −14 LUFS target. ⚠ Whatever we ship must be mastered;
  this reference is not.

## Craft, not model — how the piece hides its weaknesses

This is the transferable part, and it is free.

- Only **5 short dialogue lines** in 88 seconds. Everything else is silent performance.
- Weak-point shots are framed away: back-of-head, over-shoulder, silhouette,
  extreme wide where a face is 30 px tall, or blown-out into a white flash.
- Shallow DOF puts one face in focus and dissolves everything that would betray it.
- The last 9 seconds are **~14 flash cuts** at 0.1–0.4 s. Nothing has to survive
  scrutiny at that speed, and it reads as a climax.
- Two-shots are staged so both actors are **in profile facing each other** —
  the pose a generator holds best.
