Start-Sleep -Seconds 5
$headers = @{ Authorization = "token github_pat_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$base = $PWD.Path -replace "\\", "/"
$owner = "zackwong0816-png"
$repo = "zack"

$list = Get-Content "$base/blob_list5.json" -Raw | ConvertFrom-Json
$first2 = $list | Select-Object -First 2

$tree_items = @()
foreach ($item in $first2) {
    $tree_items += @{
        path = $item.path
        mode = "100644"
        type = "blob"
        sha = $item.sha
    }
}

$body = @{ tree = $tree_items } | ConvertTo-Json -Compress

Write-Host "Testing with 2 items..."
$url = "https://api.github.com/repos/$owner/$repo/git/trees"
try {
    $webResp = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json" -TimeoutSec 30
    $resp = $webResp.Content | ConvertFrom-Json
    Write-Host "SUCCESS - Tree SHA: $($resp.sha)"
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