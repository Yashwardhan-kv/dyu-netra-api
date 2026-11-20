$ErrorActionPreference = 'Stop'
$url = 'https://rvppydncsdfyhjiuvart.supabase.co/rest/v1/posts'
# NOTE: inserting requires the service-role key; public anon key is read-only by design.
# We cannot insert without it — instead, instruct user, or try anon (expect 401/403).
$key = 'sb_publishable_fJn13_ySkM8CvvkRwJ2v-A_cqy1vapM'
$body = @{
  slug = 'test-post-pipeline'
  title = 'Pipeline test — this post will be deleted'
  category = 'ai'
  excerpt = 'Verifying the Supabase-to-website pipeline works end to end.'
  body = "If you can read this on the live blog, the pipeline works.`n`nThis test post will be removed shortly."
  read_time = '1 min read'
  published = $true
} | ConvertTo-Json
try {
  $r = Invoke-RestMethod -Method Post -Uri $url -ContentType 'application/json' -Headers @{ apikey = $key; Authorization = "Bearer $key"; Prefer = 'return=representation' } -Body $body
  Write-Output ("INSERTED: " + ($r | ConvertTo-Json -Compress))
} catch {
  Write-Output ("INSERT FAILED (expected if anon is read-only): " + $_.Exception.Message)
  if ($_.ErrorDetails.Message) { Write-Output $_.ErrorDetails.Message }
}
