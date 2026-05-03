$headers = @{ Authorization = "token github_pat_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

Write-Host "=== Checking refs ==="
try {
    $refResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/refs/heads/main" -Headers $headers -TimeoutSec 15
    Write-Host "HEAD SHA: $($refResp.object.sha)"
} catch {
    Write-Host "[ERR refs] $($_.Exception.Message)"
}

Start-Sleep -Seconds 1

Write-Host "`n=== Checking if test.txt blob exists ==="
$testSha = "065c10b8cbe31019fd5dfb0e6a6f4d90489b0931"
try {
    $blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs/$testSha" -Headers $headers -TimeoutSec 15
    Write-Host "Blob exists: $($blobResp.sha)"
} catch {
    Write-Host "[ERR blob] $($_.Exception.Message)"
}

Start-Sleep -Seconds 1

Write-Host "`n=== Creating tree ==="
$body = '{"tree":[{"path":"test.txt","mode":"100644","type":"blob","sha":"' + $testSha + '"}]}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Write-Host "Body bytes: $($bytes.Length)"

$url = "https://api.github.com/repos/$owner/$repo/git/trees"
try {
    $webResp = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body $bytes -ContentType "application/json" -TimeoutSec 15
    Write-Host "[$($webResp.StatusCode)] $($webResp.Content)"
} catch {
    $ex = $_.Exception
    if ($ex.Response) {
        $status = [int]$ex.Response.StatusCode
        $stream = $ex.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $body = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $status] $body"
    } else {
        Write-Host "[ERROR] $($ex.Message)"
    }
}