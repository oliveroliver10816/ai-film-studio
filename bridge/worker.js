// ai-film-bridge — control + analytics channel between this server and the Blackwell PC.
//
// Two tokens, deliberately unequal:
//   AGENT_TOKEN — ships inside the installer on Bob's PC. Can register, poll, and post results.
//                 It CANNOT read another machine's job history or the ledger.
//   ADMIN_TOKEN — stays on this server. Enqueues work and reads everything.
//
// Output is never silently shortened: if a job's stdout is capped, `truncated` is set and the
// footer states the original byte count.

const MAX_OUT = 180_000; // chars kept per stream

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const now = () => Math.floor(Date.now() / 1000);

function cap(s) {
  if (typeof s !== "string") return { text: "", cut: 0 };
  if (s.length <= MAX_OUT) return { text: s, cut: 0 };
  const kept = s.slice(0, MAX_OUT);
  return {
    text: kept + `\n\n[BRIDGE] output capped: kept ${MAX_OUT} of ${s.length} characters (${s.length - MAX_OUT} dropped from the tail).`,
    cut: s.length,
  };
}

function agentOK(req, env) {
  const t = req.headers.get("x-agent-token");
  return !!t && !!env.AGENT_TOKEN && t === env.AGENT_TOKEN;
}
function adminOK(req, env, url) {
  const t = req.headers.get("x-admin-token") || url.searchParams.get("k");
  return !!t && !!env.ADMIN_TOKEN && t === env.ADMIN_TOKEN;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type,x-agent-token,x-admin-token",
          "access-control-allow-methods": "GET,POST,OPTIONS",
        },
      });
    }

    // ---------------------------------------------------------------- agent side
    if (p === "/api/register" && request.method === "POST") {
      if (!agentOK(request, env)) return json({ error: "bad agent token" }, 403);
      const b = await request.json();
      if (!b.agent_id) return json({ error: "agent_id required" }, 400);
      const t = now();
      await env.DB.prepare(
        `INSERT INTO agents (id,hostname,os,agent_version,first_seen,last_seen)
         VALUES (?1,?2,?3,?4,?5,?5)
         ON CONFLICT(id) DO UPDATE SET hostname=?2, os=?3, agent_version=?4, last_seen=?5`
      ).bind(b.agent_id, b.hostname || "", b.os || "", b.agent_version || "", t).run();
      return json({ ok: true, server_time: t });
    }

    if (p === "/api/poll" && request.method === "GET") {
      if (!agentOK(request, env)) return json({ error: "bad agent token" }, 403);
      const id = url.searchParams.get("agent");
      if (!id) return json({ error: "agent required" }, 400);
      await env.DB.prepare(`UPDATE agents SET last_seen=?1 WHERE id=?2`).bind(now(), id).run();
      // Self-heal: if the PC rebooted or the agent died mid-job, the row would sit on 'running'
      // forever and the dashboard would misreport what the machine is doing. The agent kills its
      // own work at timeout_s, so anything past timeout_s + 120 is genuinely orphaned.
      await env.DB.prepare(
        `UPDATE jobs SET status='queued', started_at=NULL
          WHERE status='running' AND started_at IS NOT NULL
            AND started_at < ?1 - (COALESCE(timeout_s,900) + 120)`
      ).bind(now()).run();
      const job = await env.DB.prepare(
        `SELECT id,label,kind,command,timeout_s FROM jobs
          WHERE status='queued' AND (agent_id IS NULL OR agent_id=?1)
          ORDER BY id LIMIT 1`
      ).bind(id).first();
      if (!job) return json({ job: null });
      await env.DB.prepare(
        `UPDATE jobs SET status='running', started_at=?1, agent_id=?2 WHERE id=?3 AND status='queued'`
      ).bind(now(), id, job.id).run();
      return json({ job });
    }

    if (p === "/api/result" && request.method === "POST") {
      if (!agentOK(request, env)) return json({ error: "bad agent token" }, 403);
      const b = await request.json();
      const o = cap(b.stdout), e = cap(b.stderr);
      await env.DB.prepare(
        `UPDATE jobs SET status=?1, finished_at=?2, exit_code=?3, stdout=?4, stderr=?5, truncated=?6 WHERE id=?7`
      ).bind(
        b.exit_code === 0 ? "done" : "failed",
        now(), b.exit_code ?? -1, o.text, e.text, (o.cut || e.cut) ? 1 : 0, b.job_id
      ).run();
      return json({ ok: true });
    }

    if (p === "/api/stats" && request.method === "POST") {
      if (!agentOK(request, env)) return json({ error: "bad agent token" }, 403);
      const b = await request.json();
      const t = now();
      await env.DB.prepare(
        `INSERT INTO stats (agent_id,ts,gpu_json,cpu_pct,ram_used_mb,ram_total_mb,disk_json)
         VALUES (?1,?2,?3,?4,?5,?6,?7)`
      ).bind(
        b.agent_id, t, JSON.stringify(b.gpu || []), b.cpu_pct ?? null,
        b.ram_used_mb ?? null, b.ram_total_mb ?? null, JSON.stringify(b.disk || [])
      ).run();
      await env.DB.prepare(`UPDATE agents SET last_seen=?1 WHERE id=?2`).bind(t, b.agent_id).run();
      if (b.specs) {
        await env.DB.prepare(`UPDATE agents SET specs_json=?1 WHERE id=?2`)
          .bind(JSON.stringify(b.specs), b.agent_id).run();
      }
      return json({ ok: true });
    }

    if (p === "/api/render" && request.method === "POST") {
      if (!agentOK(request, env) && !adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const b = await request.json();
      const vs = b.video_seconds ?? (b.frames && b.fps ? b.frames / b.fps : null);
      await env.DB.prepare(
        `INSERT INTO renders (ts,shot,model,resolution,frames,fps,video_seconds,gpu_seconds,peak_vram_mb,gpu_name,kept,seed,notes)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)`
      ).bind(
        now(), b.shot || "", b.model || "", b.resolution || "", b.frames ?? null, b.fps ?? null,
        vs, b.gpu_seconds ?? null, b.peak_vram_mb ?? null, b.gpu_name || "",
        b.kept === undefined ? null : (b.kept ? 1 : 0), b.seed || "", b.notes || ""
      ).run();
      return json({ ok: true });
    }

    // ---------------------------------------------------------------- admin side
    if (p === "/api/enqueue" && request.method === "POST") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const b = await request.json();
      if (!b.command) return json({ error: "command required" }, 400);
      const r = await env.DB.prepare(
        `INSERT INTO jobs (agent_id,label,kind,command,status,created_at,timeout_s)
         VALUES (?1,?2,?3,?4,'queued',?5,?6)`
      ).bind(b.agent_id || null, b.label || "", b.kind || "shell", b.command, now(), b.timeout_s || 900).run();
      return json({ ok: true, id: r.meta.last_row_id });
    }

    if (p === "/api/requeue" && request.method === "POST") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const b = await request.json().catch(() => ({}));
      const r = b.id
        ? await env.DB.prepare(`UPDATE jobs SET status='queued', started_at=NULL WHERE id=?1 AND status='running'`).bind(b.id).run()
        : await env.DB.prepare(`UPDATE jobs SET status='queued', started_at=NULL WHERE status='running'`).run();
      return json({ ok: true, requeued: r.meta.changes });
    }

    if (p === "/api/agents") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const { results } = await env.DB.prepare(`SELECT * FROM agents ORDER BY last_seen DESC`).all();
      return json({ agents: results, server_time: now() });
    }

    if (p === "/api/jobs") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const lim = Math.min(parseInt(url.searchParams.get("limit") || "40", 10), 200);
      const { results } = await env.DB.prepare(
        `SELECT id,agent_id,label,kind,status,created_at,started_at,finished_at,exit_code,truncated,
                substr(command,1,400) AS command FROM jobs ORDER BY id DESC LIMIT ?1`
      ).bind(lim).all();
      return json({ jobs: results });
    }

    if (p.startsWith("/api/job/")) {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const id = parseInt(p.split("/").pop(), 10);
      const job = await env.DB.prepare(`SELECT * FROM jobs WHERE id=?1`).bind(id).first();
      return job ? json({ job }) : json({ error: "not found" }, 404);
    }

    if (p === "/api/stats/latest") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const { results } = await env.DB.prepare(
        `SELECT * FROM stats ORDER BY id DESC LIMIT ?1`
      ).bind(Math.min(parseInt(url.searchParams.get("limit") || "60", 10), 500)).all();
      return json({ stats: results });
    }

    if (p === "/api/renders") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const { results } = await env.DB.prepare(`SELECT * FROM renders ORDER BY id DESC LIMIT 300`).all();
      const agg = await env.DB.prepare(
        `SELECT model,
                COUNT(*) AS clips,
                SUM(video_seconds) AS vid_s,
                SUM(gpu_seconds) AS gpu_s,
                MAX(peak_vram_mb) AS peak_vram,
                SUM(CASE WHEN kept=1 THEN 1 ELSE 0 END) AS kept,
                SUM(CASE WHEN kept IS NOT NULL THEN 1 ELSE 0 END) AS judged
           FROM renders GROUP BY model ORDER BY clips DESC`
      ).all();
      return json({ renders: results, by_model: agg.results });
    }

    if (p === "/api/ledger" && request.method === "POST") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const b = await request.json();
      const rows = Array.isArray(b.rows) ? b.rows : [b];
      for (const r of rows) {
        await env.DB.prepare(
          `INSERT INTO ledger (ts,topic,claim,value,source,status) VALUES (?1,?2,?3,?4,?5,?6)`
        ).bind(now(), r.topic || "", r.claim || "", r.value || "", r.source || "", r.status || "estimated").run();
      }
      return json({ ok: true, inserted: rows.length });
    }

    if (p === "/api/ledger") {
      if (!adminOK(request, env, url)) return json({ error: "forbidden" }, 403);
      const { results } = await env.DB.prepare(`SELECT * FROM ledger ORDER BY id DESC LIMIT 400`).all();
      return json({ ledger: results });
    }

    if (p === "/" || p === "/index.html") {
      return new Response(DASH, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    return json({ error: "not found" }, 404);
  },
};

