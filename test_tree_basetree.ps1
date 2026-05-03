$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

$refResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/refs/heads/main" -Headers $headers -TimeoutSec 15
$baseTreeSha = $refResp.object.sha
Write-Host "Current HEAD: $baseTreeSha"

$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs" -Headers $headers -Method Post -Body '{"content":"dGVzdA==","encoding":"utf-8"}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Blob SHA: $($blobResp.sha)"

$body = @{
    base_tree = $baseTreeSha
    tree = @(
        @{
            path = "test.txt"
            mode = "100644"
            type = "blob"
            sha = $blobResp.sha
        }
    )
} | ConvertTo-Json -Compress

$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)

$req = [System.Net.HttpWebRequest]::Create("https://api.github.com/repos/$owner/$repo/git/trees")
$req.Method = "POST"
$req.ContentType = "application/json"
$req.Headers["Authorization"] = "token ghp_REDACTED"
$req.ContentLength = $bytes.Length
$req.Timeout = 30000

$sw = [System.IO.StreamWriter]::new($req.GetRequestStream())
$sw.Write($body)
$sw.Close()

try {
    $resp = $req.GetResponse()
    $sr = [System.IO.StreamReader]::new($resp.GetResponseStream())
    $respBody = $sr.ReadToEnd()
    $sr.Close()
    Write-Host "[$($resp.StatusCode)] $respBody"
} catch [System.Net.WebException] {
    $ex = [System.Net.WebException]$_
    $resp2 = $ex.Response
    if ($resp2) {
        $stream = $resp2.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $bodyErr = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $([int]$resp2.StatusCode)] $bodyErr"
    } else {
        Write-Host "[ERROR] $($ex.Message)"
    }
}