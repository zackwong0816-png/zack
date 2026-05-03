$headers = @{ Authorization = "token github_pat_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

Write-Host "Testing blob create..."
$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs" -Headers $headers -Method Post -Body '{"content":"dGVzdA==","encoding":"utf-8"}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Blob SHA: $($blobResp.sha)"

Start-Sleep -Seconds 2

Write-Host "Testing tree create with 1 item..."
$treeResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/trees" -Headers $headers -Method Post -Body '{"tree":[{"path":"test.txt","mode":"100644","type":"blob","sha":"' + $blobResp.sha + '"}]}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Tree SHA: $($treeResp.sha)"