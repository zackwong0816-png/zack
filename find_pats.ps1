Get-ChildItem . -Filter "*.ps1" -File -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match "ghp_") {
        Write-Host "FOUND ghp_ in: $($_.FullName)"
    }
}
Get-ChildItem . -Filter "*.txt" -File -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match "ghp_") {
        Write-Host "FOUND ghp_ in: $($_.FullName)"
    }
}
Get-ChildItem "_tmp_upload" -File -ErrorAction SilentlyContinue | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match "ghp_") {
        Write-Host "FOUND ghp_ in _tmp: $($_.FullName)"
    }
}
Write-Host "Check complete"