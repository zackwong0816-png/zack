$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$owner = "zackwong0816-png"
$repo = "zack"

$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/blobs" -Headers $headers -Method Post -Body '{"content":"dGVzdA==","encoding":"utf-8"}' -ContentType "application/json" -TimeoutSec 15
Write-Host "Blob SHA: $($blobResp.sha)"

$body = '{"tree":[{"path":"test.txt","mode":"100644","type":"blob","sha":"' + $blobResp.sha + '"}]}'

$wr = [System.Net.HttpWebRequest]::Create("https://api.github.com/repos/$owner/$repo/git/trees")
$wr.Method = "POST"
$wr.ContentType = "application/json"
$wr.Headers["Authorization"] = "token ghp_REDACTED"
$wr.ContentLength = [System.Text.Encoding]::UTF8.GetBytes($body).Length
$wr.Timeout = 30000

$sw = [System.IO.StreamWriter]::new($wr.GetRequestStream())
$sw.Write($body)
$sw.Close()

$resp = $wr.GetResponse()
$sr = [System.IO.StreamReader]::new($resp.GetResponseStream())
$respBody = $sr.ReadToEnd()
$sr.Close()
Write-Host "[$($resp.StatusCode)] $respBody"