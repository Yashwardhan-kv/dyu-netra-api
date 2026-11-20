// Connector must be running with the tunnel TOKEN (remote config mode). Check which
// mode our running connector uses — restart cleanly with token:
import { execSync } from 'node:child_process';
console.log(execSync('powershell -NoProfile -ExecutionPolicy Bypass -File C:\\Brand\\restart-tunnel2.ps1', { encoding: 'utf8' }));
