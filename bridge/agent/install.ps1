# ai-film-bridge installer — run once, in an ADMINISTRATOR PowerShell, on the Blackwell PC.
#
#   $env:AFS_TOKEN='<agent token>'
#   iwr -useb https://raw.githubusercontent.com/oliveroliver10816/ai-film-studio/main/bridge/agent/install.ps1 | iex
#
# Installs the agent to C:\ai-film-bridge, registers it to start at logon, and starts it now.
# There is no secret in this file: the token arrives through the environment variable above.

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$BridgeUrl = 'https://ai-film-bridge.fleet-fefsba.workers.dev'
$AgentUrl  = 'https://raw.githubusercontent.com/oliveroliver10816/ai-film-studio/main/bridge/agent/agent.ps1'
$Root      = 'C:\ai-film-bridge'

if (-not $env:AFS_TOKEN) {
  Write-Host ''
  Write-Host '  Missing token. Run this first, on the same line:' -ForegroundColor Yellow
  Write-Host '    $env:AFS_TOKEN = ''<the token Claude gave you>''' -ForegroundColor Yellow
  Write-Host ''
  return
}

$admin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
         ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
  Write-Host ''
  Write-Host '  Not running as Administrator.' -ForegroundColor Yellow
  Write-Host '  Close this window, right-click PowerShell, "Run as administrator", and paste again.' -ForegroundColor Yellow
  Write-Host ''
  return
}

Write-Host ''
Write-Host '  ai-film-bridge installer' -ForegroundColor Cyan
Write-Host '  ------------------------'

New-Item -ItemType Directory -Path $Root -Force | Out-Null

$agentId = ($env:COMPUTERNAME).ToLower() + '-' + ([guid]::NewGuid().ToString('N').Substring(0, 4))
$cfgPath = Join-Path $Root 'config.json'
if (Test-Path $cfgPath) {
  # keep the same identity across re-installs so the history stays on one machine row
  $agentId = (Get-Content $cfgPath -Raw | ConvertFrom-Json).agent_id
  Write-Host ('  reusing existing agent id ' + $agentId)
}

@{ url = $BridgeUrl; token = $env:AFS_TOKEN; agent_id = $agentId } |
  ConvertTo-Json | Set-Content -Path $cfgPath -Encoding UTF8
Write-Host ('  config written -> ' + $cfgPath)

$agentPath = Join-Path $Root 'agent.ps1'
Invoke-WebRequest -Uri $AgentUrl -OutFile $agentPath -UseBasicParsing
Write-Host ('  agent downloaded -> ' + $agentPath)

# stop an older copy before replacing the task
Get-ScheduledTask -TaskName 'AIFilmBridge' -ErrorAction SilentlyContinue |
  Unregister-ScheduledTask -Confirm:$false -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*ai-film-bridge\agent.ps1*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

$action  = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $agentPath + '"')
$trigger = New-ScheduledTaskTrigger -AtLogOn
$set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartInterval (New-TimeSpan -Minutes 2) -RestartCount 999
$prin    = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) `
  -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName 'AIFilmBridge' -Action $action -Trigger $trigger `
  -Settings $set -Principal $prin -Description 'AI Film Studio bridge agent' | Out-Null
Write-Host '  scheduled task registered (starts again at every logon)'

Start-Process -FilePath 'powershell.exe' `
  -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', ('"' + $agentPath + '"') `
  -WindowStyle Hidden
Write-Host '  agent started' -ForegroundColor Green

Write-Host ''
Write-Host ('  This machine is now ' + $agentId) -ForegroundColor Cyan
Write-Host '  Nothing else to do. The dashboard will show it within a few seconds.'
Write-Host ('  Log file: ' + (Join-Path $Root 'agent.log'))
Write-Host ''
Write-Host '  To remove it later:' -ForegroundColor DarkGray
Write-Host '    Unregister-ScheduledTask -TaskName AIFilmBridge -Confirm:$false; Remove-Item C:\ai-film-bridge -Recurse -Force' -ForegroundColor DarkGray
Write-Host ''
