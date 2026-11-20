$ErrorActionPreference = 'Stop'
$ftpsrv = 'ftp://ftpupload.net'
$user = 'alalr_43402952'
$pass = 'GkvD9zBcyAG9j89POYlvuT0RRqzh'
$dist = Join-Path $PSScriptRoot 'dist'

# Upload root files
$files = Get-ChildItem $dist -File
foreach ($f in $files) {
  $url = "$ftpsrv/htdocs/$($f.Name)"
  Write-Host "Uploading $($f.Name)..."
  curl.exe -sS --disable-epsv -T $f.FullName -u "${user}:${pass}" $url
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL $($f.Name)"; exit 1 }
}

# Upload asset folders (css, js, img) recursively via ftp:// upload with --create-dirs
$dirs = @('css','js','img')
foreach ($d in $dirs) {
  $dfiles = Get-ChildItem (Join-Path $dist "assets\$d") -File
  foreach ($f in $dfiles) {
    $url = "$ftpsrv/htdocs/assets/$d/$($f.Name)"
    Write-Host "Uploading assets/$d/$($f.Name)..."
    curl.exe -sS --disable-epsv --ftp-create-dirs -T $f.FullName -u "${user}:${pass}" $url
    if ($LASTEXITCODE -ne 0) { Write-Host "FAIL assets/$d/$($f.Name)"; exit 1 }
  }
}
Write-Host 'ALL DEPLOYED OK'
