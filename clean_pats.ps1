$files = Get-ChildItem . -Filter "*.ps1" -File -Recurse | Where-Object { $_.Name -notmatch "^test_|_tmp" }
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    if ($content -match "ghp_|github_pat_") {
        $clean = $content -replace "ghp_[A-Za-z0-9]+", "ghp_REDACTED"
        $clean = $clean -replace "github_pat_[A-Za-z0-9_]+", "github_pat_REDACTED"
        [System.IO.File]::WriteAllText($f.FullName, $clean)
        Write-Host "Cleaned: $($f.Name)"
    }
}
Write-Host "Done cleaning PATs"