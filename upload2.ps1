$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}

$repo = "zackwong0816-png/zack"

function New-GitBlob($filePath, $content) {
    $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
    $json = "{""message"":""Add $filePath"",""content"":""$encoded""}"
    $body = [System.Text.Encoding]::UTF8.GetBytes($json)
    $r = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/blobs" -Headers $headers -Method POST -Body $body -UseBasicParsing
    if ($r.StatusCode -eq 201) {
        return (ConvertFrom-Json $r.Content).sha
    } else {
        Write-Host "ERROR blob $filePath : $($r.StatusCode)"
        return $null
    }
}

$files = @()

Get-ChildItem "D:/官网1.1/backend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName -replace [regex]::Escape("D:/官网1.1/backend/src"), "/backend/src"
    $rel = $rel -replace "\\", "/"
    $content = Get-Content $_.FullName -Raw
    if ($content) {
        $sha = New-GitBlob $rel $content
        if ($sha) { $files += @{path=$rel; sha=$sha; ok=$true} }
    }
}

Get-ChildItem "D:/官网1.1/frontend/src" -Recurse -File | ForEach-Object {
    $rel = $_.FullName -replace [regex]::Escape("D:/官网1.1/frontend/src"), "/frontend/src"
    $rel = $rel -replace "\\", "/"
    $content = Get-Content $_.FullName -Raw
    if ($content) {
        $sha = New-GitBlob $rel $content
        if ($sha) { $files += @{path=$rel; sha=$sha; ok=$true} }
    }
}

Write-Host "Total blobs created: $($files.Count)"
$ok = ($files | Where-Object { $_.ok }).Count
Write-Host "Successful: $ok"
$files | ForEach-Object { Write-Host $_.path }
