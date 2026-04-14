$ErrorActionPreference = "Stop"

$runtimeDir = "C:\personalassistant\.runtime"
$backendScript = "C:\personalassistant\scripts\start-backend.cmd"
$tunnelScript = "C:\personalassistant\scripts\start-tunnel.cmd"
$healthUrl = "http://127.0.0.1:5000/api/health"
$tunnelLog = Join-Path $runtimeDir "ssh-tunnel.out.log"
$tunnelErrLog = Join-Path $runtimeDir "ssh-tunnel.err.log"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
Set-Content -Path $tunnelLog -Value ""
Set-Content -Path $tunnelErrLog -Value ""

cmd.exe /c "start ""backend-live"" /min cmd.exe /c $backendScript" | Out-Null

$healthy = $false
for ($i = 0; $i -lt 30; $i += 1) {
  Start-Sleep -Seconds 1

  try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
      $healthy = $true
      break
    }
  } catch {
  }
}

if (-not $healthy) {
  throw "Backend did not become healthy on $healthUrl."
}

cmd.exe /c "start ""public-tunnel"" /min cmd.exe /c $tunnelScript" | Out-Null

$publicUrl = $null
for ($i = 0; $i -lt 45; $i += 1) {
  Start-Sleep -Seconds 1

  if (Test-Path $tunnelLog) {
    $match = Select-String -Path $tunnelLog -Pattern "https://[a-z0-9]+\.lhr\.life" -AllMatches -ErrorAction SilentlyContinue |
      Select-Object -Last 1

    if ($match) {
      $publicUrl = $match.Matches.Value | Select-Object -Last 1
      break
    }
  }
}

if (-not $publicUrl) {
  $errTail = if (Test-Path $tunnelErrLog) { Get-Content $tunnelErrLog -Tail 20 | Out-String } else { "" }
  throw "Tunnel URL was not detected. $errTail"
}

$result = [pscustomobject]@{
  publicUrl = $publicUrl
  apiHealth = "$publicUrl/api/health"
}

$result | ConvertTo-Json -Compress
