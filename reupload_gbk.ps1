param([int]$BatchSize = 10, [int]$DelayMs = 300)
$base = $PWD.Path -replace "\\", "/"
$gbk = [System.Text.Encoding]::GetEncoding("GBK")
$utf8 = [System.Text.Encoding]::UTF8

$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json; charset=utf-8"
}
$repo = "zackwong0816-png/zack"

function New-GitBlob($filepath, $content) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    $enc = [Convert]::ToBase64String($bytes)
    $body = @{ content = $enc; encoding = "base64" } | ConvertTo-Json -Compress
    try {
        $r = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/git/blobs" -Headers $headers -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -UseBasicParsing -TimeoutSec 30
        if ($r.sha) { return $r.sha }
    } catch {}
    Write-Host "[FAIL] $filepath"
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
Get-ChildItem "$base/backend" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^blob|^build" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}
Get-ChildItem "$base/frontend" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^blob|^build" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}
Get-ChildItem "$base" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^blob|^build" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}
Get-ChildItem "$base/.github/workflows" -File -ErrorAction SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; fullname = $_.FullName }
}

Write-Host "Total files: $($files.Count)"
$blobs = @{}
$total = $files.Count
$idx = 0

foreach ($f in $files) {
    $idx++
    $rawBytes = [System.IO.File]::ReadAllBytes($f.fullname)
    $content = $utf8.GetString($gbk.GetString($rawBytes))
    $sha = New-GitBlob $f.path $content
    if ($sha) {
        $blobs[$f.path] = $sha
        Write-Host "[$idx/$total] OK $($f.path)"
    }
    if ($idx % $BatchSize -eq 0) {
        Start-Sleep -Milliseconds $DelayMs
    }
}

Write-Host ""
Write-Host "Blobs created: $($blobs.Count)"
$blobsJson = $blobs | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText("$base/blob_list3.json", $blobsJson, $utf8)
Write-Host "Saved to blob_list3.json"