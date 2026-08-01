#!/usr/bin/env python3
"""Tiny upload server that runs ON the Blackwell PC.

Files land straight in D:\\aifilm\\inbox\\<folder>\\ — no cloud storage in between, no size cap
beyond the disk. Exposed to the internet by a Cloudflare quick tunnel, so no port is opened on
the machine and no router is touched.

Raw PUT rather than multipart: the browser sends the File object as the whole body and the
filename travels in the URL. Nothing to parse, and it works identically on every Python 3.x —
which matters because `cgi` was removed in 3.13.
"""

import os, sys, json, re, html
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

ROOT   = os.environ.get("AFS_INBOX", r"D:\aifilm\inbox")
TOKEN  = os.environ.get("AFS_UPLOAD_TOKEN", "")
PORT   = int(os.environ.get("AFS_UPLOAD_PORT", "8790"))
FOLDERS = ("cast", "keyframes", "voice")
SAFE = re.compile(r"[^A-Za-z0-9._-]")
MAX_BYTES = 2 * 1024 * 1024 * 1024  # 2 GB per file, well past anything we send


def safe_name(name: str) -> str:
    name = os.path.basename(unquote(name)).strip()
    name = SAFE.sub("_", name)
    return name[:180] or "unnamed"


class Handler(BaseHTTPRequestHandler):
    server_version = "aifilm-inbox"

    def log_message(self, fmt, *args):
        sys.stdout.write("%s  %s\n" % (self.log_date_time_string(), fmt % args))
        sys.stdout.flush()

    # ---------------------------------------------------------------- helpers
    def _authed(self, qs) -> bool:
        if not TOKEN:
            return True
        supplied = (qs.get("t", [""])[0]) or self.headers.get("x-upload-token", "")
        return supplied == TOKEN

    def _send(self, code, body=b"", ctype="application/json"):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # ---------------------------------------------------------------- routes
    def do_GET(self):
        u = urlparse(self.path)
        qs = parse_qs(u.query)

        if u.path in ("/", "/index.html"):
            return self._send(200, PAGE, "text/html; charset=utf-8")

        if u.path == "/api/list":
            if not self._authed(qs):
                return self._send(403, json.dumps({"error": "bad token"}))
            out = {}
            for f in FOLDERS:
                d = os.path.join(ROOT, f)
                items = []
                if os.path.isdir(d):
                    for n in sorted(os.listdir(d)):
                        p = os.path.join(d, n)
                        if os.path.isfile(p) and not n.lower().endswith(".txt"):
                            items.append({"name": n, "bytes": os.path.getsize(p)})
                out[f] = items
            return self._send(200, json.dumps(out))

        return self._send(404, json.dumps({"error": "not found"}))

    def do_PUT(self):
        u = urlparse(self.path)
        qs = parse_qs(u.query)
        if not self._authed(qs):
            return self._send(403, json.dumps({"error": "bad token"}))

        m = re.match(r"^/put/([a-z]+)/(.+)$", u.path)
        if not m:
            return self._send(400, json.dumps({"error": "expected /put/<folder>/<filename>"}))
        folder, name = m.group(1), safe_name(m.group(2))
        if folder not in FOLDERS:
            return self._send(400, json.dumps({"error": "unknown folder %s" % folder}))

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self._send(400, json.dumps({"error": "bad Content-Length"}))
        if length <= 0:
            return self._send(400, json.dumps({"error": "empty body"}))
        if length > MAX_BYTES:
            return self._send(413, json.dumps({"error": "file too large"}))

        dest_dir = os.path.join(ROOT, folder)
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, name)
        tmp = dest + ".part"

        # Write to .part first so a dropped connection never leaves a truncated file that
        # looks finished. Only a fully received body gets the real name.
        got = 0
        try:
            with open(tmp, "wb") as fh:
                while got < length:
                    chunk = self.rfile.read(min(1024 * 512, length - got))
                    if not chunk:
                        break
                    fh.write(chunk)
                    got += len(chunk)
        except Exception as e:
            try: os.remove(tmp)
            except OSError: pass
            return self._send(500, json.dumps({"error": str(e)}))

        if got != length:
            try: os.remove(tmp)
            except OSError: pass
            return self._send(400, json.dumps({"error": "short upload: got %d of %d bytes" % (got, length)}))

        os.replace(tmp, dest)
        self.log_message("saved %s (%d bytes)", dest, got)
        return self._send(200, json.dumps({"ok": True, "path": dest, "bytes": got}))


