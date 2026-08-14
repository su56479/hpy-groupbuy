import QRCode from 'qrcode';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE = 'https://pkweb-124-174-1-45.run.pinggy-free.link';
const targets = [
  { name: 'qr-mobile-h5-public', url: BASE + '/m/',     out: path.resolve(__dirname, '../qr-mobile-h5-public.png') },
  { name: 'qr-admin-public',     url: BASE + '/admin/', out: path.resolve(__dirname, '../qr-admin-public.png') },
  { name: 'qr-hero-demo-public', url: BASE + '/m/#/hero-demo', out: path.resolve(__dirname, '../qr-hero-demo-public.png') },
];

for (const t of targets) {
  await QRCode.toFile(t.out, t.url, { width: 480, margin: 2, color: { dark:'#000000', light:'#FFFFFF' } });
  console.log('\n===== ' + t.name + ' =====');
  console.log('URL: ' + t.url);
  console.log('PNG: ' + t.out);
}
console.log('\n✅ 三张公网二维码已生成');
