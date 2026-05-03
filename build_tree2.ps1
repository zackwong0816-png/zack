$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json; charset=utf-8"
}
$repo = "zackwong0816-png/zack"

Write-Host "Loading blob list..."
$jsonContent = Get-Content "blob_list.json" -Raw
$blobs = @{}
$parsed = $jsonContent | ConvertFrom-Json
foreach ($prop in $parsed.PSObject.Properties) {
    $blobs[$prop.Name] = $prop.Value
}
Write-Host "Loaded $($blobs.Count) blobs"

Write-Host "Fetching old tree to get all 132 entries..."
$r = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/trees/b0f70d7f85876875c7c0c27946b376eedbf5bf5b?recursive=1" -Headers $headers -UseBasicParsing -TimeoutSec 30
$oldTree = $r.tree
Write-Host "Old tree has $($oldTree.Count) entries"

$treeEntries = @()
foreach ($entry in $oldTree) {
    $path = $entry.path
    $newSha = $blobs[$path]
    if ($newSha) {
        $sha = $newSha
    } else {
        $sha = $entry.sha
    }
    $treeEntries += @{
        path = $path
        mode = $entry.mode
        type = $entry.type
        sha = $sha
    }
}

Write-Host "Tree will have $($treeEntries.Count) entries"

$treeJson = @{ tree = $treeEntries } | ConvertTo-Json -Depth 10
Write-Host "Creating new tree (no base_tree, full rebuild)..."
$r2 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/trees" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($treeJson)) -UseBasicParsing -TimeoutSec 60 -ErrorAction Stop
if ($r2.sha) {
    Write-Host "New tree SHA: $($r2.sha)"
    $treeSha = $r2.sha
} else {
    Write-Host "FAILED: $($r2 | ConvertTo-Json)"
    exit 1
}

Write-Host "Creating commit..."
$commitBody = @{
    message = "chore: restore full source with correct file encoding"
    tree = $treeSha
    parents = @("cd9bf6203b9e4723aaaf372cadfc11a8ed86dd4e")
} | ConvertTo-Json -Depth 10
$r3 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/commits" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($commitBody)) -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
if ($r3.sha) {
    Write-Host "New commit: $($r3.sha)"
    $commitSha = $r3.sha
} else {
    Write-Host "FAILED: $($r3 | ConvertTo-Json)"
    exit 1
}

Write-Host "Updating main branch..."
$refBody = @{ sha = $commitSha } | ConvertTo-Json -Depth 10
$r4 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/refs/heads/main" -Headers $headers -Method Patch -Body ([System.Text.Encoding]::UTF8.GetBytes($refBody)) -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
Write-Host "Main updated to: $($r4.object.sha)"
Write-Host "ALL DONE!"