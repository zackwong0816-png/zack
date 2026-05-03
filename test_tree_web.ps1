$headers = @{ Authorization = "token github_pat_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs" -Headers $headers -Method Post -Body '{"content":"dGVzdA==","encoding":"utf-8"}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Blob SHA: $($blobResp.sha)"

Start-Sleep -Seconds 1

$body = '{"tree":[{"path":"test.txt","mode":"100644","type":"blob","sha":"' + $blobResp.sha + '"}]}'
Write-Host "Request body: $body"

$url = "https://api.github.com/repos/$owner/$repo/git/trees"
try {
    $webResp = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json" -TimeoutSec 15
    Write-Host "[$($webResp.StatusCode)] $($webResp.Content)"
} catch {
    $webResp = $_.Exception.Response
    if ($webResp) {
        $status = $webResp.StatusCode
        $reader = [System.IO.StreamReader]::new($webResp.GetResponseStream())
        $respBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $status] $respBody"
    } else {
        Write-Host "[ERROR] $($_.Exception.Message)"
    }
}