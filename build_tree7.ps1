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

$body = @{
    tree = $tree_items
} | ConvertTo-Json -Depth 10

$url = "https://api.github.com/repos/$owner/$repo/git/trees"
$resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json" -TimeoutSec 30
Write-Host "Tree SHA: $($resp.sha)"
$resp.sha | Out-File "$base/last_tree_sha.txt" -Encoding UTF8