# ai-film-bridge agent — runs on the Blackwell PC.
# Polls the bridge for work, runs it, posts the output back, and reports machine stats.
# No inbound ports, no firewall rules: every connection is outbound HTTPS.

$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Root    = 'C:\ai-film-bridge'
$CfgPath = Join-Path $Root 'config.json'
$LogPath = Join-Path $Root 'agent.log'
# Own scratch dir rather than $env:TEMP — TEMP is not guaranteed to exist in every context the
# scheduler can start us in, and a null TEMP silently broke every job in testing.
$Work    = Join-Path $Root 'work'
$Version = '1.0.3'

if (-not (Test-Path $CfgPath)) { Write-Error "missing $CfgPath"; exit 1 }
$Cfg = Get-Content $CfgPath -Raw | ConvertFrom-Json

function Log($m) {
  $line = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '  ' + $m
  try {
    if ((Test-Path $LogPath) -and ((Get-Item $LogPath).Length -gt 5MB)) {
      Move-Item $LogPath ($LogPath + '.old') -Force
    }
    Add-Content -Path $LogPath -Value $line -Encoding UTF8
  } catch { }
  Write-Host $line
}

function Post($path, $obj) {
  $body = [System.Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 8 -Compress))
  return Invoke-RestMethod -Uri ($Cfg.url + $path) -Method Post -Body $body `
    -Headers @{ 'x-agent-token' = $Cfg.token } -ContentType 'application/json; charset=utf-8' -TimeoutSec 60
}
function Get2($path) {
  return Invoke-RestMethod -Uri ($Cfg.url + $path) -Method Get `
    -Headers @{ 'x-agent-token' = $Cfg.token } -TimeoutSec 60
}

# ---------------------------------------------------------------- machine stats
function Get-Gpus {
  $exe = (Get-Command nvidia-smi -ErrorAction SilentlyContinue).Source
  if (-not $exe) {
    $fallback = 'C:\Windows\System32\nvidia-smi.exe'
    if (Test-Path $fallback) { $exe = $fallback } else { return @() }
  }
  $q = '--query-gpu=index,name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw'
  $raw = & $exe $q '--format=csv,noheader,nounits' 2>$null
  $list = @()
  foreach ($line in $raw) {
    if (-not $line) { continue }
    $p = $line -split '\s*,\s*'
    if ($p.Count -lt 5) { continue }
    # if/else is a statement, not an expression, so it cannot live inside a hashtable literal
    # in Windows PowerShell 5.1 — compute these first.
    $temp = $null
    if ($p.Count -gt 5) { $temp = [int]($p[5] -replace '[^0-9]', '') }
    $watts = $null
    if ($p.Count -gt 6) { $watts = [double]($p[6] -replace '[^0-9.]', '') }
    $list += [ordered]@{
      idx = [int]$p[0]; name = $p[1]
      util = [int]($p[2] -replace '[^0-9]', '')
      mem_used_mb  = [int]($p[3] -replace '[^0-9]', '')
      mem_total_mb = [int]($p[4] -replace '[^0-9]', '')
      temp_c  = $temp
      power_w = $watts
    }
  }
  return $list
}

function Get-Disks {
  $out = @()
  foreach ($d in (Get-PSDrive -PSProvider FileSystem -ErrorAction SilentlyContinue)) {
    if ($null -eq $d.Free) { continue }
    $total = $d.Used + $d.Free
    if ($total -lt 1GB) { continue }
    $out += [ordered]@{
      drive   = $d.Name
      free_gb = [math]::Round($d.Free / 1GB, 1)
      total_gb= [math]::Round($total / 1GB, 1)
    }
  }
  return $out
}

function Get-OsString {
  # WMI/CIM can be broken on a machine without the rest of it being broken, so never let
  # this decide whether the agent reports in at all.
  try {
    return ((Get-CimInstance Win32_OperatingSystem -ErrorAction Stop).Caption +
            ' / PS ' + $PSVersionTable.PSVersion.ToString())
  } catch {
    return ([Environment]::OSVersion.VersionString + ' / PS ' + $PSVersionTable.PSVersion.ToString())
  }
}

