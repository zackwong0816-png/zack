$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs" -Headers $headers -Method Post -Body '{"content":"dGVzdA==","encoding":"utf-8"}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Blob SHA: $($blobResp.sha)"

$body = '{"tree":[{"path":"test.txt","mode":"100644","type":"blob","sha":"' + $blobResp.sha + '"}]}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Write-Host "Bytes length: $($bytes.Length)"

$req = [System.Net.HttpWebRequest]::Create("https://api.github.com/repos/$owner/$repo/git/trees")
$req.Method = "POST"
$req.ContentType = "application/json"
$req.Headers["Authorization"] = "token ghp_REDACTED"
$req.Headers["Accept"] = "application/vnd.github.v3+json"
$req.ContentLength = $bytes.Length
$req.Timeout = 30000

$reqStream = $req.GetRequestStream()
$reqStream.Write($bytes, 0, $bytes.Length)
$reqStream.Close()

try {
    $res = $req.GetResponse()
    $stream = $res.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $respBody = $reader.ReadToEnd()
    $reader.Close()
    Write-Host "[$($res.StatusCode)] $respBody"
} catch [System.Net.WebException] {
    $ex = [System.Net.WebException]$_
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
}