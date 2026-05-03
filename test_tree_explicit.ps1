$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs" -Headers $headers -Method Post -Body '{"content":"dGVzdA==","encoding":"utf-8"}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Blob SHA: $($blobResp.sha)"

$body = '{"tree":[{"path":"test.txt","mode":"100644","type":"blob","sha":"' + $blobResp.sha + '"}]}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Write-Host "Bytes: $($bytes.Length)"

$url = "https://api.github.com/repos/$owner/$repo/git/trees"
$errorAction = "Continue"
try {
    $webResp = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body $bytes -ContentType "application/json" -TimeoutSec 15 -ErrorAction Stop
    Write-Host "[$($webResp.StatusCode)] $($webResp.Content)"
    $resp = $webResp.Content | ConvertFrom-Json
    Write-Host "Tree SHA: $($resp.sha)"
} catch [System.Net.WebException] {
    $ex = [System.Net.WebException]$_.Exception
    $resp = $ex.Response
    if ($resp) {
        $status = [int]$resp.StatusCode
        $stream = $resp.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $bodyErr = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $status] $bodyErr"
    } else {
        Write-Host "[ERROR] $($ex.Message)"
    }
} catch {
    Write-Host "[OTHER ERROR] $($_.Exception.GetType().Name): $($_.Exception.Message)"
}