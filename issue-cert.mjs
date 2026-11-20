// Issue Let's Encrypt cert via HTTP-01, uploading challenge files over FTP
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import nodeCrypto from 'node:crypto';
import { Client, crypto } from 'acme-client';
import { execSync } from 'node:child_process';

const domain = 'dyunetra.dpdns.org';
const FTP = `ftp://${encodeURIComponent('alalr_43402952')}:${encodeURIComponent('GkvD9zBcyAG9j89POYlvuT0RRqzh')}@ftpupload.net`;
const accKeyFile = 'acme-account.key';

function ftpPut(local, remote) {
  execSync(`curl.exe -sS --disable-epsv --ftp-create-dirs -T "${local}" -u "alalr_43402952:GkvD9zBcyAG9j89POYlvuT0RRqzh" "ftp://ftpupload.net/htdocs/${remote}"`, { stdio: 'pipe' });
}

/* 1. account key */
let accountKey = await crypto.createPrivateRsaKey(2048);
fs.writeFileSync(accKeyFile, accountKey);

const client = new Client({ directoryUrl: 'https://acme-v02.api.letsencrypt.org/directory', accountKey });

/* 2. register account */
const account = await client.createAccount({ termsOfServiceAgreed: true, contact: ['mailto:founder@dyunetra.dpdns.org'] });
console.log('account created');

/* 3. order + authz */
const order = await client.createOrder({ identifiers: [{ type: 'dns', value: domain }] });
const [authz] = await client.getAuthorizations(order);
const challenge = authz.challenges.find(c => c.type === 'http-01');
const keyAuth = await client.getChallengeKeyAuthorization(challenge);
const token = challenge.token;
console.log('challenge token:', token);

/* 4. write challenge file locally then FTP it */
fs.mkdirSync('.acme', { recursive: true });
fs.writeFileSync(path.join('.acme', token), keyAuth);
ftpPut(path.join('.acme', token), `.well-known/acme-challenge/${token}`);
console.log('challenge uploaded');

/* 5. verify self */
const check = await new Promise((res) => {
  http.get(`http://${domain}/.well-known/acme-challenge/${token}`, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LetsEncrypt validation server)' } }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(d.trim() === keyAuth.trim()));
  }).on('error', () => res(false));
});
console.log('challenge self-check:', check);
if (!check) process.exit(1);

/* 6. validate + finalize */
await client.completeChallenge(challenge);
await client.waitForValidStatus(challenge);
await client.finalizeOrder(order, {
  csr: fs.readFileSync('server.csr')
});
const cert = await client.getCertificate(order);
fs.writeFileSync('server.crt', cert);
console.log('CERT ISSUED, size', cert.length);
