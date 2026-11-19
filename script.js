/* Контакты и настройки лежат в файле config.js */
const CONFIG = window.NJ;

const SERVICES = [
  {id:'ingrown', img:'serv-ingrown.jpg', alt:'Вросший ноготь, фото до обработки', name:'Лечение вросшего ногтя', icon:'<path d="M18 8c-6 0-9 8-9 16 0 8 4 14 4 22h14c0-7 3-12 3-20 0-10-4-18-12-18z"/><path d="M16 12c3-2 8 0 8 5"/><path d="M34 6l6 4M36 14l5 1"/>'},
  {id:'calluses', img:'serv-calluses.jpg', alt:'Натоптыши на стопе, фото до обработки', name:'Обработка натоптышей и мозолей', icon:'<path d="M22 6c-7 0-10 7-9 15 1 7-3 12-3 19 0 6 4 9 10 9s9-3 9-9c0-8-3-12-2-19 .5-8-1-15-5-15z"/><circle cx="14" cy="5" r="1.6"/><circle cx="21" cy="2.5" r="1.4"/><circle cx="27" cy="3.5" r="1.4"/>'},
  {id:'pedicure', img:'serv-pedicure.jpg', alt:'Кабинет подолога со стерилизатором', name:'Аппаратный педикюр', icon:'<path d="M12 40L34 8l6 4L18 44z"/><path d="M22 28l8 5"/><path d="M8 14l4-4M6 22h5"/>'},
  {id:'fungus', img:'serv-fungus.jpg', alt:'Ногти стоп, поражённые грибком', name:'Лечение грибка ногтей и кожи', icon:'<circle cx="24" cy="26" r="8"/><path d="M24 8v6M24 38v6M8 26h6M34 26h6M13 15l4 4M31 33l4 4M35 15l-4 4M17 33l-4 4"/>'}
];
const HOTS = [
  {id:'ingrown', service:'ingrown', x:22.5, y:80, zw:14, zh:10, title:'Вросший ноготь', text:'Снимаем боль и воспаление, аккуратно освобождаем край ногтя и подсказываем, как избежать повторения.'},
  {id:'fungus', service:'fungus', x:35, y:84.5, zw:24, zh:10, title:'Грибок ногтей', text:'Осматриваем ногти, обрабатываем поражённые участки и подбираем уход. Если нужно, посоветуем обратиться к дерматологу.'},
  {id:'pedicure', service:'pedicure', x:46.5, y:63.5, zw:30, zh:22, title:'Аппаратный педикюр', text:'Безопасная обработка стопы и ногтей аппаратом: аккуратно, без порезов и лишней влаги.'},
  {id:'heel', service:'calluses', x:73.5, y:54, zw:16, zh:18, title:'Пятки, натоптыши и мозоли', text:'Убираем огрубевшую кожу, мозоли и трещины на пятках, чтобы ходить без боли.'},
  {id:'skin', service:'fungus', x:71, y:32, zw:26, zh:20, title:'Кожа стопы', text:'Осмотр кожи, обработка при грибковых поражениях и рекомендации по домашнему уходу.'}
];

/* ПРАЙС-ЛИСТ: правьте названия и цены здесь. Строка: [название, цена]. */
const PRICES = [
  {group:'Консультация и уход', rows:[
    ['Консультация специалиста','5 000'],
    ['Стрижка ногтей и придание формы','5 000'],
    ['Аппаратный педикюр (без покрытия)','15 000'],
    ['Аппаратная обработка ногтей','10 000'],
    ['Аппаратная обработка стоп (без ногтей)','8 000–15 000']
  ]},
  {group:'Проблемные стопы и ногти', rows:[
    ['Подологическая обработка проблемных стоп и ногтей (трещины, гиперкератоз, онихомикоз; зависит от сложности)','15 000–25 000'],
    ['Подологическая обработка ногтей (онихомикоз, онихогрифоз), 1 ед.','10 000–15 000'],
    ['Подологическая обработка ногтей (онихомикоз, онихогрифоз), 5 ед. и более','25 000–30 000'],
    ['Обработка травмированного ногтя, 1 ед.','10 000–15 000'],
    ['Протезирование ногтевой пластины, 1 ед.','6 000–10 000']
  ]},
  {group:'Вросший ноготь', rows:[
    ['Удаление вросшего ногтя, 1 ед.','10 000–15 000'],
    ['Коррекционная система (титановая нить), 1 ед.','15 000'],
    ['Обновление коррекционной системы в течение месяца','10 000'],
    ['Коррекционная система (3ТО, Росса Фрезера), 1 ед.','20 000'],
    ['Обновление коррекционной системы в течение месяца','10 000']
  ]},
  {group:'Кожа стоп', rows:[
    ['Обработка натоптышей, мозолей, 1 ед.','6 000–8 000'],
    ['Обработка натоптышей, мозолей, более 3 ед.','10 000–12 000'],
    ['Обработка бородавки, 1 ед.','5 000'],
    ['Обработка бородавки, более 3 ед.','15 000']
  ]},
  {group:'Ортопедия', rows:[
    ['Подбор ортопедических стелек','20 000'],
    ['Подбор индивидуальных силиконовых ортезов','5 000–10 000'],
    ['Наложение разгрузочного материала, тейпирование, 1 ед.','1 000–5 000']
  ]}
];

