param(
  [Parameter(Mandatory=$true)]
  [string]$ApiBase
)

Write-Host "Checking health at $($ApiBase)/api/health"
try {
  $health = Invoke-RestMethod -Uri "$ApiBase/api/health" -Method Get -ErrorAction Stop
  Write-Host "Health response:" ($health | ConvertTo-Json -Depth 3)
} catch {
  Write-Host "Health check failed:" $_.Exception.Message -ForegroundColor Red
  exit 2
}

Write-Host "Sending sample consultation POST to $($ApiBase)/api/consultations"
try {
  $body = @{ name = 'Automated Check'; email = 'no-reply@example.com'; phone = '0000000000'; questions = 'Test from PS check' } | ConvertTo-Json
  $resp = Invoke-RestMethod -Uri "$ApiBase/api/consultations" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  Write-Host "POST response:" ($resp | ConvertTo-Json -Depth 3)
} catch {
  Write-Host "POST failed:" $_.Exception.Message -ForegroundColor Red
  exit 3
}

Write-Host "Done"
