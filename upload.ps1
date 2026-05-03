$headers = @{
    Authorization = "token github_pat_REDACTED"
    Accept = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}

$baseTreeSha = "bf0e19ef94124ef3a680a024dfa99ae0fbf97cd2"
$repo = "zackwong0816-png/zack"

function New-GitBlob($filePath, $content) {
    $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
    $body = [System.Text.Encoding]::UTF8.GetBytes("`{\"message`:`\"add $filePath`\",`\"content`\":\"$encoded`\"}")
    $uri = "https://api.github.com/repos/$repo/git/blobs"
    $r = Invoke-WebRequest -Uri $uri -Headers $headers -Method POST -Body $body -UseBasicParsing
    return (ConvertFrom-Json $r.Content).sha
}

function Add-FileToArray($arr, $path, $sha) {
    $arr += @{path=$path; mode="100644"; type="blob"; sha=$sha}
    return $arr
}

$tree = @()

# backend/package.json
$pkg = Get-Content "D:/官网1.1/backend/package.json" -Raw
$sha = New-GitBlob "backend/package.json" $pkg
$tree = Add-FileToArray $tree "backend/package.json" $sha
Write-Host "backend/package.json done"

# backend/tsconfig.json
$tsc = Get-Content "D:/官网1.1/backend/tsconfig.json" -Raw
$sha = New-GitBlob "backend/tsconfig.json" $tsc
$tree = Add-FileToArray $tree "backend/tsconfig.json" $sha
Write-Host "backend/tsconfig.json done"

# backend/nest-cli.json
$nestcli = Get-Content "D:/官网1.1/backend/nest-cli.json" -Raw
$sha = New-GitBlob "backend/nest-cli.json" $nestcli
$tree = Add-FileToArray $tree "backend/nest-cli.json" $sha
Write-Host "backend/nest-cli.json done"

# backend/.env.example
$env = Get-Content "D:/官网1.1/backend/.env.example" -Raw
$sha = New-GitBlob "backend/.env.example" $env
$tree = Add-FileToArray $tree "backend/.env.example" $sha
Write-Host "backend/.env.example done"

Write-Host "Tree has $($tree.Count) items"
$tree | ForEach-Object { Write-Host $_.path }
