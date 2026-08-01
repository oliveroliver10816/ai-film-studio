# THE ARRANGEMENT — AI film studio

A complete 60-second film generated end to end on a local RTX PRO 6000. Nothing here is a mock-up.

## Watch / read — the four live pages

| | |
|---|---|
| **[The film](https://oliveroliver10816.github.io/ai-film-studio/film/)** | the finished 60-second cut, plus every measurement behind it |
| **[The plan](https://oliveroliver10816.github.io/ai-film-studio/plan/)** | what happens next, gate by gate, from a 61-agent adversarial audit |
| **[The shot list](https://oliveroliver10816.github.io/ai-film-studio/trailer/)** | cast bibles, ten shots, every prompt, the upload link |
| **[The voice sheet](https://oliveroliver10816.github.io/ai-film-studio/voice/)** | for the VA — four ElevenLabs lines with pause tags |

The [teardown](https://oliveroliver10816.github.io/ai-film-studio/) of the reference film that started it is at the root.

## What is in this repo

```
film/           the finished mp4, poster, frame sheets      ← the deliverable
plan/           plan of action
trailer/        shot list and prompt book
voice/          ElevenLabs sheet for the VA
index.html      the original reference-film teardown

assets-source/  cast/       11 irreplaceable character masters + SHA-256 manifest
                keyframes/  the ten approved stills
assets/         stills measured off the reference film

bridge/         everything that drives the render machine
                worker.js     Cloudflare Worker + D1: jobs, telemetry, ledgers
                agent/        the PowerShell agent that runs on the PC
                uploader/     drop-files-here server + Cloudflare tunnel
                runner/       run.py · batch.py · assemble.py · organise.py

docs/           FORENSICS.md      every measurement taken off the reference film
                NOTES-verified.md primary-source licence facts, read not remembered
tools/          publish-gate.sh   refuses to publish a file with control characters
CLAUDE.md       the full project record — state, decisions, corrections, traps
```

## On the render machine — `D:\aifilm`

```
comfy\    ComfyUI + models        tools\    ffmpeg, cloudflared, uploader, runners
inbox\    files arriving from Bob out\      see below
projects\ workflow JSON           logs\
```

`D:\aifilm\out` holds **finished films in the root and nothing else**. Everything used to make
them sits in a numbered folder in pipeline order: `01_previous_films`, `02_cast`, `03_keyframes`,
`04_clips`, `05_voice`, `06_edit`, `07_tests`, `08_previews`, `09_unsorted`.
