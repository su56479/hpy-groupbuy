import localtunnel from 'localtunnel';
import fs from 'fs';
try {
  const tunnel = await localtunnel({ port: 3000, host: 'https://localtunnel.me' });
  const data = { url: tunnel.url, ts: new Date().toISOString() };
  fs.writeFileSync('/tmp/public_url.json', JSON.stringify(data));
  console.log('OK URL:', tunnel.url);
  tunnel.on('error', (e) => console.error('ERR:', e.message));
  setInterval(() => {}, 2**31-1);
} catch (e) {
  console.error('FATAL:', e);
  process.exit(1);
}
