$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json; charset=utf-8"
}
$repo = "zackwong0816-png/zack"

Write-Host "Loading new blob list..."
$jsonContent = Get-Content "blob_list2.json" -Raw
$newBlobs = @{}
$parsed = $jsonContent | ConvertFrom-Json
foreach ($prop in $parsed.PSObject.Properties) {
    $newBlobs[$prop.Name] = $prop.Value
}
Write-Host "Loaded $($newBlobs.Count) new blobs"

Write-Host "Fetching current main tree..."
$currentMain = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/refs/heads/main" -Headers $headers -UseBasicParsing -TimeoutSec 30
$currentTreeSha = $currentMain.object.sha
Write-Host "Current main commit: $currentTreeSha"

$r = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/trees/$($currentMain.object.sha)?recursive=1" -Headers $headers -UseBasicParsing -TimeoutSec 30
$oldTree = $r.tree
Write-Host "Old tree has $($oldTree.Count) entries"

$treeEntries = @()
$changed = 0
foreach ($entry in $oldTree) {
    $path = $entry.path
    $newSha = $newBlobs[$path]
    if ($newSha) {
        $sha = $newSha
        $changed++
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

Write-Host "Creating full tree (no base_tree, all $($treeEntries.Count) entries, $changed updated)..."
$treeJson = @{ tree = $treeEntries } | ConvertTo-Json -Depth 10 -Compress
Write-Host "JSON size: $($treeJson.Length) chars"

$r2 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/trees" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($treeJson)) -UseBasicParsing -TimeoutSec 120 -ErrorAction Stop
if ($r2.sha) {
    Write-Host "New tree SHA: $($r2.sha)"
    $treeSha = $r2.sha
} else {
    Write-Host "FAILED: $($r2 | ConvertTo-Json)"
    exit 1
}

Write-Host "Creating commit..."
$commitBody = @{
    message = "chore: restore source with proper UTF-8 encoding"
    tree = $treeSha
    parents = @($currentTreeSha)
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
$refBody = @{ sha = $commitSha; force = $true } | ConvertTo-Json -Depth 10
$r4 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/refs/heads/main" -Headers $headers -Method Patch -Body ([System.Text.Encoding]::UTF8.GetBytes($refBody)) -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
Write-Host "Main updated to: $($r4.object.sha)"
Write-Host "ALL DONE!"