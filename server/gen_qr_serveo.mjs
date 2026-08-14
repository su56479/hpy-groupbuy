import QRCode from 'qrcode';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://30edccdd6f7072da-115-191-60-241.serveousercontent.com';
const targets = [
  { name: 'C端商城H5',       url: BASE + '/m/',            out: path.resolve(__dirname, '../qr-mobile-h5-public.png') },
  { name: 'B端后台管理',     url: BASE + '/admin/',        out: path.resolve(__dirname, '../qr-admin-public.png') },
  { name: 'HERO三方案对比',  url: BASE + '/m/#/hero-demo', out: path.resolve(__dirname, '../qr-hero-demo-public.png') },
];
for (const t of targets) {
  await QRCode.toFile(t.out, t.url, { width: 480, margin: 2, color: { dark:'#000000', light:'#FFFFFF' } });
  console.log(`✅ ${t.name}: ${t.url}`);
  console.log(`   二维码: ${t.out}`);
}
console.log('\n✅ 全部生成完毕');
