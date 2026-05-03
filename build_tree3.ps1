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

Write-Host "Fetching old tree..."
$r = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/trees/b0f70d7f85876875c7c0c27946b376eedbf5bf5b?recursive=1" -Headers $headers -UseBasicParsing -TimeoutSec 30
$oldTree = $r.tree
Write-Host "Old tree has $($oldTree.Count) entries"

$githubPaths = @{}
$otherEntries = @()
$changedCount = 0

foreach ($entry in $oldTree) {
    $path = $entry.path
    if ($path.StartsWith(".github/")) {
        $githubPaths[$path] = $entry
    } else {
        $newSha = $blobs[$path]
        if ($newSha) {
            $otherEntries += @{
                path = $path
                mode = $entry.mode
                type = $entry.type
                sha = $newSha
            }
            $changedCount++
        }
    }
}

Write-Host "Non-.github entries to update: $changedCount"

if ($changedCount -gt 0) {
    Write-Host "Creating tree with base_tree (non-.github only)..."
    $treeJson = @{
        base_tree = "b0f70d7f85876875c7c0c27946b376eedbf5bf5b"
        tree = $otherEntries
    } | ConvertTo-Json -Depth 10

    $r2 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/trees" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($treeJson)) -UseBasicParsing -TimeoutSec 60 -ErrorAction Stop
    if ($r2.sha) {
        Write-Host "Intermediate tree SHA: $($r2.sha)"
        $intermediateTreeSha = $r2.sha
    } else {
        Write-Host "FAILED: $($r2 | ConvertTo-Json)"
        exit 1
    }

    Write-Host "Creating full tree (intermediate + .github entries)..."
    $fullEntries = @()
    foreach ($entry in $oldTree) {
        $fullEntries += @{
            path = $entry.path
            mode = $entry.mode
            type = $entry.type
            sha = $entry.sha
        }
    }

    $fullTreeJson = @{
        base_tree = $intermediateTreeSha
        tree = $fullEntries
    } | ConvertTo-Json -Depth 10

    $r3 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/trees" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($fullTreeJson)) -UseBasicParsing -TimeoutSec 60 -ErrorAction Stop
    if ($r3.sha) {
        Write-Host "Full tree SHA: $($r3.sha)"
        $treeSha = $r3.sha
    } else {
        Write-Host "FAILED: $($r3 | ConvertTo-Json)"
        exit 1
    }
} else {
    Write-Host "No changes needed"
    $treeSha = "b0f70d7f85876875c7c0c27946b376eedbf5bf5b"
}

Write-Host "Creating commit..."
$commitBody = @{
    message = "chore: restore full source with corrected blob encoding"
    tree = $treeSha
    parents = @("cd9bf6203b9e4723aaaf372cadfc11a8ed86dd4e")
} | ConvertTo-Json -Depth 10
$r4 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/commits" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($commitBody)) -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
if ($r4.sha) {
    Write-Host "New commit: $($r4.sha)"
    $commitSha = $r4.sha
} else {
    Write-Host "FAILED: $($r4 | ConvertTo-Json)"
    exit 1
}

Write-Host "Updating main branch..."
$refBody = @{ sha = $commitSha } | ConvertTo-Json -Depth 10
$r5 = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/refs/heads/main" -Headers $headers -Method Patch -Body ([System.Text.Encoding]::UTF8.GetBytes($refBody)) -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
Write-Host "Main updated to: $($r5.object.sha)"
Write-Host "ALL DONE!"