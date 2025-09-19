
const money = n => n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

const LOCAL = [
  {id:'p1', title:'Apto 2 suítes com varanda', neighborhood:'Bela Vista', address:'Rua Cincinato Braga', purpose:'comprar', status:'usado', price:890000, area:78, bedrooms:2, bathrooms:2, parking:1, metro_distance:350, lifestyle:'metro,homeOffice,silencioso', lat:-23.56, lng:-46.65, cover:'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop'},
  {id:'p2', title:'Studio moderno com lazer', neighborhood:'Paulista', address:'Al. Santos', purpose:'alugar', status:'novo', price:5200, area:42, bedrooms:1, bathrooms:1, parking:1, metro_distance:180, lifestyle:'metro,investidor', lat:-23.56, lng:-46.66, cover:'https://images.unsplash.com/photo-1560448075-bb4caa6c0f11?q=80&w=1200&auto=format&fit=crop'},
  {id:'p3', title:'Cobertura 3 suítes vista parque', neighborhood:'Jardins', address:'Al. Lorena', purpose:'comprar', status:'usado', price:1950000, area:142, bedrooms:3, bathrooms:4, parking:2, metro_distance:900, lifestyle:'varanda,vista,familia', lat:-23.56, lng:-46.67, cover:'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop'}
];

let state = { purpose:'comprar', q:'', rooms:'', metro:'' };
let cache = [];

async function fetchAPI() {
  if (!window.API_URL) return null;
  try {
    const url = new URL('/api/properties', window.API_URL);
    if(state.purpose) url.searchParams.set('purpose', state.purpose);
    if(state.q) url.searchParams.set('q', state.q);
    if(state.rooms) url.searchParams.set('bedrooms', state.rooms);
    if(state.metro) url.searchParams.set('max_metro', state.metro);
    const res = await fetch(url.toString());
    if(!res.ok) throw new Error('API error');
    return await res.json();
  } catch(e){ return null; }
}

async function load() {
  const api = await fetchAPI();
  cache = api && Array.isArray(api) ? api : LOCAL;
  render(cache);
}

function render(list){
  qs('#count').textContent = list.length + ' resultado' + (list.length!==1?'s':'');
  const cards = qs('#cards'); cards.innerHTML='';
  list.forEach(p => {
    const card = document.createElement('div'); card.className='card'; card.id='card-'+p.id;
    card.innerHTML = `
      <img class="cover" src="${p.cover}" alt="${p.title}" />
      <div class="body">
        <h4>${p.title}</h4>
        <div class="meta">
          <span>${p.bedrooms} dorm</span>
          <span>${p.bathrooms} banh</span>
          <span>${p.parking} vaga</span>
          <span>${p.area} m²</span>
          <span>${p.metro_distance} m do metrô</span>
        </div>
        <div class="row">
          <strong style="font-size:18px">${money(p.price)}${p.purpose==='alugar'?'/mês':''}</strong>
          <span style="margin-left:auto;color:#cbd5e1">${p.neighborhood}</span>
        </div>
        <div class="row">
          <a class="btn primary" href="https://wa.me/55SEUDDDSEUNUMERO?text=Tenho%20interesse%20no%20imovel%20${encodeURIComponent(p.title)}%20em%20${encodeURIComponent(p.neighborhood)}" target="_blank">WhatsApp</a>
          <button class="btn ghost">Comparar</button>
        </div>
      </div>`;
    cards.appendChild(card);
  });
  pins(list);
}

function pins(list){
  const map = qs('#map'); map.innerHTML='';
  const bounds = { minLat:-23.59, maxLat:-23.55, minLng:-46.69, maxLng:-46.63 };
  const px = (lat,lng) => {
    const W = map.clientWidth, H = map.clientHeight;
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * W;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * H;
    return {x,y};
  };
  list.forEach(p => {
    const {x,y} = px(p.lat||-23.56, p.lng||-46.65);
    const dot = document.createElement('div'); dot.className='pin'; dot.style.left=(x-7)+'px'; dot.style.top=(y-7)+'px';
    const tag = document.createElement('div'); tag.className='priceTag'; tag.style.left=(x+10)+'px'; tag.style.top=(y-20)+'px';
    tag.textContent = money(p.price) + (p.purpose==='alugar'?'/mês':'');
    dot.onclick = () => document.getElementById('card-'+p.id)?.scrollIntoView({behavior:'smooth'});
    map.appendChild(dot); map.appendChild(tag);
  });
}

function init(){
  qsa('.chip').forEach(ch => ch.addEventListener('click', () => {
    qsa('.chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active');
    state.purpose = ch.dataset.purpose;
    load();
  }));
  qs('#q').addEventListener('input', e => { state.q = e.target.value; });
  qs('#btnSearch').addEventListener('click', load);

  const dlg = qs('#filters');
  qs('#btnFilter').onclick = () => dlg.showModal();
  qs('#close').onclick = () => dlg.close();
  qs('#apply').onclick = () => { state.rooms = qs('#rooms').value; state.metro = qs('#metro').value; dlg.close(); load(); };

  const save = qs('#saveSearch');
  qs('#btnSave').onclick = () => save.showModal();
  qs('#closeSave').onclick = () => save.close();
  qs('#okSave').onclick = () => { save.close(); alert('Alertas ativados! (MVP)'); };

  qs('#btnReset').onclick = () => { window.scrollTo({top:0, behavior:'smooth'}); };
  load();
}
document.addEventListener('DOMContentLoaded', init);
