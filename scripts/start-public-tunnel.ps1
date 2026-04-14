$ErrorActionPreference = "Stop"

$runtimeDir = "C:\personalassistant\.runtime"
$tunnelScript = "C:\personalassistant\scripts\start-tunnel.cmd"
$tunnelLog = Join-Path $runtimeDir "ssh-tunnel.out.log"
$tunnelErrLog = Join-Path $runtimeDir "ssh-tunnel.err.log"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
Set-Content -Path $tunnelLog -Value ""
Set-Content -Path $tunnelErrLog -Value ""

Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $tunnelScript -WindowStyle Hidden

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
