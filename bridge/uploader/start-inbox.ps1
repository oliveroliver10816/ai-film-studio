# Starts the inbox uploader and its Cloudflare quick tunnel, then records the public URL.
# Registered as scheduled task "AIFilmInbox" so it comes back after a reboot.
#
# ⚠ A quick tunnel's hostname is random and CHANGES every restart. That is the trade for needing
# no domain, no DNS and no Cloudflare account on this machine. The current URL is always in
# D:\aifilm\logs\tunnel-url.txt, which is what the bridge reads.

$ErrorActionPreference = 'Continue'
$T  = 'D:\aifilm\tools'
$L  = 'D:\aifilm\logs'
$py = 'C:\Users\Admin\AppData\Local\Programs\Python\Python312\python.exe'
if (-not (Test-Path $py)) { $py = (Get-Command python -ErrorAction SilentlyContinue).Source }
New-Item -ItemType Directory -Path $L -Force | Out-Null

function ReadShared($f) {
  if (-not (Test-Path $f)) { return '' }
  $fs = [IO.File]::Open($f, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
  $sr = New-Object IO.StreamReader($fs)
  $t = $sr.ReadToEnd(); $sr.Dispose(); $fs.Dispose(); return $t
}

Get-CimInstance Win32_Process -Filter "Name='python.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*uploader.py*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$upArgs = @{ FilePath = $py; ArgumentList = @("$T\uploader.py");
             RedirectStandardOutput = "$L\uploader.log"; RedirectStandardError = "$L\uploader.err";
             WindowStyle = 'Hidden' }
Start-Process @upArgs
Start-Sleep -Seconds 5

Remove-Item "$L\tunnel.log", "$L\tunnel.err" -Force -ErrorAction SilentlyContinue
$tnArgs = @{ FilePath = "$T\cloudflared.exe";
             ArgumentList = @('tunnel','--no-autoupdate','--url','http://127.0.0.1:8790');
             RedirectStandardOutput = "$L\tunnel.log"; RedirectStandardError = "$L\tunnel.err";
             WindowStyle = 'Hidden' }
Start-Process @tnArgs

$url = $null
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 3
  $txt = (ReadShared "$L\tunnel.err") + (ReadShared "$L\tunnel.log")
  $m = [regex]::Match($txt, 'https://[a-z0-9-]+\.trycloudflare\.com')
  if ($m.Success) { $url = $m.Value; break }
}

if ($url) {
  [IO.File]::WriteAllText("$L\tunnel-url.txt", $url)
  Write-Output ('TUNNEL_URL=' + $url)
} else {
  [IO.File]::WriteAllText("$L\tunnel-url.txt", '')
  Write-Output 'TUNNEL URL NOT FOUND'
  Write-Output (ReadShared "$L\tunnel.err")
}
