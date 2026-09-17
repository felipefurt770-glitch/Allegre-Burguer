const state={data:null,cart:JSON.parse(localStorage.getItem('allegre.cart.v2')||'[]'),query:'',current:null,currentConfig:null,mode:'delivery',utm:{}};
const $=(s,p=document)=>p.querySelector(s); const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v||0));
const CATEGORY_TRAIL_SCROLL_START=110;
let cancelCategoryScroll=()=>{};

function pushEvent(event,payload={}){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...payload});}
function save(){localStorage.setItem('allegre.cart.v2',JSON.stringify(state.cart));}
function product(id){return state.data.products.find(p=>p.id===id)}
function captureUTM(){const p=new URLSearchParams(location.search);['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'].forEach(k=>{if(p.get(k))state.utm[k]=p.get(k)});if(Object.keys(state.utm).length)localStorage.setItem('allegre.utm',JSON.stringify(state.utm));else state.utm=JSON.parse(localStorage.getItem('allegre.utm')||'{}');}
async function load(){captureUTM();state.data=await fetch('./menu.json',{cache:'no-store'}).then(r=>r.json());renderMenu();renderCart();wire();pushEvent('menu_view',{source:state.utm.utm_source||'direct'});}
function wire(){
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#modalBackdrop').hidden||!$('#searchPanel').hidden)e.preventDefault();if(!$('#modalBackdrop').hidden)closeAll();closeSearch()}});
 $('#search').addEventListener('input',e=>{state.query=e.target.value.toLowerCase().trim();renderMenu()});
 $('#openSearch').addEventListener('click',toggleSearch);
 document.addEventListener('click',e=>{if(!$('#searchPanel').hidden&&!e.target.closest('#searchPanel, #openSearch'))closeSearch()});
 wireCategoryScroll();
 $('#openCart').addEventListener('click',()=>openSheet('cart'));$('[data-action="cart"]')?.addEventListener('click',()=>openSheet('cart'));
 $('#modalBackdrop').addEventListener('click',closeAll);$$('[data-close]').forEach(b=>b.addEventListener('click',closeAll));
 $('#modalAdd').addEventListener('click',commitCurrent);$('#goCheckout').addEventListener('click',()=>{if(!state.cart.length)return toast('Sua sacola está vazia');openSheet('checkout');pushEvent('begin_checkout',{value:cartTotal()})});
 $('#modeDelivery').addEventListener('click',()=>setMode('delivery'));$('#modePickup').addEventListener('click',()=>setMode('pickup'));$('#checkoutForm').addEventListener('submit',finishOrder);
}
function wireCategoryScroll(){
 let frame=0;
 const update=()=>{
  frame=0;
  updateCategoryTrail();
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('pageshow',schedule);
 update();
 document.fonts?.ready.then(schedule);
}
function toggleSearch(){const panel=$('#searchPanel');if(panel.hidden){panel.hidden=false;$('#openSearch').setAttribute('aria-expanded','true');$('#search').focus({preventScroll:true})}else closeSearch()}
function closeSearch(){const panel=$('#searchPanel');if(!panel.hidden){panel.hidden=true;$('#openSearch').setAttribute('aria-expanded','false');$('#openSearch').focus({preventScroll:true})}}
function renderNav(){
 const markup=state.data.categories.map(c=>`<a href="#${c.id}" data-nav="${c.id}">${c.name}</a>`).join('');
 $('#nav').innerHTML=markup;
 $('#searchCategories').innerHTML=markup;
 $$('[data-nav]').forEach(link=>link.onclick=e=>{e.preventDefault();navigateCategory(link.dataset.nav)});
 updateCategoryTrail();
}
function navigateCategory(id){
 // Choosing a category exits the filter so every section remains reachable.
 if(state.query){state.query='';$('#search').value='';renderMenu()}
 closeSearch();
 const section=document.getElementById(id);
 if(!section)return;
 const offset=$('.topbar').offsetHeight+$('#nav').offsetHeight+12;
 const heading=$('h2',section);
 heading.tabIndex=-1;heading.focus({preventScroll:true});
 scrollToCategory(window.scrollY+section.getBoundingClientRect().top-offset);
}
function scrollToCategory(top){
 cancelCategoryScroll();
 const start=window.scrollY,target=Math.max(0,Math.min(top,document.documentElement.scrollHeight-innerHeight));
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.scrollTo({top:target,behavior:'instant'});return}
 const started=performance.now(),controller=new AbortController();
 let frame=0;
 const cancel=()=>{cancelAnimationFrame(frame);controller.abort()};
 cancelCategoryScroll=cancel;
 for(const event of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(event,cancel,{passive:true,signal:controller.signal});
 const step=now=>{
  const progress=Math.min(1,(now-started)/260),eased=1-Math.pow(1-progress,3);
  window.scrollTo({top:start+(target-start)*eased,behavior:'instant'});
  if(progress<1)frame=requestAnimationFrame(step);else cancel();
 };
 frame=requestAnimationFrame(step);
}
function updateCategoryTrail(){
 const nav=$('#nav'),header=$('.topbar'),sections=$$('#menuRoot .menu-section');
 const visible=sections.length>0&&window.scrollY>=CATEGORY_TRAIL_SCROLL_START;
 nav.classList.toggle('is-visible',visible);nav.inert=!visible;
 nav.setAttribute('aria-hidden',String(!visible));
 document.documentElement.style.setProperty('--menu-scroll-offset',(header.offsetHeight+nav.offsetHeight+12)+'px');
 const boundary=header.offsetHeight+nav.offsetHeight+24;
 let active=sections[0],activeTop=-Infinity;
 for(const section of sections){
  const top=section.getBoundingClientRect().top;
  if(top<=boundary&&top>activeTop+1){active=section;activeTop=top}
 }
 if(window.scrollY>0&&Math.ceil(window.scrollY+innerHeight)>=document.documentElement.scrollHeight-2)active=sections.at(-1);
 for(const button of $$('[data-nav]')){
  const selected=button.dataset.nav===active?.id,changed=selected&&!button.classList.contains('active');
  button.classList.toggle('active',selected);
  if(selected)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');
  if(changed&&nav.contains(button)){
   const left=button.offsetLeft-(nav.clientWidth-button.offsetWidth)/2;
   nav.scrollTo({left,behavior:visible&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});
  }
 }
}
function searchText(p){
 const categories=state.data.categories.filter(c=>c.productIds.includes(p.id)).map(c=>c.name);
 return [p.name,p.description,p.shortCopy,...(p.ingredients||[]),...categories].join(' ').toLowerCase();
}
function productMedia(p){
 return p.image
  ? '<img src="'+p.image+'" alt="'+p.name+'" width="320" height="320" loading="lazy" decoding="async">'
  : '<span class="photo-placeholder"><span>Foto em breve</span></span>';
}
function sectionMarkup(category,items){
 if(!items.length)return '';
 const titleId=category.id+'Title';
 const heading='<div class="section-head"><h2 id="'+titleId+'">'+category.name+'</h2></div>';
 if(category.id==='destaques')return '<section id="'+category.id+'" class="menu-section menu-section--highlights" aria-labelledby="'+titleId+'">'+heading+
  '<div class="spotlight" role="group" aria-label="Produtos em destaque">'+items.map(p=>
   '<button class="spotlight__item" type="button" data-product="'+p.id+'" aria-label="Ver '+p.name+' por '+money(p.price)+'">'+
   '<span class="spotlight__photo">'+productMedia(p)+'</span><span class="spotlight__price">'+money(p.price)+'</span><strong>'+p.name+'</strong></button>'
  ).join('')+'</div></section>';
 return '<section id="'+category.id+'" class="menu-section" aria-labelledby="'+titleId+'">'+heading+
  '<div class="menu-list">'+items.map(card).join('')+'</div></section>';
}
function renderMenu(){
 const filtered=state.data.categories.map(category=>({category,items:category.productIds.map(product).filter(Boolean).filter(p=>!state.query||searchText(p).includes(state.query))}));
 const count=new Set(filtered.flatMap(group=>group.items.map(p=>p.id))).size;
 $('#resultCount').textContent=state.query?count+' resultado(s)':'';
 $('#menuRoot').innerHTML=filtered.map(({category,items})=>sectionMarkup(category,items)).join('')||'<p class="empty-results">Nenhum produto encontrado. Tente outro nome ou ingrediente.</p>';
 $$('[data-product]',$('#menuRoot')).forEach(button=>button.onclick=()=>openProduct(button.dataset.product));
 renderNav();
}
function card(p){
 return '<article class="product-row'+(p.type==='drink'?' product-row--drink':'')+'">'+
  '<div class="product-row__visual">'+
   '<button class="product-row__photo" type="button" data-product="'+p.id+'" aria-label="Ver '+p.name+'">'+productMedia(p)+'</button>'+
   '<button class="product-row__action" type="button" data-product="'+p.id+'" aria-label="'+(p.type==='combo'?'Montar':'Escolher')+' '+p.name+'">+</button>'+
  '</div><div class="product-row__main"><h3>'+p.name+'</h3>'+
   (p.description?'<p class="product-row__desc">'+p.description+'</p>':'')+
   (p.shortCopy?'<p class="product-row__short">'+p.shortCopy+'</p>':'')+
   '<span class="product-row__price">'+money(p.price)+'</span></div></article>';
}
function openProduct(id){const p=product(id);state.current=p;state.currentConfig={qty:1,removed:[],extras:[],burgers:[],drinks:[],notes:''};$('#modalAdd').disabled=false;$('#modalTitle').textContent=p.name;$('#modalBody').innerHTML=modalContent(p);updateModalTotal();openSheet('product');wireModal(p);pushEvent('view_item',{item_id:p.id,item_name:p.name,value:p.price});}
function modalContent(p){let html='';if(p.image)html+=`<div class="modal-photo"><img src="${p.image}" alt="${p.name}"></div>`;html+=`<p class="modal-desc">${p.description||''}</p>`;if(p.ingredients?.length){html+=`<div class="option-group"><h3>Ingredientes</h3><small>Toque para retirar algum ingrediente.</small><div class="choice-list">${p.ingredients.map((x,i)=>`<div class="choice"><label><input type="checkbox" data-remove="${i}"><span>${x}</span></label><span>retirar</span></div>`).join('')}</div></div>`}
if(p.type==='burger')html+=`<div class="option-group"><h3>Adicionais</h3><small>Estrutura pronta. Os preços serão ativados após validação do CMV.</small><div class="choice-list"><div class="choice"><span>Nenhum adicional pago disponível nesta versão</span><span>—</span></div></div></div>`;
if(p.type==='combo')html+=comboBuilder(p);
html+=`<div class="option-group"><h3>Observações</h3><textarea id="itemNotes" rows="3" placeholder="Ex.: sem molho..." style="width:100%;margin-top:10px;background:#171717;color:#fff;border:1px solid var(--line);border-radius:14px;padding:12px"></textarea></div><div class="option-group"><h3>Quantidade</h3><div class="qty-row"><button type="button" data-modal-qty="-1">−</button><b id="modalQty">1</b><button type="button" data-modal-qty="1">+</button></div></div>`;return html;}
function comboBuilder(p){const burgerOpts=state.data.optionGroups.burgerChoice.options.map(o=>`<option value="${o.id}">${o.label}</option>`).join('');const drinkOpts=state.data.optionGroups.drinkChoice.options.map(o=>`<option value="${o.id}">${o.label}</option>`).join('');let html=`<div class="option-group"><h3>Monte seu combo</h3><small>As escolhas abaixo estão incluídas no preço do combo.</small>`;for(let i=0;i<p.builder.burgerSlots;i++)html+=`<div class="combo-slot"><b>Hambúrguer ${i+1}</b><select data-combo-burger="${i}"><option value="">Escolha...</option>${burgerOpts}</select></div>`;html+=`<div class="combo-slot"><b>${p.builder.fries.qty}x ${p.builder.fries.name}</b><div class="cart-line__meta">Porção de ${p.builder.fries.portion}</div></div>`;for(let i=0;i<p.builder.drinkSlots;i++)html+=`<div class="combo-slot"><b>Refrigerante ${i+1}</b><select data-combo-drink="${i}"><option value="">Escolha...</option>${drinkOpts}</select></div>`;html+='</div>';return html;}
function wireModal(p){$$('[data-remove]').forEach(el=>el.onchange=()=>{const i=Number(el.dataset.remove),v=p.ingredients[i];state.currentConfig.removed=el.checked?[...state.currentConfig.removed,v]:state.currentConfig.removed.filter(x=>x!==v)});$$('[data-combo-burger]').forEach(el=>el.onchange=()=>state.currentConfig.burgers[Number(el.dataset.comboBurger)]=el.value);$$('[data-combo-drink]').forEach(el=>el.onchange=()=>state.currentConfig.drinks[Number(el.dataset.comboDrink)]=el.value);$$('[data-modal-qty]').forEach(b=>b.onclick=()=>{state.currentConfig.qty=Math.max(1,state.currentConfig.qty+Number(b.dataset.modalQty));$('#modalQty').textContent=state.currentConfig.qty;updateModalTotal()});$('#itemNotes').oninput=e=>state.currentConfig.notes=e.target.value;}
function updateModalTotal(){$('#modalTotal').textContent=money((state.current?.price||0)*(state.currentConfig?.qty||1))}
function validateCurrent(){const p=state.current,c=state.currentConfig;if(p.type==='combo'){if(c.burgers.filter(Boolean).length!==p.builder.burgerSlots)return 'Escolha todos os hambúrgueres do combo';if(c.drinks.filter(Boolean).length!==p.builder.drinkSlots)return 'Escolha todos os refrigerantes do combo'}return''}
function commitCurrent(){
 if($('#modalAdd').disabled||$('#productModal').hidden)return;
 const err=validateCurrent();if(err)return toast(err);
 const p=state.current,c=structuredClone(state.currentConfig);
 const source=$('#modalAdd').getBoundingClientRect();
 $('#modalAdd').disabled=true;
 state.cart.push({key:crypto.randomUUID?.()||String(Date.now()+Math.random()),id:p.id,qty:c.qty,unitPrice:p.price,config:c});
 save();closeAll();renderCart();$('#openCart').focus({preventScroll:true});
 animateAddToCart(source,p,c.qty);
 pushEvent('add_to_cart',{item_id:p.id,item_name:p.name,value:p.price*c.qty,quantity:c.qty});
}
function animateAddToCart(source,p,qty){
 const button=$('#openCart');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const target=button.getBoundingClientRect(),fly=document.createElement('div');
 fly.className='cart-fly';fly.setAttribute('aria-hidden','true');
 if(p.image){const img=document.createElement('img');img.src=p.image;img.alt='';fly.append(img)}
 const badge=document.createElement('span');badge.textContent='+'+qty;fly.append(badge);
 const x=source.left+source.width/2,y=source.top+source.height/2;
 fly.style.left=x+'px';fly.style.top=y+'px';document.body.append(fly);
 const dx=target.left+target.width/2-x,dy=target.top+target.height/2-y;
 const animation=fly.animate([
  {transform:'translate(-50%,-50%) scale(1)',opacity:1},
  {transform:'translate(calc(-50% + '+dx*.35+'px),calc(-50% + '+(dy*.25-45)+'px)) scale(.85)',opacity:1,offset:.4},
  {transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.12)',opacity:0}
 ],{duration:520,easing:'cubic-bezier(.3,.05,.6,1)',fill:'forwards'});
 animation.oncancel=()=>fly.remove();
 animation.onfinish=()=>{
  fly.remove();if(button.hidden)return;
  button.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:280});
  $('#cartCount').animate([{transform:'scale(1)'},{transform:'scale(1.5)'},{transform:'scale(1)'}],{duration:280});
 };
}