const DASH = String.raw`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>AI Film Studio — bridge</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%2306080A'/><rect x='5' y='9' width='13' height='14' fill='%23D89B4E'/><path d='M20 13l7-3v12l-7-3z' fill='%235EA8C9'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=JetBrains+Mono:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--ink:#06080A;--ink-2:#0B0F14;--surface:#121820;--surface-2:#18202A;--line:#243039;
--bone:#E9E7DE;--bone-dim:#96A0A6;--bone-faint:#7F8A90;--sodium:#D89B4E;--sodium-hi:#F0BE79;
--steel:#5EA8C9;--alarm:#E2613F;--ok:#7FB47A;
--display:"Big Shoulders Display",Impact,sans-serif;--body:"Instrument Sans",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--bone);font:14px/1.5 var(--body);-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:0 clamp(16px,4vw,34px) 90px}
header{padding:26px 0 18px;border-bottom:1px solid var(--line);margin-bottom:26px;display:flex;flex-wrap:wrap;gap:14px;align-items:baseline;justify-content:space-between}
h1{font:800 clamp(30px,5vw,46px)/0.9 var(--display);letter-spacing:.01em;text-transform:uppercase;margin:0}
h1 em{font-style:normal;color:var(--sodium)}
.sub{font:500 11px/1 var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--bone-faint)}
h2{font:600 12px/1 var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--bone-faint);margin:34px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.gate{max-width:430px;margin:14vh auto;padding:26px;background:var(--surface);border:1px solid var(--line)}
input,textarea,select,button{font:400 13px var(--mono);color:var(--bone);background:var(--ink-2);border:1px solid var(--line);padding:9px 11px;border-radius:0}
input,textarea{width:100%}
textarea{min-height:74px;resize:vertical}
button{background:var(--sodium);color:#160E03;border:0;font-weight:700;cursor:pointer;letter-spacing:.06em;text-transform:uppercase;padding:10px 16px}
button:hover{background:var(--sodium-hi)}
button.ghost{background:transparent;color:var(--bone-dim);border:1px solid var(--line);font-weight:500;text-transform:none;letter-spacing:0}
button.ghost:hover{color:var(--bone);border-color:var(--bone-faint)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:12px}
.card{background:var(--surface);border:1px solid var(--line);padding:14px 15px}
.card .k{font:500 10px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--bone-faint)}
.card .v{font:800 30px/1.05 var(--display);margin-top:9px;color:var(--bone)}
.card .v.small{font:500 15px/1.3 var(--mono)}
.card .n{font:400 11px/1.4 var(--mono);color:var(--bone-faint);margin-top:5px}
table{width:100%;border-collapse:collapse;font:400 12px/1.45 var(--mono)}
th{text-align:left;font-weight:500;font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:var(--bone-faint);padding:8px 10px;border-bottom:1px solid var(--line)}
td{padding:8px 10px;border-bottom:1px solid #151C24;vertical-align:top}
tr:hover td{background:var(--surface)}
.scroll{overflow-x:auto;border:1px solid var(--line);background:var(--ink-2)}
.pill{display:inline-block;padding:2px 7px;font:700 10px/1.5 var(--mono);letter-spacing:.08em;text-transform:uppercase}
.queued{background:#1E2732;color:var(--bone-dim)}.running{background:#3A2E12;color:var(--sodium-hi)}
.done{background:#1B2A1B;color:var(--ok)}.failed{background:#33170F;color:var(--alarm)}
.on{color:var(--ok)}.off{color:var(--alarm)}
.bar{height:6px;background:#1A222B;margin-top:7px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--steel)}
.row{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin:12px 0}
pre{margin:0;padding:13px;background:#040608;border:1px solid var(--line);overflow:auto;max-height:440px;font:400 12px/1.55 var(--mono);color:#C8CFD3;white-space:pre-wrap;word-break:break-word}
a{color:var(--steel)}
.muted{color:var(--bone-faint)}
.err{color:var(--alarm);font:400 12px var(--mono)}
.quick{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}
.quick button{background:transparent;border:1px solid var(--line);color:var(--bone-dim);font:400 11px var(--mono);text-transform:none;letter-spacing:0;padding:6px 10px}
.quick button:hover{color:var(--sodium);border-color:var(--sodium)}
@media(max-width:640px){.card .v{font-size:24px}}
</style></head><body>

<div id="gate" class="gate">
  <div class="sub" style="margin-bottom:12px">AI Film Studio — bridge</div>
  <p class="muted" style="font:400 13px var(--body);margin:0 0 14px">Admin token required.</p>
  <input id="tok" type="password" placeholder="admin token" autocomplete="off">
  <div class="row"><button onclick="unlock()">Open</button><span id="gerr" class="err"></span></div>
</div>

<div class="wrap" id="app" style="display:none">
<header>
  <div>
    <h1>Bridge <em>online</em></h1>
    <div class="sub" id="stamp">—</div>
  </div>
  <div class="row" style="margin:0">
    <button class="ghost" onclick="load()">Refresh</button>
    <button class="ghost" onclick="localStorage.removeItem('afs_k');location.reload()">Lock</button>
  </div>
</header>

<h2>Machine</h2>
<div class="cards" id="machine"></div>

<h2>Render ledger — measured, not estimated</h2>
<div class="cards" id="rstats"></div>
<div class="scroll" style="margin-top:12px"><table id="rtab"><thead><tr>
<th>#</th><th>Shot</th><th>Model</th><th>Res</th><th>Video s</th><th>GPU s</th><th>s/video-s</th><th>Peak VRAM</th><th>Kept</th></tr></thead><tbody></tbody></table></div>

<h2>Send a command to the PC</h2>
<div class="quick" id="quick"></div>
<textarea id="cmd" placeholder="PowerShell, run on the Blackwell box"></textarea>
<div class="row">
  <input id="label" style="max-width:250px" placeholder="label (optional)">
  <button onclick="send()">Queue it</button>
  <span id="serr" class="err"></span>
</div>

<h2>Jobs</h2>
<div class="scroll"><table id="jtab"><thead><tr>
<th>#</th><th>Label</th><th>Status</th><th>Exit</th><th>Took</th><th>Command</th><th></th></tr></thead><tbody></tbody></table></div>
<div id="out" style="margin-top:14px"></div>

<h2>Claim ledger — every number, and whether it is measured yet</h2>
<div class="scroll"><table id="ltab"><thead><tr>
<th>Topic</th><th>Claim</th><th>Value</th><th>Status</th><th>Source</th></tr></thead><tbody></tbody></table></div>
</div>

<script>
const K=()=>localStorage.getItem('afs_k')||'';
const H=()=>({'x-admin-token':K(),'content-type':'application/json'});
async function api(p,opt={}){const r=await fetch(p,{...opt,headers:H()});if(!r.ok)throw new Error(p+' → '+r.status);return r.json()}
function unlock(){const v=document.getElementById('tok').value.trim();if(!v)return;localStorage.setItem('afs_k',v);
  fetch('/api/agents',{headers:{'x-admin-token':v}}).then(r=>{if(r.ok){show()}else{document.getElementById('gerr').textContent='rejected';localStorage.removeItem('afs_k')}})}
function show(){document.getElementById('gate').style.display='none';document.getElementById('app').style.display='';load();setInterval(load,20000)}
const esc=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const ago=t=>{if(!t)return'—';const d=Math.floor(Date.now()/1000)-t;
  if(d<60)return d+'s ago';if(d<3600)return Math.floor(d/60)+'m ago';if(d<86400)return Math.floor(d/3600)+'h ago';return Math.floor(d/86400)+'d ago'};
const n1=v=>v==null?'—':(Math.round(v*10)/10).toLocaleString();

const QUICK=[
 ['GPU','nvidia-smi'],
 ['Disk','Get-PSDrive -PSProvider FileSystem | Select-Object Name,@{n="FreeGB";e={[math]::Round($_.Free/1GB,1)}},@{n="TotalGB";e={[math]::Round(($_.Used+$_.Free)/1GB,1)}} | Format-Table -AutoSize | Out-String'],
 ['Python','python --version; py -0p'],
 ['CUDA','nvcc --version'],
 ['torch','python -c "import torch;print(torch.__version__, torch.version.cuda, torch.cuda.is_available(), torch.cuda.get_device_capability(0) if torch.cuda.is_available() else None)"'],
 ['ComfyUI','Get-ChildItem -Path C:\\,D:\\,E:\\ -Filter ComfyUI -Directory -Depth 3 -ErrorAction SilentlyContinue | Select-Object FullName | Out-String'],
 ['ffmpeg','ffmpeg -version'],
 ['git','git --version'],
];

async function load(){
  document.getElementById('stamp').textContent='updated '+new Date().toLocaleTimeString();
  const q=document.getElementById('quick');
  if(!q.dataset.done){q.innerHTML=QUICK.map((x,i)=>'<button onclick="qk('+i+')">'+esc(x[0])+'</button>').join('');q.dataset.done=1}
  try{
    const [a,s,j,r,l]=await Promise.all([api('/api/agents'),api('/api/stats/latest?limit=1'),api('/api/jobs?limit=40'),api('/api/renders'),api('/api/ledger')]);
    machine(a,s);renders(r);jobs(j);ledger(l);
  }catch(e){document.getElementById('stamp').innerHTML='<span class="err">'+esc(e.message)+'</span>'}
}

function machine(a,s){
  const el=document.getElementById('machine');
  if(!a.agents.length){el.innerHTML='<div class="card"><div class="k">Agent</div><div class="v small off">not connected yet</div><div class="n">Run the installer on the PC. This page fills in by itself.</div></div>';return}
  const g=a.agents[0], live=(a.server_time-g.last_seen)<120;
  const st=s.stats[0]||{}; const gpus=JSON.parse(st.gpu_json||'[]'); const disk=JSON.parse(st.disk_json||'[]');
  let h='<div class="card"><div class="k">Agent</div><div class="v small '+(live?'on':'off')+'">'+(live?'ONLINE':'offline')+'</div>'
   +'<div class="n">'+esc(g.hostname)+' · '+esc(g.os)+'<br>seen '+ago(g.last_seen)+'</div></div>';
  for(const x of gpus){
    const pct=x.mem_total_mb?Math.round(100*x.mem_used_mb/x.mem_total_mb):0;
    h+='<div class="card"><div class="k">'+esc(x.name)+'</div><div class="v small">'+n1(x.mem_used_mb/1024)+' / '+n1(x.mem_total_mb/1024)+' GB</div>'
      +'<div class="bar"><i style="width:'+pct+'%"></i></div>'
      +'<div class="n">util '+(x.util??'—')+'% · '+(x.temp_c??'—')+'°C · '+(x.power_w!=null?n1(x.power_w)+' W':'—')+'</div></div>';
  }
  if(st.ram_total_mb)h+='<div class="card"><div class="k">RAM</div><div class="v small">'+n1(st.ram_used_mb/1024)+' / '+n1(st.ram_total_mb/1024)+' GB</div>'
    +'<div class="bar"><i style="width:'+Math.round(100*st.ram_used_mb/st.ram_total_mb)+'%"></i></div><div class="n">CPU '+(st.cpu_pct!=null?n1(st.cpu_pct)+'%':'—')+'</div></div>';
  for(const d of disk)h+='<div class="card"><div class="k">Drive '+esc(d.drive)+'</div><div class="v small">'+n1(d.free_gb)+' GB free</div>'
    +'<div class="n">of '+n1(d.total_gb)+' GB</div></div>';
  el.innerHTML=h;
}

function renders(r){
  const el=document.getElementById('rstats');
  const clips=r.renders.length;
  const vid=r.renders.reduce((a,x)=>a+(x.video_seconds||0),0);
  const gpu=r.renders.reduce((a,x)=>a+(x.gpu_seconds||0),0);
  const judged=r.renders.filter(x=>x.kept!=null).length, kept=r.renders.filter(x=>x.kept===1).length;
  el.innerHTML=clips?
   '<div class="card"><div class="k">Clips rendered</div><div class="v">'+clips+'</div></div>'
  +'<div class="card"><div class="k">Video produced</div><div class="v">'+n1(vid)+'<span style="font-size:15px"> s</span></div></div>'
  +'<div class="card"><div class="k">GPU time</div><div class="v">'+n1(gpu/60)+'<span style="font-size:15px"> min</span></div></div>'
  +'<div class="card"><div class="k">Cost per video-second</div><div class="v">'+(vid?n1(gpu/vid):'—')+'<span style="font-size:15px"> s</span></div><div class="n">GPU seconds per second of finished video</div></div>'
  +'<div class="card"><div class="k">Keep rate</div><div class="v">'+(judged?Math.round(100*kept/judged)+'%':'—')+'</div><div class="n">'+kept+' kept of '+judged+' judged</div></div>'
  :'<div class="card"><div class="k">Render ledger</div><div class="v small muted">nothing rendered yet</div><div class="n">Every clip lands here with its own GPU seconds and peak VRAM.</div></div>';
  const tb=document.querySelector('#rtab tbody');
  tb.innerHTML=r.renders.map(x=>'<tr><td>'+x.id+'</td><td>'+esc(x.shot)+'</td><td>'+esc(x.model)+'</td><td>'+esc(x.resolution)+'</td>'
   +'<td>'+n1(x.video_seconds)+'</td><td>'+n1(x.gpu_seconds)+'</td><td>'+(x.video_seconds?n1(x.gpu_seconds/x.video_seconds):'—')+'</td>'
   +'<td>'+(x.peak_vram_mb?n1(x.peak_vram_mb/1024)+' GB':'—')+'</td>'
   +'<td>'+(x.kept==null?'<span class="muted">—</span>':x.kept?'<span class="on">kept</span>':'<span class="off">binned</span>')+'</td></tr>').join('')
   ||'<tr><td colspan="9" class="muted">—</td></tr>';
}

function jobs(j){
  document.querySelector('#jtab tbody').innerHTML=j.jobs.map(x=>{
    const took=(x.finished_at&&x.started_at)?(x.finished_at-x.started_at)+'s':(x.status==='running'?'…':'—');
    return '<tr><td>'+x.id+'</td><td>'+esc(x.label||'')+'</td><td><span class="pill '+x.status+'">'+x.status+'</span></td>'
    +'<td>'+(x.exit_code==null?'—':x.exit_code)+'</td><td>'+took+'</td>'
    +'<td class="muted">'+esc((x.command||'').slice(0,90))+'</td>'
    +'<td>'+(x.status==='done'||x.status==='failed'?'<button class="ghost" onclick="peek('+x.id+')">output</button>':'')+'</td></tr>';
  }).join('')||'<tr><td colspan="7" class="muted">no jobs yet</td></tr>';
}

function ledger(l){
  document.querySelector('#ltab tbody').innerHTML=l.ledger.map(x=>{
    const c=x.status==='measured'||x.status==='verified'?'on':(x.status==='refuted'||x.status==='corrected'?'off':'muted');
    return '<tr><td>'+esc(x.topic)+'</td><td>'+esc(x.claim)+'</td><td>'+esc(x.value)+'</td>'
     +'<td class="'+c+'">'+esc(x.status)+'</td><td class="muted">'+esc(x.source)+'</td></tr>';
  }).join('')||'<tr><td colspan="5" class="muted">—</td></tr>';
}

function qk(i){document.getElementById('cmd').value=QUICK[i][1];document.getElementById('label').value=QUICK[i][0]}
async function send(){
  const c=document.getElementById('cmd').value.trim();if(!c)return;
  document.getElementById('serr').textContent='';
  try{await api('/api/enqueue',{method:'POST',body:JSON.stringify({command:c,label:document.getElementById('label').value})});
    document.getElementById('cmd').value='';load()}
  catch(e){document.getElementById('serr').textContent=e.message}
}
async function peek(id){
  const {job}=await api('/api/job/'+id);
  document.getElementById('out').innerHTML='<h2 style="margin-top:6px">Job '+id+' — '+esc(job.label||'')+(job.truncated?' <span class="err">(output capped)</span>':'')+'</h2>'
   +'<pre>'+esc(job.stdout||'')+(job.stderr?'\n\n--- stderr ---\n'+esc(job.stderr):'')+'</pre>';
  document.getElementById('out').scrollIntoView({behavior:'smooth'});
}
if(K())show();
</script></body></html>`;