PAGE = r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>AI Film Studio — drop files to the render machine</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%2306080A'/><rect x='5' y='9' width='13' height='14' fill='%23D89B4E'/><path d='M20 13l7-3v12l-7-3z' fill='%235EA8C9'/></svg>">
<style>
:root{--ink:#06080A;--ink2:#0B0F14;--surface:#121820;--surface2:#18202A;--line:#243039;
--bone:#E9E7DE;--dim:#96A0A6;--faint:#7F8A90;--sodium:#D89B4E;--hi:#F0BE79;--steel:#5EA8C9;--ok:#7FB47A;--alarm:#E2613F;
--mono:ui-monospace,'JetBrains Mono',Menlo,monospace;--body:system-ui,-apple-system,'Segoe UI',sans-serif}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--bone);font:16px/1.6 var(--body);-webkit-font-smoothing:antialiased}
.wrap{max-width:760px;margin:0 auto;padding:clamp(28px,6vw,64px) clamp(16px,4vw,28px) 80px}
h1{font:800 clamp(30px,7vw,52px)/0.95 var(--body);letter-spacing:-.02em;text-transform:uppercase;margin:0}
h1 span{color:var(--sodium)}
.kick{font:500 11px/1 var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin-bottom:14px}
p{color:var(--dim);max-width:60ch}
.tabs{display:flex;gap:8px;margin:26px 0 14px;flex-wrap:wrap}
.tab{flex:1 1 150px;background:var(--surface);border:1px solid var(--line);color:var(--dim);
 padding:13px 14px;cursor:pointer;font:600 13px var(--body);text-align:left}
.tab b{display:block;font:700 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
.tab[aria-pressed="true"]{border-color:var(--sodium);color:var(--bone);background:var(--surface2)}
.tab[aria-pressed="true"] b{color:var(--sodium)}
#drop{border:1.5px dashed var(--line);background:var(--ink2);padding:clamp(34px,9vw,66px) 22px;text-align:center;cursor:pointer;transition:.15s}
#drop:hover,#drop.over{border-color:var(--sodium);background:var(--surface)}
#drop .big{font:800 22px/1.2 var(--body);text-transform:uppercase;letter-spacing:.01em}
#drop .sm{font:400 13px var(--mono);color:var(--faint);margin-top:10px}
#list{margin-top:20px}
.row{display:flex;align-items:center;gap:12px;padding:11px 14px;border:1px solid var(--line);background:var(--surface);margin-bottom:8px;font:400 13px var(--mono)}
.row .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row .st{font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.st.up{color:var(--sodium)}.st.ok{color:var(--ok)}.st.err{color:var(--alarm)}
.bar{height:3px;background:#1A222B;margin-top:8px}
.bar i{display:block;height:100%;background:var(--sodium);width:0;transition:width .2s}
.done{margin-top:26px;border-left:2px solid var(--ok);background:var(--surface);padding:14px 18px;display:none}
.done p{margin:0;font-size:14px}
h2{font:700 12px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:38px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--line)}
table{width:100%;border-collapse:collapse;font:400 12.5px var(--mono)}
td{padding:7px 10px;border-bottom:1px solid #151C24;color:var(--dim)}
td.sz{text-align:right;color:var(--faint);white-space:nowrap}
.empty{color:var(--faint);font:400 13px var(--mono)}
</style></head><body><div class="wrap">

<div class="kick">Uploads land on the render machine itself</div>
<h1>Drop <span>files</span></h1>
<p>Straight into <code style="color:var(--steel)">D:\aifilm\inbox</code> on the Blackwell. No size limit, nothing stored in between.</p>

<div class="tabs" id="tabs">
  <button class="tab" data-f="cast" aria-pressed="true"><b>cast</b>Character sheets &amp; headshots</button>
  <button class="tab" data-f="keyframes" aria-pressed="false"><b>keyframes</b>One still per shot — s01.png…</button>
  <button class="tab" data-f="voice" aria-pressed="false"><b>voice</b>ElevenLabs wav / mp3</button>
</div>

<div id="drop">
  <div class="big">Drop files here</div>
  <div class="sm">or click to choose — you can select several at once</div>
  <input type="file" id="file" multiple hidden>
</div>

<div id="list"></div>
<div class="done" id="done"><p></p></div>

<h2>Already on the machine</h2>
<div id="have"><span class="empty">loading…</span></div>

<script>
const TOK = new URLSearchParams(location.hash.slice(1)).get('t') || '';
let folder = 'cast';
const $ = s => document.querySelector(s);

document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.setAttribute('aria-pressed', 'false'));
  b.setAttribute('aria-pressed', 'true'); folder = b.dataset.f;
});

