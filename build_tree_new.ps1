$headers = @{ Authorization = "token ghp_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$base = $PWD.Path -replace "\\", "/"
$owner = "zackwong0816-png"
$repo = "zack"

$list = Get-Content "$base/blob_list5.json" -Raw | ConvertFrom-Json

$tree_items = @()
foreach ($item in $list) {
    $tree_items += @{
        path = $item.path
        mode = "100644"
        type = "blob"
        sha = $item.sha
    }
}

$body = @{ tree = $tree_items } | ConvertTo-Json -Depth 10
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Write-Host "Creating tree with $($tree_items.Count) items..."
$url = "https://api.github.com/repos/$owner/$repo/git/trees"
try {
    $webResp = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body $bytes -ContentType "application/json" -TimeoutSec 30
    $resp = $webResp.Content | ConvertFrom-Json
    Write-Host "SUCCESS - Tree SHA: $($resp.sha)"
    $resp.sha | Out-File "$base/last_tree_sha.txt" -Encoding UTF8
} catch {
    $ex = $_.Exception
    if ($ex.Response) {
        $status = [int]$ex.Response.StatusCode
        $stream = $ex.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $bodyErr = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $status] $bodyErr"
    } else {
        Write-Host "[ERROR] $($ex.Message)"
    }
}