-- ai-film-bridge — control + analytics channel between this server and Bob's Blackwell PC.

CREATE TABLE IF NOT EXISTS agents (
  id            TEXT PRIMARY KEY,          -- machine id chosen at install
  hostname      TEXT,
  os            TEXT,
  agent_version TEXT,
  first_seen    INTEGER,
  last_seen     INTEGER,
  specs_json    TEXT                        -- filled by the inventory job
);

CREATE TABLE IF NOT EXISTS jobs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id    TEXT,
  label       TEXT,
  kind        TEXT DEFAULT 'shell',         -- shell | inventory | render
  command     TEXT,
  status      TEXT DEFAULT 'queued',        -- queued | running | done | failed | cancelled
  created_at  INTEGER,
  started_at  INTEGER,
  finished_at INTEGER,
  exit_code   INTEGER,
  stdout      TEXT,
  stderr      TEXT,
  truncated   INTEGER DEFAULT 0,            -- 1 = output was cut; original byte counts go in stdout footer
  timeout_s   INTEGER DEFAULT 900
);
CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status, id);

-- machine telemetry, one row per heartbeat
CREATE TABLE IF NOT EXISTS stats (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id  TEXT,
  ts        INTEGER,
  gpu_json  TEXT,       -- [{idx,name,util,mem_used_mb,mem_total_mb,temp_c,power_w}]
  cpu_pct   REAL,
  ram_used_mb INTEGER,
  ram_total_mb INTEGER,
  disk_json TEXT        -- [{drive,free_gb,total_gb}]
);
CREATE INDEX IF NOT EXISTS stats_ts ON stats(ts);

-- the render ledger: one row per generated clip. This is the analytics Bob asked for.
CREATE TABLE IF NOT EXISTS renders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            INTEGER,
  shot          TEXT,      -- e.g. "S04" from the shot list
  model         TEXT,      -- LTX-2.3 / Wan2.2 / LongCat-Avatar / MOVA
  resolution    TEXT,
  frames        INTEGER,
  fps           INTEGER,
  video_seconds REAL,      -- frames / fps
  gpu_seconds   REAL,      -- wall time on the GPU
  peak_vram_mb  INTEGER,
  gpu_name      TEXT,
  kept          INTEGER,   -- 1 kept, 0 binned, NULL not yet judged
  seed          TEXT,
  notes         TEXT
);
CREATE INDEX IF NOT EXISTS renders_ts ON renders(ts);

-- every number/claim stated to Bob, with where it came from and whether it is measured yet.
CREATE TABLE IF NOT EXISTS ledger (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER,
  topic   TEXT,
  claim   TEXT,
  value   TEXT,
  source  TEXT,
  status  TEXT DEFAULT 'estimated'   -- estimated | measured | verified | corrected | refuted
);

-- one row per agent, overwritten constantly: what the machine is doing RIGHT NOW
CREATE TABLE IF NOT EXISTS live (
  agent_id   TEXT PRIMARY KEY,
  ts         INTEGER,
  job_id     INTEGER,
  label      TEXT,
  elapsed_s  INTEGER,
  task       TEXT,      -- download | render | install | shell
  item       TEXT,      -- the file or shot being worked on
  source     TEXT,      -- where it is coming from
  dest       TEXT,      -- where it is being written
  done_bytes INTEGER,
  total_bytes INTEGER,
  rate_bps   REAL,
  gpu_json   TEXT,
  tail       TEXT       -- last lines of the running job's output
);
