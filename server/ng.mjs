import ngrok from 'ngrok';
import fs from 'fs';
async function main(){
  const url = await ngrok.connect({ proto: 'http', addr: 3000, region: 'ap' });
  fs.writeFileSync('/tmp/public_url.json', JSON.stringify({ url, ts: new Date().toISOString() }));
  console.log('NGROK_URL:', url);
  setInterval(()=>{}, 2**31-1);
}
main().catch(e => { console.error(e.message); process.exit(1); });
