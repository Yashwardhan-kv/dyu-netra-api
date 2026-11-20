$magick = "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"
if (-not (Test-Path $magick)) { $magick = (Get-ChildItem "C:\Program Files" -Filter magick.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName }
Write-Output "Using: $magick"
$jobs = @(
  @{ src = "C:\DEV-AI\branding\Brand\MEVONU-LOGO.png";  out = "src\assets\img\mevonu-logo.webp";  w = 480 },
  @{ src = "C:\DEV-AI\branding\Brand\QEVRAXIS-LOGO.png"; out = "src\assets\img\qevraxis-logo.webp"; w = 480 },
  @{ src = "C:\DEV-AI\branding\Brand\DevAI-LOGO.png";   out = "src\assets\img\devai-logo.webp";   w = 480 }
)
foreach ($j in $jobs) {
  & $magick $j.src -resize "$($j.w)x$($j.w)>" -quality 85 $j.out
  if ($LASTEXITCODE -eq 0) { Write-Output "OK $($j.out)" } else { Write-Output "FAIL $($j.src)" }
}
