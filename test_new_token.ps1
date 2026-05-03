$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$url = "https://api.github.com/rate_limit"
$resp = Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 10
$resp.resources.core