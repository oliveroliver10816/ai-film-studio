# ai-film-bridge

Control + analytics channel between this server and the Blackwell PC. Cloudflare Worker + D1 on the
Osanix account. No inbound ports on the PC: the agent makes outbound HTTPS calls only.

- Dashboard / API: `https://ai-film-bridge.fleet-fefsba.workers.dev`
- Tokens: `/root/.config/ai-film-bridge.json` (`admin_token` never leaves this box; `agent_token`
  goes into the installer command Bob pastes)
- D1: `ai_film_bridge` / `cee4debf-3432-4662-845a-71c830667e85`

## Install on the PC (Administrator PowerShell, once)

```powershell
$env:AFS_TOKEN='<agent token>'
iwr -useb https://raw.githubusercontent.com/oliveroliver10816/ai-film-studio/main/bridge/agent/install.ps1 | iex
```

Installs to `C:\ai-film-bridge`, registers the `AIFilmBridge` scheduled task (restarts at every
logon), and starts the agent immediately. Re-running it keeps the same `agent_id`, so history stays
on one machine row.

## Deploy / operate

```bash
cd /root/workspace/ai-film-studio/bridge
export CLOUDFLARE_EMAIL=$(python3 -c "import json;print(json.load(open('/root/.config/cloudflare/osanix-fleetview.json'))['email'])")
export CLOUDFLARE_API_KEY=$(python3 -c "import json;print(json.load(open('/root/.config/cloudflare/osanix-fleetview.json'))['api_key'])")
npx wrangler deploy --config ./wrangler.json          # ⚠ --config is mandatory, see below
```

Run a command on the PC:

```bash
AD=$(python3 -c "import json;print(json.load(open('/root/.config/ai-film-bridge.json'))['admin_token'])")
U=https://ai-film-bridge.fleet-fefsba.workers.dev
curl -s -X POST -H "x-admin-token: $AD" -H 'content-type: application/json' \
  -d '{"label":"gpu","command":"nvidia-smi"}' $U/api/enqueue
curl -s -H "x-admin-token: $AD" "$U/api/jobs?limit=5"
curl -s -H "x-admin-token: $AD" "$U/api/job/1"
```

## Endpoints

| Method | Path | Token | Purpose |
|---|---|---|---|
| POST | `/api/register` | agent | announce hostname/OS |
| GET  | `/api/poll?agent=` | agent | claim the next queued job |
| POST | `/api/result` | agent | return exit code + output |
| POST | `/api/stats` | agent | GPU/CPU/RAM/disk heartbeat |
| POST | `/api/render` | agent or admin | one row per generated clip |
| POST | `/api/enqueue` | admin | queue a command |
| POST | `/api/requeue` | admin | reset stuck `running` jobs (`{"id":N}` or all) |
| GET  | `/api/agents` `/api/jobs` `/api/job/:id` `/api/stats/latest` `/api/renders` `/api/ledger` | admin | read |
| POST | `/api/ledger` | admin | record a claim (`{"rows":[…]}` accepted) |
| GET  | `/` | admin (in-page) | dashboard |

## Traps found while building this — do not undo

- ⚠ **Deploy only with `--config ./wrangler.json`.** The parent `/root/workspace/wrangler.jsonc`
  hijacks the deploy otherwise.
- ⚠ **`workers.dev` throttles rapid calls from this datacenter IP** with a plain-text
  `error code: 1042` body and a misleading status. Rapid-fire curl checks return nonsense codes
  (404 where the worker demonstrably returns 403). Space API checks ~6 s apart, and never diagnose
  the worker from a burst.
- ⚠ **A newly deployed route takes a few seconds to propagate** — `/api/requeue` 404'd immediately
  after deploy and worked on retry. Retry once before debugging.
- ⚠ **`$env:TEMP` is not guaranteed** in every context the Task Scheduler can start the agent in.
  A null TEMP silently broke every job in testing; the agent now uses `C:\ai-film-bridge\work`.
- ⚠ **`Start-Process -WindowStyle` is Windows-only.** The agent uses `-NoNewWindow`, which works on
  both, so the Linux test copy exercises the real code path unmodified.
- ⚠ **`if/else` cannot sit inside a PowerShell 5.1 hashtable literal.** Compute first, assign after.
- ⚠ **One failed `Get-CimInstance` used to skip registration entirely** — every stat source is now
  guarded on its own so a broken WMI never costs us the GPU numbers.
- ⚠ **A job that dies without posting a result would sit on `running` forever** and the dashboard
  would lie about what the machine is doing. Two guards: the agent always posts a result, and the
  worker requeues anything past `timeout_s + 120` on the next poll.
- Output is capped at 180,000 characters per stream and the footer **states** what was dropped —
  never a silent slice.

## Tested (2026-07-31, against the live worker)

Ran the real `agent.ps1` on this box under `pwsh` (only `$Root` and the executable path swapped;
diffed to prove nothing else changed):

- round trip, exit 0, output returned
- non-zero exit preserved (exit 3) with stderr captured separately
- 2,388,894 chars of stdout → stored 180,092 with an explicit cap footer
- 15 s timeout → process killed, `exit -9`, marked in stderr
- orphaned `running` jobs recovered via `/api/requeue`
- token separation: agent token gets 403 on every admin endpoint, admin token gets 403 on
  `/api/poll`, no token gets 403
- dashboard: 0 console errors, no horizontal overflow at 1440 and 390
