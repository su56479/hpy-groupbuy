import ngrok from 'ngrok';
async function main(){
  try {
    const url = await ngrok.connect(3000);
    console.log('URL1:', url);
  } catch (e) {
    console.log('ERR1:', e.message);
    try {
      const url2 = await ngrok.connect({ addr: 3000 });
      console.log('URL2:', url2);
    } catch (e2) {
      console.log('ERR2:', e2.message);
    }
  }
}
main();
