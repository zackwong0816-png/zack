Start-Sleep -Seconds 20
$headers = @{ Authorization = "token github_pat_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
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

$body = @{ tree = $tree_items }

$json = $body | ConvertTo-Json -Depth 10
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)

Write-Host "Creating tree with $($tree_items.Count) items, body size: $($bytes.Length) bytes..."
$url = "https://api.github.com/repos/$owner/$repo/git/trees"

try {
    $webResp = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body $bytes -ContentType "application/json" -TimeoutSec 30
    $resp = $webResp.Content | ConvertFrom-Json
    Write-Host "SUCCESS - Tree SHA: $($resp.sha)"
    $resp.sha | Out-File "$base/last_tree_sha.txt" -Encoding UTF8
} catch {
    $webResp = $_.Exception.Response
    if ($webResp) {
        $reader = [System.IO.StreamReader]::new($webResp.GetResponseStream())
        $respBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[HTTP $($webResp.StatusCode.value__)] $respBody"
    } else {
        Write-Host "[ERROR] $($_.Exception.Message)"
    }
}