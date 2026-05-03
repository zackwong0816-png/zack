$pattern = "ghp_[A-Za-z0-9]+"
Get-ChildItem . -Filter "*.ps1" -File -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match $pattern) {
        $clean = $content -replace $pattern, "ghp_REDACTED"
        [System.IO.File]::WriteAllText($_.FullName, $clean)
        Write-Host "Cleaned: $($_.FullName)"
    }
}

Get-ChildItem . -Filter "*.txt" -File -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match $pattern) {
        $clean = $content -replace $pattern, "ghp_REDACTED"
        [System.IO.File]::WriteAllText($_.FullName, $clean)
        Write-Host "Cleaned: $($_.FullName)"
    }
}

Get-ChildItem . -Filter "*.json" -File -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match $pattern) {
        $clean = $content -replace $pattern, "ghp_REDACTED"
        [System.IO.File]::WriteAllText($_.FullName, $clean)
        Write-Host "Cleaned: $($_.FullName)"
    }
}

Remove-Item "_tmp_upload" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "blob_list.json" -Force -ErrorAction SilentlyContinue
Remove-Item "blob_list2.json" -Force -ErrorAction SilentlyContinue
Remove-Item "blob_list3.json" -Force -ErrorAction SilentlyContinue
Remove-Item "blob_list4.json" -Force -ErrorAction SilentlyContinue
Remove-Item "blob_list5.json" -Force -ErrorAction SilentlyContinue
Remove-Item "last_tree_sha.txt" -Force -ErrorAction SilentlyContinue
Write-Host "Done"