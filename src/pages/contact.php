<?php
/**
 * Dyunetra contact handler.
 *  - GET  ?a=token  -> signed timestamp (anti-bot, no sessions needed)
 *  - POST           -> validates, rate-limits, emails, logs
 * Configure the two values below (or in _private/config.php).
 */
declare(strict_types=1);

$TO_EMAIL   = 'founder@dyunetra.dpdns.org';            // where messages are delivered
$SITE_NAME  = 'Dyunetra';

/* ---------- hardening ---------- */
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');
@ini_set('display_errors', '0');
error_reporting(0);

$priv = __DIR__ . '/_private';
if (!is_dir($priv)) {
    @mkdir($priv, 0750, true);
    @file_put_contents($priv . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nOrder deny,allow\nDeny from all\n</IfModule>\n");
    @file_put_contents($priv . '/index.html', '');
}
// per-install secret, created once, never exposed (folder is denied by .htaccess)
$secretFile = $priv . '/secret.key';
if (!is_file($secretFile)) {
    @file_put_contents($secretFile, bin2hex(random_bytes(32)));
    @chmod($secretFile, 0640);
}
$secret = (string)@file_get_contents($secretFile);
if ($secret === '') { $secret = hash('sha256', __FILE__ . ($_SERVER['SERVER_NAME'] ?? '')); }

function out(array $a, int $code = 200): void { http_response_code($code); echo json_encode($a); exit; }
function clean(string $s, int $max): string {
    $s = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '');
    return mb_substr($s, 0, $max);
}
function oneline(string $s): string { return trim(preg_replace('/[\r\n]+/', ' ', $s) ?? ''); }
function sign(string $ts, string $secret): string { return hash_hmac('sha256', $ts, $secret); }

/* ---------- token endpoint ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    if (($_GET['a'] ?? '') === 'token') {
        $ts = (string)time();
        out(['ts' => $ts, 'tk' => sign($ts, $secret)]);
    }
    out(['ok' => false, 'error' => 'Not found.'], 404);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { out(['ok' => false, 'error' => 'Method not allowed.'], 405); }

$isFetch = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch';
function done(bool $ok, string $msg, bool $isFetch, int $code = 200): void {
    if ($isFetch) { out($ok ? ['ok' => true] : ['ok' => false, 'error' => $msg], $ok ? 200 : $code); }
    header('Content-Type: text/html; charset=utf-8');
    header('Location: contact.html' . ($ok ? '?sent=1' : '?err=1'));
    http_response_code(303);
    exit;
}

/* ---------- same-origin check ---------- */
$host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $h) {
    if (!empty($_SERVER[$h])) {
        $oh = strtolower((string)parse_url($_SERVER[$h], PHP_URL_HOST));
        if ($oh !== '' && $oh !== $host) { done(false, 'Request blocked.', $isFetch, 403); }
    }
}

/* ---------- honeypot + signed timestamp ---------- */
if (!empty($_POST['website'])) { done(true, '', $isFetch); }          // silently drop bots
$ts = (string)($_POST['ts'] ?? ''); $tk = (string)($_POST['tk'] ?? '');
if (!ctype_digit($ts) || !hash_equals(sign($ts, $secret), $tk)) { done(false, 'Session expired. Please reload the page and try again.', $isFetch, 400); }
$age = time() - (int)$ts;
if ($age < 3)    { done(false, 'Please take a moment to complete the form.', $isFetch, 429); }
if ($age > 7200) { done(false, 'Session expired. Please reload the page and try again.', $isFetch, 400); }

/* ---------- rate limit: 5 / hour / IP ---------- */
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rlDir = $priv . '/rl'; if (!is_dir($rlDir)) { @mkdir($rlDir, 0750, true); }
$rlFile = $rlDir . '/' . hash('sha256', $ip . $secret) . '.json';
$hits = is_file($rlFile) ? (json_decode((string)@file_get_contents($rlFile), true) ?: []) : [];
$hits = array_values(array_filter($hits, fn($t) => $t > time() - 3600));
if (count($hits) >= 5) { done(false, 'Too many messages. Please try again later.', $isFetch, 429); }

/* ---------- validate ---------- */
$name     = oneline(clean((string)($_POST['name'] ?? ''), 100));
$email    = oneline(clean((string)($_POST['email'] ?? ''), 150));
$org      = oneline(clean((string)($_POST['org'] ?? ''), 120));
$interest = oneline(clean((string)($_POST['interest'] ?? ''), 60));
$message  = clean((string)($_POST['message'] ?? ''), 4000);
$allowed  = ['General enquiry','IT Consulting','Cybersecurity','Blockchain','Artificial Intelligence','MEVONU','QEVRAXIS','DevAI'];
if (!in_array($interest, $allowed, true)) { $interest = 'General enquiry'; }

if ($name === '' || mb_strlen($name) < 2)                    { done(false, 'Please enter your name.', $isFetch, 422); }
if (!filter_var($email, FILTER_VALIDATE_EMAIL))               { done(false, 'Please enter a valid email address.', $isFetch, 422); }
if (mb_strlen($message) < 10)                                 { done(false, 'Please write a slightly longer message.', $isFetch, 422); }
if (preg_match_all('#https?://#i', $message) > 3)             { done(false, 'Too many links in the message.', $isFetch, 422); }

/* ---------- send ---------- */
$domain  = preg_replace('/^www\./', '', $host) ?: 'localhost';
$subject = '[' . $SITE_NAME . '] ' . $interest . ' — ' . $name;
$body    = "Name: $name\nEmail: $email\nOrganisation: $org\nInterest: $interest\nIP: $ip\nTime: " . gmdate('c') . "\n\n$message\n";
$headers = [
    'From: ' . $SITE_NAME . ' Website <no-reply@' . $domain . '>',
    'Reply-To: ' . $email,
    'X-Mailer: DyunetraForm',
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
];
$sent = @mail($TO_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));

// always keep a private copy so nothing is lost if mail() is restricted by the host
@file_put_contents($priv . '/messages.log', '--- ' . gmdate('c') . ($sent ? ' [mailed]' : ' [mail-failed]') . "\n" . $body . "\n", FILE_APPEND | LOCK_EX);

$hits[] = time(); @file_put_contents($rlFile, json_encode($hits), LOCK_EX);

if (!$sent && !is_file($priv . '/messages.log')) { done(false, 'We could not send your message. Please email us directly.', $isFetch, 500); }
done(true, '', $isFetch);