function itemMeta(line){const p=product(line.id),c=line.config||{},bits=[];if(c.removed?.length)bits.push('Retirar: '+c.removed.join(', '));if(c.burgers?.length)bits.push('Hambúrgueres: '+c.burgers.filter(Boolean).map(id=>product(id)?.name||id).join(', '));if(c.drinks?.length)bits.push('Bebidas: '+c.drinks.filter(Boolean).map(id=>product(id)?.name||id).join(', '));if(c.notes)bits.push('Obs.: '+c.notes);return bits.join(' • ')}
function cartTotal(){return state.cart.reduce((s,l)=>s+(l.unitPrice??product(l.id)?.price??0)*l.qty,0)}
function renderCart(){const validCart=state.cart.filter(l=>product(l.id));if(validCart.length!==state.cart.length){state.cart=validCart;save()}const n=state.cart.reduce((s,l)=>s+l.qty,0),cartButton=$('#openCart'),hasItems=n>0;cartButton.hidden=!hasItems;cartButton.classList.toggle('is-visible',hasItems);cartButton.setAttribute('aria-label','Abrir sacola, '+n+(n===1?' item':' itens'));$('#goCheckout').disabled=!hasItems;cartButton.setAttribute('aria-hidden',String(!hasItems));cartButton.tabIndex=hasItems?0:-1;$('#cartCount').textContent=n;$('#cartTotal').textContent=money(cartTotal());if(!state.cart.length){$('#cartBody').innerHTML='<div style="text-align:center;color:#888;padding:50px 10px">Sua sacola está vazia.<br><br>Escolha algo que dê vontade de pedir de novo.</div>';return}$('#cartBody').innerHTML=state.cart.map(l=>{const p=product(l.id);return `<div class="cart-line"><div><strong>${p.name}</strong><div class="cart-line__meta">${itemMeta(l)||'Sem personalizações'}</div><div class="qty-row" style="margin-top:10px"><button type="button" data-dec="${l.key}" aria-label="Diminuir quantidade de ${p.name}">−</button><span>${l.qty}</span><button type="button" data-inc="${l.key}" aria-label="Aumentar quantidade de ${p.name}">+</button></div></div><strong>${money(l.unitPrice*l.qty)}</strong></div>`}).join('')+crossSell();$$('[data-dec]').forEach(b=>b.onclick=()=>changeCart(b.dataset.dec,-1));$$('[data-inc]').forEach(b=>b.onclick=()=>changeCart(b.dataset.inc,1));$$('[data-cross]').forEach(b=>b.onclick=()=>openProduct(b.dataset.cross));}
function changeCart(key,d){const l=state.cart.find(x=>x.key===key);if(!l)return;l.qty+=d;if(l.qty<=0)state.cart=state.cart.filter(x=>x.key!==key);save();renderCart();}
function crossSell(){const ids=new Set();state.cart.forEach(l=>(product(l.id)?.crossSell||[]).forEach(id=>ids.add(id)));state.cart.forEach(l=>ids.delete(l.id));const arr=[...ids].map(product).filter(Boolean).slice(0,4);if(!arr.length)return'';return `<div class="cross"><h3>Peça também</h3><p>Complementos que combinam com sua sacola.</p><div class="cross__grid">${arr.map(p=>`<button type="button" data-cross="${p.id}"><strong>${p.name}</strong><br><span>${money(p.price)}</span></button>`).join('')}</div></div>`}
function openSheet(kind){closeAll(false);$('#modalBackdrop').hidden=false;const map={product:'#productModal',cart:'#cartDrawer',checkout:'#checkoutDrawer'};$(map[kind]).hidden=false;document.body.classList.add('lock');if(kind==='cart')pushEvent('view_cart',{value:cartTotal()});}
function closeAll(hideBackdrop=true){$('#productModal').classList.remove('sheet--closing');['#productModal','#cartDrawer','#checkoutDrawer'].forEach(s=>$(s).hidden=true);if(hideBackdrop)$('#modalBackdrop').hidden=true;document.body.classList.remove('lock')}
function setMode(m){state.mode=m;$('#modeDelivery').classList.toggle('active',m==='delivery');$('#modePickup').classList.toggle('active',m==='pickup');$('#deliveryFields').style.display=m==='delivery'?'grid':'none';}
function buildOrder(form){const fd=new FormData(form),timestamp=new Date().toISOString(),subtotal=cartTotal(),customer={name:fd.get('name'),phone:fd.get('phone')},address={cep:fd.get('cep')||'',address:fd.get('address')||'',number:fd.get('number')||'',district:fd.get('district')||'',complement:fd.get('complement')||''},items=state.cart.map(l=>({productId:l.id,name:product(l.id).name,qty:l.qty,unitPrice:l.unitPrice,lineTotal:l.unitPrice*l.qty,config:l.config}));return {orderId:'ALG-'+Date.now().toString(36).toUpperCase(),timestamp,createdAt:timestamp,customer,telefone:customer.phone,modalidade:state.mode,endereco:state.mode==='delivery'?address:null,itens:items,personalizacoes:items.map(item=>({productId:item.productId,config:item.config})),subtotal,taxaDeEntrega:null,total:null,formaDePagamento:fd.get('payment'),observacoes:fd.get('notes')||'',origem:state.utm.utm_source||'direct',utm_source:state.utm.utm_source||'',utm_medium:state.utm.utm_medium||'',utm_campaign:state.utm.utm_campaign||'',utm_content:state.utm.utm_content||'',utm_term:state.utm.utm_term||'',gclid:state.utm.gclid||'',fbclid:state.utm.fbclid||'',channel:'cardapio_proprio',attribution:state.utm,fulfillment:{mode:state.mode,...address,deliveryFee:null,deliveryFeeStatus:state.mode==='delivery'?'to_confirm':'not_applicable'},payment:fd.get('payment'),notes:fd.get('notes')||'',items,totals:{items:subtotal,deliveryFee:null,grandTotal:null},crm:{status:'new',source:state.utm.utm_source||'direct',campaign:state.utm.utm_campaign||'',consent:true}}}
function orderMessage(o){const items=o.items.map(i=>{const meta=itemMeta({id:i.productId,config:i.config});return `• ${i.qty}x ${i.name} — ${money(i.lineTotal)}${meta?`\n  ${meta}`:''}`}).join('\n');const addr=o.fulfillment.mode==='delivery'?`Endereço: ${o.fulfillment.address}, ${o.fulfillment.number} — ${o.fulfillment.district}${o.fulfillment.complement?` (${o.fulfillment.complement})`:''}\nCEP: ${o.fulfillment.cep}\nTaxa de entrega: a confirmar`:'Modalidade: Retirada';return [`Olá, Allegre! Quero fazer um pedido direto pelo cardápio:`,`Pedido: ${o.orderId}`,'',items,'',`Total dos itens: ${money(o.totals.items)}`,addr,`Cliente: ${o.customer.name}`,`WhatsApp: ${o.customer.phone}`,`Pagamento: ${o.payment}`,o.notes?`Observações: ${o.notes}`:''].filter(Boolean).join('\n')}
function finishOrder(e){e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;if(state.mode==='delivery'){const fd=new FormData(form);if(!fd.get('address')||!fd.get('number')||!fd.get('district'))return toast('Preencha o endereço de entrega')}const order=buildOrder(form);localStorage.setItem('allegre.lastOrder',JSON.stringify(order));const history=JSON.parse(localStorage.getItem('allegre.orders')||'[]');history.push(order);localStorage.setItem('allegre.orders',JSON.stringify(history.slice(-50)));pushEvent('purchase_intent',{order_id:order.orderId,value:order.totals.items,source:order.crm.source,campaign:order.crm.campaign});const wa=state.data.brand.whatsapp.replace(/\D/g,'');window.open(`https://wa.me/${wa}?text=${encodeURIComponent(orderMessage(order))}`,'_blank');toast('Pedido preparado para o WhatsApp');}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),1900)}
load().catch(err=>{console.error(err);document.body.innerHTML='<p style="color:white;padding:30px">Não foi possível carregar o cardápio.</p>'});
