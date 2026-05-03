$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs" -Headers $headers -Method Post -Body '{"content":"dGVzdA==","encoding":"utf-8"}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Blob SHA: $($blobResp.sha)"

$body = '{"tree":[{"path":"test.txt","mode":"100644","type":"blob","sha":"' + $blobResp.sha + '"}]}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Write-Host "Creating tree..."
$url = "https://api.github.com/repos/$owner/$repo/git/trees"
try {
    $webResp = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body $bytes -ContentType "application/json" -TimeoutSec 15
    $resp = $webResp.Content | ConvertFrom-Json
    Write-Host "Tree SHA: $($resp.sha)"
} catch {
    $ex = $_.Exception
    if ($ex.Response) {
        $status = [int]$ex.Response.StatusCode
        $stream = $ex.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $bodyErr = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $status] $bodyErr"
    }
}

Start-Sleep -Seconds 1

Write-Host "`nUpdating ref..."
$refBody = '{"ref":"refs/heads/main","sha":"' + $blobResp.sha + '"}'
$refBytes = [System.Text.Encoding]::UTF8.GetBytes($refBody)
try {
    $webResp = Invoke-WebRequest -Uri "https://api.github.com/repos/$owner/$repo/git/refs/heads/main" -Headers $headers -Method Patch -Body $refBytes -ContentType "application/json" -TimeoutSec 15
    Write-Host "Ref update status: $($webResp.StatusCode)"
} catch {
    $ex = $_.Exception
    if ($ex.Response) {
        $status = [int]$ex.Response.StatusCode
        $stream = $ex.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $bodyErr = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $status] $bodyErr"
    }
}