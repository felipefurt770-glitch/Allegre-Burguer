// Run with Node 22+ and a locally installed Edge or Chrome. No dependencies.
// Serves this workspace on loopback; screenshots and browser data stay in TEMP.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const {spawn} = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const menu = JSON.parse(fs.readFileSync(path.join(root, 'menu.json'), 'utf8'));
const order = ['destaques', 'combos', 'hamburgueres', 'batatas', 'bebidas'];
const highlights = ['allegre-brasa', 'combo-sorriso', 'batata-suprema', 'combo-compartilhar'];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  assert.deepEqual(menu.categories.map(c => c.id), order);
  assert.deepEqual(menu.navigation.map(c => c.id), order);
  assert.deepEqual(menu.categories[0].productIds, highlights);
  for (const p of menu.products) if (p.image) assert(fs.existsSync(path.join(root, p.image)), p.image);
  const executable = process.env.ALLEGRE_TEST_BROWSER || [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe'
  ].find(file => fs.existsSync(file));
  assert(executable, 'Set ALLEGRE_TEST_BROWSER to an installed Chromium browser.');
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'allegre-ui-'));
  const failures = [];
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(req.url.split('?')[0]);
    if (pathname === '/favicon.ico') {res.writeHead(204); return res.end();}
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {res.writeHead(403); return res.end();}
    fs.readFile(file, (err, data) => {
      if (err) {failures.push('Missing asset: ' + pathname); res.writeHead(404); return res.end();}
      res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.jpeg':'image/jpeg', '.jpg':'image/jpeg', '.png':'image/png'})[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + output, 'about:blank'], {windowsHide:true, stdio:'ignore'});
  let ws;
  const watchdog = setTimeout(() => {browser.kill(); server.close(); console.error('Browser test timed out'); process.exit(1);}, 90000);
  try {
    let port;
    for (let i = 0; i < 100; i++) {
      try {port = fs.readFileSync(path.join(output, 'DevToolsActivePort'), 'utf8').split('\n')[0]; break;} catch {}
      await delay(100);
    }
    assert(port, 'Browser did not expose its local debugging endpoint');
    const targets = await fetch('http://127.0.0.1:' + port + '/json').then(r => r.json());
    ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {ws.onopen = resolve; ws.onerror = reject;});
    let nextId = 0;
    const pending = new Map();
    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') failures.push(JSON.stringify(message.params.exceptionDetails));
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') failures.push(JSON.stringify(message.params.args));
      if (!pending.has(message.id)) return;
      const {resolve, reject, timer} = pending.get(message.id);
      pending.delete(message.id); clearTimeout(timer);
      message.error ? reject(Error(JSON.stringify(message.error))) : resolve(message.result);
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => {pending.delete(id); reject(Error('Timed out: ' + method));}, 15000);
      pending.set(id, {resolve, reject, timer}); ws.send(JSON.stringify({id, method, params}));
    });
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const screenshot = async name => {
      const result = await send('Page.captureScreenshot', {format:'png'});
      fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(result.data, 'base64'));
    };
    const click = selector => evaluate('document.querySelector(' + JSON.stringify(selector) + ').click()');
    await send('Page.enable'); await send('Page.bringToFront'); await send('Runtime.enable');
    const origin = 'http://127.0.0.1:' + server.address().port;
    await send('Page.navigate', {url:origin});
    for (let i = 0; i < 100; i++) {if (await evaluate('document.querySelectorAll(".menu-section").length===5')) break; await delay(100);}
    assert.deepEqual(await evaluate('[...document.querySelectorAll(".menu-section")].map(s=>s.id)'), order);
    await evaluate('document.fonts.ready');
    await evaluate('Promise.all([...document.images].map(img=>{img.loading="eager";return img.decode()}))');
    for (const width of [1440, 1024, 768, 430, 390]) {
      await send('Emulation.setDeviceMetricsOverride', {width, height:900, deviceScaleFactor:1, mobile:width < 680});
      await send('Emulation.setTouchEmulationEnabled',{enabled:width<680});
      await evaluate('window.scrollTo({top:0,behavior:"instant"});document.querySelector(".spotlight").scrollTo({left:0,behavior:"instant"})'); await delay(180);
      const geometry = await evaluate(`(() => {
        const rect=el=>el.getBoundingClientRect();
        const image=rect(document.querySelector('.masthead__burger>img'));
        const title=rect(document.querySelector('.masthead h1')),faith=rect(document.querySelector('.masthead__copy p')),smile=rect(document.querySelector('.masthead__smile'));
        const blessing=rect(document.querySelector('.masthead__blessing'));
        const titleFont=parseFloat(getComputedStyle(document.querySelector('.masthead h1')).fontSize);
        const sloganFont=parseFloat(getComputedStyle(document.querySelector('.masthead__copy p')).fontSize);
        const rows=[...document.querySelectorAll('.product-row')];
        const positions=[...document.querySelectorAll('.menu-section')].map(el=>rect(el).top);
        const carousel=document.querySelector('.spotlight'),cards=[...carousel.children],box=rect(carousel);
        return {
          overflow:document.documentElement.scrollWidth>innerWidth,
          heroClear:title.right<=image.left+image.width*.4+1&&faith.right<=image.left+image.width*.4+1&&smile.right<=image.left+image.width*.4+1&&title.bottom<=faith.top+1&&faith.bottom<=smile.top+1,
          heroSizes:Math.abs(titleFont-Math.min(5.76*16,Math.max(2.58*16,innerWidth*.066))*1.2)<.1&&Math.abs(sloganFont-Math.min(1.45*16,Math.max(16,innerWidth*.02))*1.2)<.1&&Math.abs(smile.width-Math.min(143,Math.max(70.4,innerWidth*.099))*1.2)<.1,
          smileShift:Math.abs(smile.left-title.left-smile.width*.22)<.1,
          blessingCentered:Math.abs((blessing.left+blessing.right)/2-(image.left+image.right)/2)<1&&blessing.bottom<image.bottom&&image.bottom-blessing.bottom<=33&&blessing.top>smile.bottom,
          heroText:document.querySelector('.masthead__copy p').textContent==='Onde a fome termina e o sorriso começa'&&document.querySelector('.masthead__blessing').textContent==='Deus seja louvado',
          noNumbers:!document.querySelector('.product-row__number'),
          ordered:positions.every((p,i)=>!i||p>positions[i-1]),
          mediaLeft:rows.every(row=>rect(row.querySelector('.product-row__visual')).right<=rect(row.querySelector('.product-row__main')).left),
          addInside:rows.every(row=>{const a=rect(row.querySelector('.product-row__action')),b=rect(row.querySelector('.product-row__visual'));return a.left>=b.left&&a.left<b.left+12&&a.bottom<=b.bottom&&a.bottom>b.bottom-12&&a.width>=40}),
          allTextFits:rows.every(row=>{const text=row.querySelector('.product-row__main');return text.scrollWidth<=text.clientWidth+1}),
          square:cards.every(c=>{const r=rect(c.querySelector('.spotlight__photo'));return Math.abs(r.width-r.height)<1}),
          visible:cards.filter(c=>rect(c).left>=box.left-1&&rect(c).right<=box.right+1).length,
          scrollable:carousel.scrollWidth>carousel.clientWidth,
          titleStyles:rows.map(row=>{const s=getComputedStyle(row.querySelector('h3'));return {drink:row.classList.contains('product-row--drink'),size:s.fontSize,weight:s.fontWeight,family:s.fontFamily}})
        };
      })()`);
      for (const key of ['heroClear','heroSizes','smileShift','blessingCentered','heroText','noNumbers','ordered','mediaLeft','addInside','allTextFits','square']) assert(geometry[key], width + ': ' + key);
      assert(!geometry.overflow, width + ': overflow');
      assert.equal(geometry.visible, width < 680 ? 3 : 4);
      assert.equal(geometry.scrollable, width < 680);
      for (const style of geometry.titleStyles) {
        assert(style.family.includes('Cormorant Garamond'));
        assert.equal(style.weight, style.drink ? '500' : '600');
        assert(Math.abs(parseFloat(style.size) - (width<=680?23.2:style.drink?13.12:24.8))<.1, 'Title font-size changed');
      }
      await screenshot('hero-' + width);
      await evaluate('document.querySelector("#destaques").scrollIntoView({behavior:"instant"})'); await delay(180);
      await screenshot('highlights-' + width);
      if (width < 680) {
        const touch=await evaluate('(()=>{const r=document.querySelector(".spotlight").getBoundingClientRect();return {x:r.right-24,y:r.top+48}})()');
        await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
        for(let step=1;step<=6;step++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x-step*30,y:touch.y}]});await delay(20);}
        await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(300);
        assert(await evaluate('document.querySelector(".spotlight").scrollLeft>0'));
        await evaluate('document.querySelector(".spotlight").scrollTo({left:0,behavior:"instant"})');
      }
      await click('#openSearch');
      await delay(220);
      assert(await evaluate('document.activeElement.id==="search"'));
      assert.deepEqual(await evaluate('[...document.querySelectorAll("#searchCategories [data-nav]")].map(a=>a.dataset.nav)'),order);
      assert(await evaluate('(()=>{const r=document.querySelector("#searchPanel").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})()'));
      await screenshot('search-' + width);
      for (const id of order) {
        if (await evaluate('document.querySelector("#searchPanel").hidden')) await click('#openSearch');
        await click('#searchCategories [data-nav="' + id + '"]'); await delay(350);
        assert(await evaluate('document.querySelector("#searchPanel").hidden'));
        assert(await evaluate('document.querySelector("#'+id+' h2").getBoundingClientRect().top>=document.querySelector(".topbar").getBoundingClientRect().bottom+47'), 'Heading obscured: ' + id);
      }
      await evaluate('document.querySelector("#hamburgueres").scrollIntoView({behavior:"instant"})'); await delay(120); await screenshot('products-' + width);
      await evaluate('document.querySelector(".footer").scrollIntoView({behavior:"instant"})'); await delay(120); await screenshot('footer-' + width);
      console.log('PASS layout, carousel, category links, search focus: ' + width + 'px');
    }
    await click('#openSearch');
    await evaluate('document.querySelector("#search").value="bacon";document.querySelector("#search").dispatchEvent(new Event("input",{bubbles:true}))');
    assert(await evaluate('[...document.querySelectorAll(".product-row h3")].some(el=>el.textContent==="Allegre Bacon")'));
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await delay(50);
    assert(await evaluate('document.querySelector("#searchPanel").hidden&&document.activeElement.id==="openSearch"&&document.querySelector("#search").value==="bacon"'));
    await click('#openSearch'); await click('.masthead h1');
    assert(await evaluate('document.querySelector("#searchPanel").hidden'));
    await click('#openSearch'); await click('#openSearch');
    assert(await evaluate('document.querySelector("#searchPanel").hidden'));
    await click('#openSearch'); await click('#searchCategories [data-nav="destaques"]'); await delay(350);
    assert.equal(await evaluate('document.querySelector("#search").value'), '');
    for (const id of highlights) {
      await click('.spotlight__item[data-product="' + id + '"]');
      assert.equal(await evaluate('document.querySelector("#modalTitle").textContent'),menu.products.find(p=>p.id===id).name);
      const p=menu.products.find(p=>p.id===id);
      if (p.type==='combo') {
        const countBefore=await evaluate('state.cart.length');await click('#modalAdd');
        assert.equal(await evaluate('state.cart.length'), countBefore, 'Incomplete combo accepted');
        await evaluate('[...document.querySelectorAll("#modalBody select")].forEach(select=>{select.selectedIndex=1;select.dispatchEvent(new Event("change",{bubbles:true}))})');
      }
      if(id==='allegre-brasa') await evaluate('document.querySelector("[data-remove]").click();document.querySelectorAll("[data-modal-qty]")[1].click()');
      await click('#modalAdd');
      assert(await evaluate('document.querySelector("#productModal").hidden&&!document.querySelector("#openCart").hidden'));
    }
    assert.equal(await evaluate('state.cart.reduce((sum,line)=>sum+line.qty,0)'),5);
    assert.equal(await evaluate('state.cart[0].config.removed.length'),1);
    assert.equal(await evaluate('window.dataLayer.filter(e=>e.event==="add_to_cart").length'),4);
    await click('.product-row__action[data-product="allegre-classico"]');
    assert(await evaluate('document.querySelector(".modal-photo img").src.endsWith("/assets/allegre-classico.jpeg")'));
    await click('#modalAdd');
    await click('#openCart');
    await evaluate('while(state.cart.length)changeCart(state.cart[0].key,-state.cart[0].qty)');
    assert(await evaluate('document.querySelector("#openCart").hidden'));await evaluate('closeAll()');
    const links=await evaluate('[...document.querySelectorAll(".footer a")].map(a=>({href:a.getAttribute("href"),target:a.target,rel:a.rel}))');
    assert.equal(links[0].href,'politica-de-privacidade.html');assert.equal(links[0].target,'');
    assert.equal((await fetch(origin+'/'+links[0].href)).status,200);
    assert.equal(links[1].href,'https://www.instagram.com/allegre_burguer?stkn=YmJtdWhtODIzcXk1&utm_source=qr');
    assert.equal(links[2].href,'https://wa.me/5511921349066');
    for(const link of links.slice(1)){assert.equal(link.target,'_blank');assert(link.rel.includes('noopener')&&link.rel.includes('noreferrer'));}
    assert.deepEqual(failures,[]);
    console.log('PASS search persistence/closing, 4 highlights, combo validation, customization, cart, tracking, Classico photo, footer destinations, console');
    console.log('Screenshots: '+output);
  } finally {
    clearTimeout(watchdog);if(ws)ws.close();browser.kill();server.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
