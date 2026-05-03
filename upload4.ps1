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
    Write-Host "FAIL $fp : $($r.StatusCode)"
    return $null
}
$blobs = @{}
Get-ChildItem "$base/backend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $sha = New-GitBlob $rel (Get-Content $_.FullName -Raw)
    if ($sha) { $blobs[$rel] = $sha; Write-Host "OK $rel" }
}
Get-ChildItem "$base/frontend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1) -replace "\\", "/"
    $sha = New-GitBlob $rel (Get-Content $_.FullName -Raw)
    if ($sha) { $blobs[$rel] = $sha; Write-Host "OK $rel" }
}
Write-Host "Done. Total: $($blobs.Count)"
