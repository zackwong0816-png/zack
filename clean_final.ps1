Get-ChildItem . -Filter "*.ps1" -File -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match "ghp_|github_pat_") {
        $clean = $content -replace "ghp_[A-Za-z0-9]+", "ghp_REDACTED"
        $clean = $clean -replace "github_pat_[A-Za-z0-9_]+", "github_pat_REDACTED"
        [System.IO.File]::WriteAllText($_.FullName, $clean)
        Write-Host "Cleaned: $($_.Name)"
    }
}
Get-ChildItem . -Filter "*.txt" -File -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    if ($content -match "ghp_|github_pat_") {
        $clean = $content -replace "ghp_[A-Za-z0-9]+", "ghp_REDACTED"
        $clean = $clean -replace "github_pat_[A-Za-z0-9_]+", "github_pat_REDACTED"
        [System.IO.File]::WriteAllText($_.FullName, $clean)
        Write-Host "Cleaned txt: $($_.Name)"
    }
}
Write-Host "Done"