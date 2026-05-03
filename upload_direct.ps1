$headers = @{ Authorization = "token github_pat_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$base = $PWD.Path -replace "\\", "/"
$owner = "zackwong0816-png"
$repo = "zack"

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

Write-Host "Files to upload: $($files.Count)"

$results = @()
$processed = 0
$errors = 0

foreach ($f in $files) {
    try {
        $rawBytes = [System.IO.File]::ReadAllBytes($f.src)
        $asUtf8 = [System.Text.Encoding]::UTF8.GetString($rawBytes)
        if ($asUtf8.Contains([char]0xFFFD)) {
            $content = [System.Text.Encoding]::GetEncoding("GB2312").GetString($rawBytes)
            Write-Host "[GBK] $($f.path)"
        } else {
            $content = $asUtf8
        }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        $base64 = [System.Convert]::ToBase64String($bytes)

        $body = @{
            content = $base64
            encoding = "utf-8"
        } | ConvertTo-Json -Compress

        $url = "https://api.github.com/repos/$owner/$repo/git/blobs"
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
        $processed++
        if ($processed % 20 -eq 0) { Write-Host "[$processed/$($files.Count)]" }
        $results += @{ path = $f.path; sha = $resp.sha }
    } catch {
        $errors++
        Write-Host "[ERR] $($f.path): $($_.Exception.Message.Substring(0,80))"
    }
}

Write-Host ""
Write-Host "Done: $processed ok, $errors errors"
$results | ConvertTo-Json -Depth 10 | Out-File "$base/blob_list5.json" -Encoding UTF8