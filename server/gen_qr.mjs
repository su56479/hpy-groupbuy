import QRCode from 'qrcode';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targets = [
  { name: 'qr-mobile-h5',   url: 'http://localhost:3000/m',           out: path.resolve(__dirname, '../qr-mobile-h5.png') },
  { name: 'qr-admin',       url: 'http://localhost:3000/admin',       out: path.resolve(__dirname, '../qr-admin.png') },
  { name: 'qr-hero-demo',   url: 'http://localhost:3000/m/#/hero-demo', out: path.resolve(__dirname, '../qr-hero-demo.png') },
];

for (const t of targets) {
  await QRCode.toFile(t.out, t.url, { width: 480, margin: 2, color: { dark:'#000000', light:'#FFFFFF' } });
  console.log('\n===== ' + t.name + ' =====');
  console.log('URL: ' + t.url);
  console.log('PNG: ' + t.out);
  await QRCode.toString(t.url, { type: 'terminal', small: true }).then(s => process.stdout.write(s));
}
