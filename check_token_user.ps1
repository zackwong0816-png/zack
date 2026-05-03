$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$resp = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -TimeoutSec 15
$resp | ConvertTo-Json -Depth 5