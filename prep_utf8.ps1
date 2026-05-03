$base = $PWD.Path -replace "\\", "/"
$tmpDir = "$base/_tmp_upload"

Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -Path $tmpDir -ItemType Directory | Out-Null

$files = @()

Get-ChildItem "$base/backend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; src = $_.FullName }
}
Get-ChildItem "$base/frontend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; src = $_.FullName }
}
Get-ChildItem "$base/backend" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^blob|^build|^_tmp" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; src = $_.FullName }
}
Get-ChildItem "$base/frontend" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^blob|^build|^_tmp" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; src = $_.FullName }
}
Get-ChildItem "$base" -File | Where-Object { $_.Name -notmatch "^upload|^commit|^blob|^build|^_tmp" } | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; src = $_.FullName }
}
Get-ChildItem "$base/.github/workflows" -File -ErrorAction SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $files += @{ path = $rel; src = $_.FullName }
}

Write-Host "Files to process: $($files.Count)"
$ok = 0

foreach ($f in $files) {
    $tmpPath = "$tmpDir/$([guid]::NewGuid().ToString())"
    try {
        $rawBytes = [System.IO.File]::ReadAllBytes($f.src)
        $asUtf8 = [System.Text.Encoding]::UTF8.GetString($rawBytes)
        if ($asUtf8.Contains([char]0xFFFD)) {
            $asGb2312 = [System.Text.Encoding]::GetEncoding("GB2312").GetString($rawBytes)
            [System.IO.File]::WriteAllText($tmpPath, $asGb2312, [System.Text.Encoding]::UTF8)
        } else {
            [System.IO.File]::WriteAllBytes($tmpPath, $rawBytes)
        }
        $ok++
    } catch {
        Write-Host "[WARN] $($f.path): $_"
        [System.IO.File]::WriteAllBytes($tmpPath, $rawBytes)
    }
}

Write-Host "Processed: $ok"

$utf8Files = Get-ChildItem $tmpDir -File
Write-Host "Temp files: $($utf8Files.Count)"