const $ = (s,r=document)=>r.querySelector(s);
const NS='http://www.w3.org/2000/svg';
const el=(tag,attrs={},parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e};

/* ---------- interactive foot ---------- */
const infoBox=$('#info'), infoTitle=$('#infoTitle'), infoText=$('#infoText'), infoBook=$('#infoBook');
let currentHot=null, selectedService='ingrown';

HOTS.forEach(h=>{
  const z=document.createElement('div');
  z.className='zone'; z.style.cssText=`left:${h.x}%;top:${h.y}%;width:${h.zw}%;height:${h.zh}%`;
  $('#zones').appendChild(z); h.zoneEl=z;
  const b=document.createElement('button');
  b.type='button'; b.className='hot'; b.style.cssText=`left:${h.x}%;top:${h.y}%`; b.setAttribute('aria-label',h.title);
  $('#hots').appendChild(b); h.el=b;
  const pick=()=>selectHot(h.id);
  b.addEventListener('click',pick); b.addEventListener('mouseenter',pick); b.addEventListener('focus',pick);
});

function selectHot(id,silent){
  const h=HOTS.find(x=>x.id===id); if(!h) return;
  const changed=currentHot!==id;
  currentHot=id; selectedService=h.service;
  HOTS.forEach(o=>{o.el.classList.toggle('on',o.id===id);o.zoneEl.classList.toggle('on',o.id===id)});
  infoTitle.textContent=h.title; infoText.textContent=h.text;
  if(changed&&!silent){infoBox.classList.remove('swap');void infoBox.offsetWidth;infoBox.classList.add('swap')}
}
infoBook.addEventListener('click',()=>{$('#svcSel').value=selectedService;if(window.syncPopX)syncPopX()});
selectHot('ingrown',true);

/* ---------- services ---------- */
const cards=$('#cards');
SERVICES.forEach(s=>{
  const b=document.createElement('button');
  b.type='button'; b.className='svc';
  b.innerHTML=`<span class="pic"><svg class="ic" viewBox="0 0 48 52" aria-hidden="true">${s.icon}</svg><img src="${s.img}" alt="${s.alt}" loading="lazy"></span><span class="row"><span class="n">${s.name}</span><span class="go" aria-hidden="true">→</span></span>`;
  b.querySelector('img').addEventListener('error',e=>e.target.remove());
  b.addEventListener('click',()=>{$('#svcSel').value=s.id;if(window.syncPopX)syncPopX();$('#zapis').scrollIntoView({behavior:'smooth',block:'center'})});
  cards.appendChild(b);
});
$('#prev').onclick=()=>cards.scrollBy({left:-280,behavior:'smooth'});
$('#next').onclick=()=>cards.scrollBy({left:280,behavior:'smooth'});

