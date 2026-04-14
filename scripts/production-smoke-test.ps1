param(
  [Parameter(Mandatory = $true)]
  [string]$FrontendUrl,

  [Parameter(Mandatory = $true)]
  [string]$BackendUrl
)

$ErrorActionPreference = "Stop"

$normalizedFrontend = $FrontendUrl.TrimEnd("/")
$normalizedBackend = $BackendUrl.TrimEnd("/")
$apiBase = if ($normalizedBackend.EndsWith("/api")) { $normalizedBackend } else { "$normalizedBackend/api" }
$email = "prodtest$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@example.com"
$password = "password123"

$frontend = Invoke-WebRequest -Uri $normalizedFrontend -UseBasicParsing -TimeoutSec 30
$health = Invoke-WebRequest -Uri "$apiBase/health" -UseBasicParsing -TimeoutSec 30
$register = Invoke-RestMethod -Uri "$apiBase/auth/register" -Method Post -ContentType "application/json" -Body (@{
  name = "Production Test"
  email = $email
  password = $password
} | ConvertTo-Json) -TimeoutSec 30
$login = Invoke-RestMethod -Uri "$apiBase/auth/login" -Method Post -ContentType "application/json" -Body (@{
  email = $email
  password = $password
} | ConvertTo-Json) -TimeoutSec 30
$dashboard = Invoke-RestMethod -Uri "$apiBase/dashboard/summary" -Headers @{
  Authorization = "Bearer $($login.accessToken)"
} -TimeoutSec 30

[pscustomobject]@{
  frontendStatus = $frontend.StatusCode
  backendHealthStatus = $health.StatusCode
  registeredEmail = $register.user.email
  loginRole = $login.user.role
  dashboardDataKeys = ($dashboard.data.PSObject.Properties.Name -join ",")
} | ConvertTo-Json -Compress
