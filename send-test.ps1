$ErrorActionPreference = 'Stop'
$smtpUser = 'c20717001@smtp-brevo.com'
$smtpPass = $env:BREVO_SMTP_KEY
if (-not $smtpPass) { throw 'Set BREVO_SMTP_KEY in the process environment before running this test.' }

$client = New-Object System.Net.Mail.SmtpClient('smtp-relay.brevo.com', 587)
$client.EnableSsl = $true
$client.Credentials = New-Object System.Net.NetworkCredential($smtpUser, $smtpPass)

$from = New-Object System.Net.Mail.MailAddress('founder@dyunetra.dpdns.org', 'Dyunetra')
$msg = New-Object System.Net.Mail.MailMessage
$msg.From = $from
$msg.To.Add('dyunetra@gmail.com')
$msg.Subject = 'Test: outgoing mail from founder@dyunetra.dpdns.org (Brevo SMTP)'
$msg.Body = "This is a test email sent via Brevo SMTP relay at $(Get-Date -Format 'u').`n`nIf you receive this, your outgoing mail setup works. Check the headers for spf=pass, dkim=pass, dmarc=pass."

try {
  $client.Send($msg)
  Write-Output 'SENT OK'
} catch {
  Write-Output ("SEND FAILED: {0}" -f $_.Exception.Message)
  if ($_.Exception.InnerException) { Write-Output ("INNER: {0}" -f $_.Exception.InnerException.Message) }
}