/* ---------- booking ---------- */
const svcSel=$('#svcSel');
SERVICES.forEach(s=>svcSel.add(new Option(s.name,s.id)));
svcSel.add(new Option('Не знаю, нужна консультация','other'));
svcSel.value='ingrown';
/* популярные услуги в окне записи */
const POP_PRICE={ingrown:'от 10 000 ₸',calluses:'от 6 000 ₸',pedicure:'от 15 000 ₸',fungus:'от 10 000 ₸'};
const popBox=$('#popSvc');
SERVICES.forEach(s=>{
  const b=document.createElement('button');b.type='button';b.className='pchip';b.dataset.id=s.id;
  const n=document.createElement('span');n.textContent=s.name;
  const p=document.createElement('small');p.textContent=POP_PRICE[s.id]||'';
  b.append(n,p);
  b.addEventListener('click',()=>{svcSel.value=s.id;syncPop()});
  popBox.appendChild(b);
});
function syncPop(){popBox.querySelectorAll('.pchip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===svcSel.value))}
svcSel.addEventListener('change',syncPop);syncPop();window.syncPopX=syncPop;

const pad=n=>String(n).padStart(2,'0');
const TIMES=CONFIG.times;
const dayList=DB.nextDays(CONFIG.daysAhead||14);
let selDay=0, selTime=null, slotMap={}, unwatch=null;
const daysBox=$('#days'), timesBox=$('#times');
const noTimes=document.createElement('p'); noTimes.className='noTimes'; noTimes.hidden=true;
noTimes.textContent='На этот день свободного времени нет. Выберите другой день.';
timesBox.after(noTimes);
const labelOf=d=>`${DB.WD[d.getDay()]} ${pad(d.getDate())}.${pad(d.getMonth()+1)}`;
const isPast=(d,t)=>{
  if(DB.ymd(d)!==DB.ymd(new Date())) return false;
  const [h,m]=t.split(':').map(Number), n=new Date();
  return h*60+m<=n.getHours()*60+n.getMinutes();
};
function renderDays(){
  daysBox.innerHTML='';
  dayList.forEach((d,i)=>{
    const b=document.createElement('button');b.type='button';b.className='chip';
    b.setAttribute('aria-pressed',i===selDay);
    b.append(DB.WD[d.getDay()]); const s=document.createElement('small'); s.textContent=`${pad(d.getDate())}.${pad(d.getMonth()+1)}`; b.append(s);
    b.onclick=()=>{selDay=i;selTime=null;renderDays();watchDay()};
    daysBox.appendChild(b);
  });
}
function renderTimes(){
  const d=dayList[selDay];
  const free=TIMES.filter(t=>!slotMap[t]&&!isPast(d,t));
  if(selTime&&!free.includes(selTime)) selTime=null;
  if(!selTime&&free.length) selTime=free[0];
  timesBox.innerHTML='';
  TIMES.forEach(t=>{
    const busy=!free.includes(t);
    const b=document.createElement('button');b.type='button';b.className='chip'+(busy?' off':'');
    b.disabled=busy; b.setAttribute('aria-pressed',t===selTime);
    b.append(t);
    if(slotMap[t]){const s=document.createElement('small');s.textContent=slotMap[t]==='closed'?'закрыто':'занято';b.append(s)}
    b.onclick=()=>{selTime=t;renderTimes()};
    timesBox.appendChild(b);
  });
  noTimes.hidden=free.length>0;
}
function watchDay(){
  if(unwatch) unwatch();
  slotMap={};
  unwatch=DB.watchSlots(DB.ymd(dayList[selDay]),m=>{slotMap=m;renderTimes()});
  renderTimes();
}
if(TIMES.every(t=>isPast(dayList[0],t))) selDay=1;
renderDays();watchDay();

const form=$('#zapis'), sendBtn=form.querySelector('button[type=submit]'), sendHtml=sendBtn.innerHTML;
function waLink(svc,d,t,name,phone){
  const msg=`Здравствуйте! Хочу записаться: ${svc}, ${labelOf(d)} в ${t}. Меня зовут ${name}, телефон ${phone}.`;
  return `https://wa.me/${CONFIG.phoneDigits}?text=${encodeURIComponent(msg)}`;
}
function showDone(title,lines,wa){
  const done=$('#done'); done.textContent='';
  const b=document.createElement('b'); b.textContent=title; done.appendChild(b);
  lines.forEach(l=>{const p=document.createElement('div');p.textContent=l;done.appendChild(p)});
  if(wa){const p=document.createElement('div');p.className='wa-note';p.append('Если WhatsApp не открылся, ');const a=document.createElement('a');a.className='wa';a.target='_blank';a.rel='noopener';a.href=wa.href;a.textContent='нажмите здесь';p.append(a,'.');done.appendChild(p)}
  done.classList.add('show');
}
let lastSend=0;
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const name=$('#nm').value.trim(), phone=$('#ph').value.trim(), err=$('#err');
  $('#done').classList.remove('show');
  if($('#bkHp').value) return; /* ловушка для роботов */
  if(!selTime){err.textContent='Выберите свободное время.';return}
  if(name.length<2){err.textContent='Введите имя, чтобы мастер знал, как к вам обращаться.';$('#nm').focus();return}
  if(phone.replace(/\D/g,'').length<10){err.textContent='Проверьте телефон: нужно минимум 10 цифр.';$('#ph').focus();return}
  if(Date.now()-lastSend<20000){err.textContent='Заявка уже отправляется. Подождите немного.';return}
  err.textContent='';
  const svc=svcSel.options[svcSel.selectedIndex].text, d=dayList[selDay], t=selTime;
  sendBtn.disabled=true; sendBtn.textContent='Отправляю…';
  /* окно WhatsApp открываем сразу по клику (иначе браузер его заблокирует) */
  let w=null; try{w=window.open('','_blank'); if(w) w.opener=null}catch(_){}
  try{
    await DB.createBooking({name,phone,service:svcSel.value,serviceName:svc,date:DB.ymd(d),time:t});
    lastSend=Date.now();
    const href=waLink(svc,d,t,name,phone);
    if(w&&!w.closed){w.location.href=href}else{window.open(href,'_blank','noopener')}
    showDone('Заявка отправлена мастеру',[`${svc}, ${labelOf(d)}, ${t}.`,'Мастер свяжется с вами и подтвердит запись.'],{href});
    $('#nm').value=''; $('#ph').value=''; selTime=null; renderTimes();
  }catch(ex){
    if(w) try{w.close()}catch(_){}
    if(ex&&ex.message==='taken'){err.textContent='Это время только что заняли. Выберите другое.';selTime=null;renderTimes()}
    else{err.textContent='Не удалось отправить заявку. Проверьте интернет или напишите мастеру в WhatsApp.'}
  }finally{sendBtn.disabled=false;sendBtn.innerHTML=sendHtml}
});