const drop = $('#drop'), input = $('#file');
drop.onclick = () => input.click();
input.onchange = () => { send([...input.files]); input.value = ''; };
['dragenter','dragover'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', ev => send([...ev.dataTransfer.files]));

function fmt(b){ return b > 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB'; }

function send(files){
  if(!files.length) return;
  files.forEach(f => one(f, folder));
}

function one(file, fold){
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = '<div class="nm"></div><div class="st up">sending</div>';
  row.querySelector('.nm').textContent = fold + ' / ' + file.name + '  (' + fmt(file.size) + ')';
  const bar = document.createElement('div'); bar.className = 'bar';
  const fill = document.createElement('i'); bar.appendChild(fill);
  const box = document.createElement('div'); box.appendChild(row); box.appendChild(bar);
  $('#list').prepend(box);

  const xhr = new XMLHttpRequest();
  xhr.open('PUT', '/put/' + fold + '/' + encodeURIComponent(file.name) + '?t=' + encodeURIComponent(TOK));
  xhr.upload.onprogress = e => { if(e.lengthComputable) fill.style.width = (100*e.loaded/e.total) + '%'; };
  xhr.onload = () => {
    const st = row.querySelector('.st');
    if(xhr.status === 200){
      st.className = 'st ok'; st.textContent = 'on the machine';
      fill.style.width = '100%';
      const d = $('#done'); d.style.display = 'block';
      d.querySelector('p').textContent = 'Saved to ' + (JSON.parse(xhr.responseText).path || '');
      refresh();
    } else {
      st.className = 'st err';
      let msg = xhr.status;
      try { msg = JSON.parse(xhr.responseText).error || msg; } catch(e){}
      st.textContent = String(msg);
    }
  };
  xhr.onerror = () => { const st = row.querySelector('.st'); st.className = 'st err'; st.textContent = 'connection failed'; };
  xhr.send(file);
}

async function refresh(){
  try{
    const r = await fetch('/api/list?t=' + encodeURIComponent(TOK));
    if(!r.ok) throw new Error(r.status === 403 ? 'This link is missing its key — ask for the full link.' : 'error ' + r.status);
    const d = await r.json();
    let h = '';
    for(const k of ['cast','keyframes','voice']){
      const items = d[k] || [];
      h += '<h2 style="margin-top:20px">' + k + ' — ' + items.length + '</h2>';
      h += items.length
        ? '<table>' + items.map(i => '<tr><td>' + i.name.replace(/[&<>]/g,'') + '</td><td class="sz">' + fmt(i.bytes) + '</td></tr>').join('') + '</table>'
        : '<span class="empty">nothing yet</span>';
    }
    $('#have').innerHTML = h;
  }catch(e){ $('#have').innerHTML = '<span class="empty">' + e.message + '</span>'; }
}
refresh();
</script></div></body></html>
"""


if __name__ == "__main__":
    os.makedirs(ROOT, exist_ok=True)
    for f in FOLDERS:
        os.makedirs(os.path.join(ROOT, f), exist_ok=True)
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("inbox uploader on http://127.0.0.1:%d  ->  %s" % (PORT, ROOT), flush=True)
    print("token required: %s" % ("yes" if TOKEN else "NO — anyone with the URL can write"), flush=True)
    srv.serve_forever()