function Send-Stats {
  # Each source is guarded on its own: a dead CIM call must not cost us the GPU numbers.
  $gpu = @(); $disk = @(); $cpu = $null; $ramUsed = $null; $ramTotal = $null
  try { $gpu  = @(Get-Gpus)  } catch { Log ('gpu read failed: '  + $_.Exception.Message) }
  try { $disk = @(Get-Disks) } catch { Log ('disk read failed: ' + $_.Exception.Message) }
  try {
    $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
    $ramUsed  = [int](($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1KB)
    $ramTotal = [int]($os.TotalVisibleMemorySize / 1KB)
    $cpu = (Get-CimInstance Win32_Processor -ErrorAction Stop |
            Measure-Object -Property LoadPercentage -Average).Average
  } catch { Log ('cpu/ram read failed: ' + $_.Exception.Message) }
  try {
    Post '/api/stats' ([ordered]@{
      agent_id     = $Cfg.agent_id
      gpu          = $gpu
      disk         = $disk
      cpu_pct      = $cpu
      ram_used_mb  = $ramUsed
      ram_total_mb = $ramTotal
    }) | Out-Null
  } catch { Log ('stats post failed: ' + $_.Exception.Message) }
}

# ---------------------------------------------------------------- job execution
function Run-Job($job) {
  Log ('job ' + $job.id + ' start: ' + $job.label)
  $stamp   = [guid]::NewGuid().ToString('N').Substring(0, 8)
  $so = ''; $se = ''; $code = -1; $exitNote = ''
  try {
  if (-not (Test-Path $Work)) { New-Item -ItemType Directory -Path $Work -Force | Out-Null }
  $script  = Join-Path $Work ('job' + $job.id + '_' + $stamp + '.ps1')
  $outFile = Join-Path $Work ('job' + $job.id + '_' + $stamp + '.out')
  $errFile = Join-Path $Work ('job' + $job.id + '_' + $stamp + '.err')

  # UTF8 without BOM, so PowerShell does not choke on the first line
  [IO.File]::WriteAllText($script, $job.command, (New-Object Text.UTF8Encoding($false)))

  try {
    $p = Start-Process -FilePath 'powershell.exe' `
      -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $script + '"') `
      -RedirectStandardOutput $outFile -RedirectStandardError $errFile `
      -NoNewWindow -PassThru
    # Touching .Handle caches the process handle. Without it, Windows PowerShell disposes the
    # handle when the process exits and .ExitCode then throws "Process was not started by this
    # object", so a perfectly successful job comes back with no exit code at all.
    try { $null = $p.Handle } catch { }
    $timeout = 900
    if ($job.timeout_s) { $timeout = [int]$job.timeout_s }
    if (-not $p.WaitForExit($timeout * 1000)) {
      try { $p.Kill() } catch { }
      Start-Sleep -Seconds 1
      $code = -9
      Log ('job ' + $job.id + ' KILLED after ' + $timeout + 's')
    } else {
      # Microsoft's own note on the timed overload: it can return before the exit state has been
      # materialised, so the untimed WaitForExit() must follow it. Without this, $p.ExitCode came
      # back $null on Windows PowerShell 5.1 and every successful job was reported as failed
      # even though its output was complete.
      try { $p.WaitForExit() } catch { }
      try { $code = $p.ExitCode } catch { $code = $null; $exitNote = '[AGENT] ExitCode unreadable: ' + $_.Exception.Message }
      if ($null -eq $code) {
        $code = -7
        if (-not $exitNote) {
          $exitNote = '[AGENT] the process finished and its output is complete, but Windows returned no exit code'
        }
      }
    }
  } catch {
    Add-Content -Path $errFile -Value $_.Exception.Message
  }

  if (Test-Path $outFile) { $so = [IO.File]::ReadAllText($outFile) }
  if (Test-Path $errFile) { $se = [IO.File]::ReadAllText($errFile) }
  if ($code -eq -9) { $se = $se + [Environment]::NewLine + '[AGENT] killed on timeout' }
  if ($exitNote) { $se = $se + [Environment]::NewLine + $exitNote }
  Remove-Item $script, $outFile, $errFile -Force -ErrorAction SilentlyContinue

  } catch {
    # Anything unexpected still has to come back as a result, or the job sits on "running"
    # forever and the dashboard lies about what the machine is doing.
    $se = $se + [Environment]::NewLine + '[AGENT] ' + $_.Exception.Message
    $code = -8
  }

  try {
    Post '/api/result' ([ordered]@{ job_id = $job.id; exit_code = $code; stdout = $so; stderr = $se }) | Out-Null
    Log ('job ' + $job.id + ' done, exit ' + $code + ', ' + $so.Length + ' chars out')
  } catch { Log ('result post failed: ' + $_.Exception.Message) }
}

# ---------------------------------------------------------------- main loop
Log ('agent ' + $Version + ' starting as ' + $Cfg.agent_id + ' -> ' + $Cfg.url)
try {
  $hostName = $env:COMPUTERNAME
  if (-not $hostName) { $hostName = [Environment]::MachineName }
  Post '/api/register' ([ordered]@{
    agent_id = $Cfg.agent_id
    hostname = $hostName
    os = (Get-OsString)
    agent_version = $Version
  }) | Out-Null
  Log 'registered'
} catch { Log ('register failed: ' + $_.Exception.Message) }

Send-Stats
$lastStats = Get-Date

while ($true) {
  try {
    $r = Get2 ('/api/poll?agent=' + $Cfg.agent_id)
    if ($r.job) { Run-Job $r.job } else { Start-Sleep -Seconds 5 }
  } catch {
    Log ('poll failed: ' + $_.Exception.Message)
    Start-Sleep -Seconds 20
  }
  if (((Get-Date) - $lastStats).TotalSeconds -ge 60) { Send-Stats; $lastStats = Get-Date }
}