/* ---------- reviews ---------- */
const revs=$('#revs');
DB.watchReviews(list=>{
  revs.textContent='';
  if(!list.length){
    const p=document.createElement('p');p.className='noRev';p.textContent='Пока нет отзывов. Станьте первым!';revs.appendChild(p);return;
  }
  list.slice(0,12).forEach(r=>{
    const a=document.createElement('article');a.className='rev';
    const who=document.createElement('div');who.className='who';
    const av=document.createElement('div');av.className='av';av.textContent=(r.name||'?')[0].toUpperCase();
    const nm=document.createElement('div');
    const bn=document.createElement('b');bn.textContent=r.name;
    const st=document.createElement('div');st.className='stars';st.textContent='★'.repeat(r.rating)+'☆'.repeat(5-r.rating);st.setAttribute('aria-label',`${r.rating} из 5`);
    nm.append(bn,st);who.append(av,nm);
    const p=document.createElement('p');p.textContent=r.text;
    const tm=document.createElement('time');tm.textContent=new Date(r.createdAt).toLocaleDateString('ru-RU');
    a.append(who,p,tm);revs.appendChild(a);
  });
});
let rating=0;
const starBtns=[...document.querySelectorAll('#starsIn button')];
const paintStars=v=>starBtns.forEach(b=>{const on=+b.dataset.v<=v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',+b.dataset.v===v)});
starBtns.forEach(b=>b.addEventListener('click',()=>{rating=+b.dataset.v;paintStars(rating)}));
$('#revForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const err=$('#rvErr'), ok=$('#rvOk'), btn=e.target.querySelector('button[type=submit]');
  ok.hidden=true;
  const name=$('#rvName').value.trim(), text=$('#rvText').value.trim();
  if($('#rvHp').value){ok.hidden=false;return}
  if(!rating){err.textContent='Поставьте оценку звёздами.';return}
  if(!name){err.textContent='Укажите имя.';$('#rvName').focus();return}
  if(text.length<5){err.textContent='Напишите хотя бы пару слов.';$('#rvText').focus();return}
  let last=0; try{last=+localStorage.getItem('nj_rv_t')||0}catch(_){}
  if(Date.now()-last<60000){err.textContent='Отзыв уже отправлен. Подождите минуту.';return}
  err.textContent=''; btn.disabled=true;
  try{
    await DB.addReview({name,rating,text});
    try{localStorage.setItem('nj_rv_t',String(Date.now()))}catch(_){}
    $('#rvName').value='';$('#rvText').value='';rating=0;paintStars(0);ok.hidden=false;
  }catch(ex){err.textContent='Не удалось отправить отзыв. Попробуйте позже.'}
  finally{btn.disabled=false}
});


/* ---------- price list ---------- */
(function(){
  const box=$('#priceGroups');
  PRICES.forEach(g=>{
    const card=document.createElement('div');card.className='pg';
    const h=document.createElement('h3');h.textContent=g.group;card.appendChild(h);
    g.rows.forEach(([name,price])=>{
      const r=document.createElement('div');r.className='pr';
      const n=document.createElement('span');n.className='pn';n.textContent=name;
      const p=document.createElement('b');p.className='pp';p.textContent=price+' ₸';
      r.append(n,p);card.appendChild(r);
    });
    box.appendChild(card);
  });
})();

/* ---------- contacts, footer ---------- */
$('#cPhone').textContent=CONFIG.phone; $('#cPhone').href='tel:+'+CONFIG.phoneDigits;
$('#cAddr').textContent=CONFIG.address;
$('#fPhone').textContent=CONFIG.phone; $('#fAddr').textContent=CONFIG.address;
if(CONFIG.instagram) $('#soc').insertAdjacentHTML('beforeend',`<a href="${CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">IG</a>`);
if(CONFIG.telegram) $('#soc').insertAdjacentHTML('beforeend',`<a href="${CONFIG.telegram}" target="_blank" rel="noopener" aria-label="Telegram">TG</a>`);

/* ---------- mobile menu ---------- */
const burger=$('#burger'), nav=$('#nav');
burger.onclick=()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)};
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');burger.setAttribute('aria-expanded',false)}));
