$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}

$repo = "zackwong0816-png/zack"
$baseTreeSha = "bf0e19ef94124ef3a680a024dfa99ae0fbf97cd2"

function New-GitBlob($filePath, $content) {
    $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
    $body = [System.Text.Encoding]::UTF8.GetBytes("`{\"message`:`\"Add $filePath`\",`\"content`\":\"$encoded`\"}")
    $r = Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/git/blobs" -Headers $headers -Method POST -Body $body -UseBasicParsing
    if ($r.StatusCode -eq 201) {
        return (ConvertFrom-Json $r.Content).sha
    } else {
        Write-Host "[ERROR] Blob failed for $filePath : $($r.Content)"
        return $null
    }
}

function Get-AllFiles($dir, $prefix) {
    $items = @()
    Get-ChildItem $dir -Recurse -File | ForEach-Object {
        $rel = $_.FullName -replace [regex]::Escape($dir), "" -replace "^\\", "/" -replace "\\", "/"
        $fullPath = $prefix + $rel
        $items += @{localPath=$_.FullName; gitPath=$fullPath}
    }
    return $items
}

$backendFiles = Get-AllFiles "D:/官网1.1/backend" "/backend"
$frontendFiles = Get-AllFiles "D:/官网1.1/frontend" "/frontend"

Write-Host "Backend files: $($backendFiles.Count)"
Write-Host "Frontend files: $($frontendFiles.Count)"

$allFiles = $backendFiles + $frontendFiles

$treeItems = @()

foreach ($f in $allFiles) {
    $content = Get-Content $f.localPath -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $sha = New-GitBlob $f.gitPath $content
        if ($sha) {
            $treeItems += @{path=$f.gitPath; mode="100644"; type="blob"; sha=$sha}
            Write-Host "[OK] $($f.gitPath)"
        }
    } else {
        Write-Host "[SKIP] $($f.gitPath) (empty or error)"
    }
}

Write-Host "`nTotal files to commit: $($treeItems.Count)"
