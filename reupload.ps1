param([int]$BatchSize = 15, [int]$DelayMs = 200)
$base = $PWD.Path -replace "\\", "/"
$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json; charset=utf-8"
}
$repo = "zackwong0816-png/zack"

function New-GitBlob($filepath, $content) {
    $enc = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
    $body = @{ content = $enc; encoding = "base64" } | ConvertTo-Json -Compress
    $r = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/blobs" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -UseBasicParsing -TimeoutSec 30
    if ($r.sha) { return $r.sha }
    Write-Host "[FAIL] $filepath : $($r | ConvertTo-Json)"
    return $null
}

$files = @()

Get-ChildItem "$base/backend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}

Get-ChildItem "$base/frontend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}

Get-ChildItem "$base/backend" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^batch" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}

Get-ChildItem "$base/frontend" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^batch" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}

Get-ChildItem "$base" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^batch" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}

$githubDir = "$base/.github/workflows"
if (Test-Path $githubDir) {
    Get-ChildItem $githubDir -File | ForEach-Object {
        $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
        $files += @{ path = $rel; fullname = $_.FullName }
    }
}

Write-Host "Total files: $($files.Count)"
$blobs = @{}
$total = $files.Count
$idx = 0

foreach ($f in $files) {
    $idx++
    $content = Get-Content $f.fullname -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) {
        Write-Host "[SKIP] $($f.path) - not readable"
        continue
    }
    $sha = New-GitBlob $f.path $content
    if ($sha) {
        $blobs[$f.path] = $sha
        Write-Host "[$idx/$total] OK $($f.path) -> $sha"
    } else {
        Write-Host "[$idx/$total] FAIL $($f.path)"
    }
    if ($idx % $BatchSize -eq 0) {
        Start-Sleep -Milliseconds $DelayMs
    }
}

Write-Host ""
Write-Host "Blobs created: $($blobs.Count)"
$blobs | ConvertTo-Json -Depth 5 | Out-File "$base/blob_list.json" -Encoding UTF8
Write-Host "Saved to blob_list.json"