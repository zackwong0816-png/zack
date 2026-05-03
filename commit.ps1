$base = "D:\官网1.1"
$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}
$repo = "zackwong0816-png/zack"

function New-GitBlob($fp, $content) {
    $enc = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
    $json = "{""message"":""Add $fp"",""content"":""$enc""}"
    $body = [System.Text.Encoding]::UTF8.GetBytes($json)
    $r = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/blobs" -Headers $headers -Method POST -Body $body -UseBasicParsing
    if ($r.StatusCode -eq 201) { return (ConvertFrom-Json $r.Content).sha }
    return $null
}

$blobs = @{}
Get-ChildItem "$base/backend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $sha = New-GitBlob $rel (Get-Content $_.FullName -Raw)
    if ($sha) { $blobs[$rel] = $sha }
}
Get-ChildItem "$base/frontend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $sha = New-GitBlob $rel (Get-Content $_.FullName -Raw)
    if ($sha) { $blobs[$rel] = $sha }
}
Write-Host "Total blobs: $($blobs.Count)"

# Also add root config files
$configs = @(
    "$base/backend/package.json",
    "$base/backend/tsconfig.json", 
    "$base/backend/nest-cli.json",
    "$base/backend/.env.example",
    "$base/frontend/package.json",
    "$base/frontend/tsconfig.json",
    "$base/frontend/vite.config.ts",
    "$base/frontend/index.html"
)
foreach ($cf in $configs) {
    if (Test-Path $cf) {
        $rel = $cf.Substring($base.Length + 1) -replace "\\", "/"
        $sha = New-GitBlob $rel (Get-Content $cf -Raw)
        if ($sha) { $blobs[$rel] = $sha; Write-Host "OK $rel" }
    }
}

# Get current main branch SHA
$r = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/refs/heads/main" -Headers $headers -UseBasicParsing
$mainSha = (ConvertFrom-Json $r.Content).object.sha
Write-Host "Main SHA: $mainSha"

# Get current tree
$r = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/trees/$mainSha?recursive=1" -Headers $headers -UseBasicParsing
$currentTree = (ConvertFrom-Json $r.Content).tree

# Build new tree with existing + new files
$newTree = @()
foreach ($item in $currentTree) {
    if (-not $blobs.ContainsKey($item.path)) {
        $newTree += @{path=$item.path; mode=$item.mode; type=$item.type; sha=$item.sha}
    }
}
foreach ($path in $blobs.Keys) {
    $newTree += @{path=$path; mode="100644"; type="blob"; sha=$blobs[$path]}
}

Write-Host "New tree items: $($newTree.Count)"

# Create new tree
$treeJson = $newTree | ConvertTo-Json -Depth 3
$treeBody = [System.Text.Encoding]::UTF8.GetBytes("{""tree"":$treeJson,""base_tree"":""$mainSha""}")
$r = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/trees" -Headers $headers -Method POST -Body $treeBody -UseBasicParsing
if ($r.StatusCode -eq 201) {
    $newTreeSha = (ConvertFrom-Json $r.Content).sha
    Write-Host "New tree SHA: $newTreeSha"
    
    # Create commit
    $commitBody = [System.Text.Encoding]::UTF8.GetBytes("{""message"":""Add NOVA website source code (Vue 3 + NestJS)"",""tree"":""$newTreeSha"",""parents"":[""$mainSha""]}")
    $r2 = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/commits" -Headers $headers -Method POST -Body $commitBody -UseBasicParsing
    if ($r2.StatusCode -eq 201) {
        $commitSha = (ConvertFrom-Json $r2.Content).sha
        Write-Host "Commit SHA: $commitSha"
        
        # Update main branch
        $refBody = [System.Text.Encoding]::UTF8.GetBytes("{""sha"":""$commitSha""}")
        $r3 = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/refs/heads/main" -Headers $headers -Method PATCH -Body $refBody -UseBasicParsing
        Write-Host "Branch update status: $($r3.StatusCode)"
        Write-Host "SUCCESS!"
    } else {
        Write-Host "COMMIT FAILED: $($r2.StatusCode) $($r2.Content)"
    }
} else {
    Write-Host "TREE FAILED: $($r.StatusCode) $($r.Content)"
}
