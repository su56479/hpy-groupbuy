import localtunnel from 'localtunnel';
const tunnel = await localtunnel({ port: 3000 });
console.log('PUBLIC_URL:', tunnel.url);
tunnel.on('close', () => console.log('tunnel closed'));
tunnel.on('error', (e) => console.error('tunnel error:', e.message));
// 保持进程
setInterval(() => {}, 1000 * 60 * 60);
