$headers = @{ Authorization = "token github_pat_REDACTED"; "Accept" = "application/vnd.github.v3+json" }
$base = $PWD.Path -replace "\\", "/"
$tmpDir = "$base/_tmp_upload"
$owner = "zackwong0816-png"
$repo = "zack"

Remove-Item "$base/blob_list4.json" -ErrorAction SilentlyContinue

$utf8Files = Get-ChildItem $tmpDir -File
$results = @()
$processed = 0
$errors = 0

foreach ($f in $utf8Files) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    $base64 = [System.Convert]::ToBase64String($bytes)

    $body = @{
        content = $base64
        encoding = "utf-8"
    } | ConvertTo-Json -Compress

    $url = "https://api.github.com/repos/$owner/$repo/git/blobs"
    try {
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
        $processed++
        Write-Host "[$processed/$($utf8Files.Count)] OK $($f.Name) -> $($resp.sha.Substring(0,7))"
        $results += @{ path = $f.Name; sha = $resp.sha }
    } catch {
        $errors++
        Write-Host "[ERR] $($f.Name): $($_.Exception.Message.Substring(0,100))"
    }
}

Write-Host ""
Write-Host "Done: $processed ok, $errors errors"
$results | ConvertTo-Json -Depth 10 | Out-File "$base/blob_list4.json" -Encoding UTF8