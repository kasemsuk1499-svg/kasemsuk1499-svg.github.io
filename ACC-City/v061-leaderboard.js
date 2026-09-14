(()=>{
'use strict';
if(window.__accV061Leaderboard)return;window.__accV061Leaderboard=1;
const BUILD='v0.6.1',EPOCH=new Date('2026-09-12T00:00:00+07:00').getTime();
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'฿'+Math.round(num(v)).toLocaleString('th-TH');
const daySerial=()=>Math.max(0,Math.floor((Date.now()-EPOCH)/3600000));
const NPC=[
 {id:'hikari',name:'Hikari',role:'นักลงทุน',base:91},{id:'ren',name:'Ren',role:'เจ้าของบริษัท',base:83},{id:'sora',name:'Sora',role:'นักกีฬา',base:77},
 {id:'yuna',name:'Yuna',role:'ครีเอเตอร์',base:74},{id:'kaito',name:'Kaito',role:'พ่อค้า',base:69},{id:'mina',name:'Mina',role:'นักวิเคราะห์',base:66},
 {id:'aster',name:'Aster',role:'ผู้ผลิต',base:62},{id:'lune',name:'Lune',role:'ฟรีแลนซ์',base:58},{id:'nami',name:'Nami',role:'โลจิสติกส์',base:54}
];
const NPC_COMPANIES=[
 {ticker:'ATECH',name:'Anomaly Tech',value:70080000,sector:'เทคโนโลยี'},
 {ticker:'NOVA',name:'Nova Foods',value:51000000,sector:'อาหาร'},
 {ticker:'LOGI',name:'ACC Logistics',value:54560000,sector:'โลจิสติกส์'},
 {ticker:'MKT',name:'Central Market Group',value:53380000,sector:'ค้าปลีก'},
 {ticker:'MEDIA',name:'ACC Media Network',value:34580000,sector:'สื่อ'}
];
let activeTab='overall',lastSig='';
function S(){return typeof state!=='undefined'?state:null}
function userName(){const s=S();return s?.name||q('#profileName')?.textContent?.trim()||q('#mProfileName')?.textContent?.trim()||'คุณ'}
function roleName(){return q('#activeRoleTop')?.textContent?.trim()||q('#mActiveRole')?.textContent?.trim()||'พลเมือง'}
function hash(str){let h=2166136261;for(const ch of String(str)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function jitter(key,span=1){const h=hash(`${key}:${daySerial()}`);return ((h%10001)/10000*2-1)*span}
function marketPrice(ticker,base){const bucket=Math.floor(Date.now()/60000),seed=[...ticker].reduce((a,c)=>a+c.charCodeAt(0),0);const wave=Math.sin((bucket+seed)*.71)*.024+Math.sin((bucket+seed*3)*.19)*.012;return Math.max(.5,base*(1+wave))}
const STOCKS={NOVA:{base:42.5},LOGI:{base:68.2},MKT:{base:31.4},ATECH:{base:116.8},MEDIA:{base:24.7}};
function playerPortfolio(){const c=S()?.companyV060;if(!c?.portfolio)return 0;return Object.entries(c.portfolio).reduce((sum,[ticker,qty])=>{let p=0;if(STOCKS[ticker])p=marketPrice(ticker,STOCKS[ticker].base);else{const co=(c.companies||[]).find(x=>x.ticker===ticker);p=num(co?.shares?.price)}return sum+num(qty)*p},0)}
function companyValue(co){if(!co)return 0;if(co.shares?.ipo)return Math.max(num(co.cash),num(co.shares.issued)*num(co.shares.price));const book=Math.max(0,num(co.cash)+num(co.bank));const rev=Math.max(0,num(co.revenueLifetime));const staff=(co.employees||[]).filter(e=>e.status==='active').length;return Math.round(book+rev*.3+staff*12000)}
function founderEquity(){const c=S()?.companyV060;if(!c?.companies)return 0;return c.companies.reduce((sum,co)=>{const issued=Math.max(1,num(co.shares?.issued));const founder=num(co.shares?.founderShares);return sum+companyValue(co)*(founder/issued)},0)}
function wealth(){const s=S();return num(s?.wallet)+num(s?.bank)+playerPortfolio()+founderEquity()}
function sportScore(){const s=S();const tx=(s?.moneyTxV054||[]).filter(x=>x.type==='sport_prize');const prizes=tx.reduce((a,x)=>a+Math.max(0,num(x.amount)),0);const plays=num(s?.activityV4?.sports);return Math.round(prizes+plays*120)}
function crimeScore(){const c=S()?.crimeV057;return Math.round(num(c?.crimeRep)*100+num(c?.heat)*2)}
function knowledgeScore(){const k=S()?.companyV060?.knowledge||{};return Math.round(Object.values(k).reduce((a,v)=>a+num(v),0))}
function rep(){return num(S()?.rep)}
function companyTopValue(){const arr=S()?.companyV060?.companies||[];return arr.reduce((m,c)=>Math.max(m,companyValue(c)),0)}
function overallScore(){const w=Math.log10(Math.max(10,wealth()))*95;const r=rep()*18;const co=Math.log10(Math.max(10,companyTopValue()))*55;const st=Math.sqrt(Math.max(0,sportScore()))*6;const kn=knowledgeScore()*.7;return Math.round(w+r+co+st+kn)}
function livePlayers(){const out=[];qa('#accRealtimeOnline .acc-rt-user').forEach(el=>{const name=(el.querySelector('b')?.textContent||'').replace(/\s*·\s*คุณ\s*$/,'').trim();const small=el.querySelector('small')?.textContent||'';const m=small.match(/⭐\s*([\d.]+)/);if(name&&m)out.push({name,rep:num(m[1]),role:small.split('·')[0]?.trim()||'PLAYER',live:true})});return out}
function npcMetric(n,kind){const j=1+jitter(`${n.id}:${kind}`,.055);switch(kind){
 case'wealth':return Math.round((45000+n.base*n.base*88)*j);
 case'reputation':return Math.max(1,Math.round((1.7+n.base/28+jitter(n.id,.18))*100)/100);
 case'portfolio':return Math.round((18000+n.base*n.base*46)*j);
 case'sports':return Math.round((n.id==='sora'?1550:n.base*8.2)*j);
 case'crime':return Math.round(((n.id==='kaito'?330:40+n.base*2.1))*j);
 case'knowledge':return Math.round((42+n.base*2.8)*j);
 case'overall':return Math.round((350+n.base*7.7)*j);
 default:return n.base;
 }}
function rows(kind){
 const me={id:'me',name:userName(),role:roleName(),mine:true};
 if(kind==='wealth'){
  const list=NPC.map(n=>({...n,value:npcMetric(n,'wealth'),sub:'ทรัพย์สินสุทธิ · NPC'}));list.push({...me,value:wealth(),sub:`Wallet + Bank + หุ้น + ส่วนผู้ก่อตั้ง`});return list;
 }
 if(kind==='reputation'){
  const list=NPC.map(n=>({...n,value:npcMetric(n,'reputation'),sub:`${n.role} · NPC`}));
  const seen=new Set([userName().toLowerCase()]);livePlayers().forEach((p,i)=>{const k=p.name.toLowerCase();if(seen.has(k))return;seen.add(k);list.push({id:'live'+i,name:p.name,role:p.role,value:p.rep,sub:`ออนไลน์จริง · ${p.role}`,live:true})});
  list.push({...me,value:rep(),sub:'Reputation ของคุณ'});return list;
 }
 if(kind==='company'){
  const list=NPC_COMPANIES.map(c=>({id:c.ticker,name:c.name,role:c.ticker,value:Math.round(c.value*(1+jitter(c.ticker,.035))),sub:`${c.sector} · NPC Company`,company:true}));
  (S()?.companyV060?.companies||[]).forEach(co=>list.push({id:co.id,name:co.name,role:co.ticker,value:companyValue(co),sub:`${co.industry} · บริษัทของคุณ`,mine:true,company:true}));return list;
 }
 if(kind==='portfolio'){
  const list=NPC.map(n=>({...n,value:npcMetric(n,'portfolio'),sub:'มูลค่าพอร์ต · NPC'}));list.push({...me,value:playerPortfolio(),sub:'มูลค่าหุ้นที่ถืออยู่'});return list;
 }
 if(kind==='sports'){
  const list=NPC.map(n=>({...n,value:npcMetric(n,'sports'),sub:`Sports Points · ${n.role}`}));list.push({...me,value:sportScore(),sub:'รางวัลกีฬา + การเข้าร่วม'});return list;
 }
 if(kind==='crime'){
  const list=NPC.map(n=>({...n,value:npcMetric(n,'crime'),sub:'Notoriety · NPC'}));list.push({...me,value:crimeScore(),sub:`Crime REP ${num(S()?.crimeV057?.crimeRep)} · Heat ${num(S()?.crimeV057?.heat)}`});return list;
 }
 if(kind==='knowledge'){
  const list=NPC.map(n=>({...n,value:npcMetric(n,'knowledge'),sub:'Knowledge Total · NPC'}));list.push({...me,value:knowledgeScore(),sub:'ผลรวมความรู้ 7 สาย'});return list;
 }
 const list=NPC.map(n=>({...n,value:npcMetric(n,'overall'),sub:`City Score · ${n.role}`}));list.push({...me,value:overallScore(),sub:'คะแนนรวมเงิน · ชื่อเสียง · บริษัท · กีฬา · ความรู้'});return list;
}
function fmt(kind,v){if(['wealth','company','portfolio'].includes(kind))return money(v);if(kind==='reputation')return '⭐ '+num(v).toFixed(2);if(kind==='sports')return Math.round(v).toLocaleString('th-TH')+' pts';if(kind==='crime')return Math.round(v).toLocaleString('th-TH')+' notoriety';if(kind==='knowledge')return Math.round(v).toLocaleString('th-TH')+' knowledge';return Math.round(v).toLocaleString('th-TH')+' score'}
function sorted(kind){return rows(kind).sort((a,b)=>num(b.value)-num(a.value)||String(a.name).localeCompare(String(b.name),'th'))}
function addCss(){if(q('#acc-v061-css'))return;const st=document.createElement('style');st.id='acc-v061-css';st.textContent=`
#view-leaderboard{display:none}#view-leaderboard.active{display:block}.acc61-hero{display:grid;grid-template-columns:1.25fr .75fr;gap:10px;margin-bottom:11px}.acc61-card{border:1px solid #253955;border-radius:15px;background:linear-gradient(145deg,#101b2b,#0c151f);padding:13px}.acc61-title{font-size:19px;font-weight:900}.acc61-tabs{display:flex;gap:7px;overflow:auto;padding-bottom:4px;margin:10px 0}.acc61-tab{white-space:nowrap;min-height:38px}.acc61-tab.active{background:#17345e;border-color:#618fe0}.acc61-list{display:flex;flex-direction:column;gap:7px}.acc61-row{display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:9px;border:1px solid #20334d;border-radius:12px;background:#0b1420;padding:9px 11px}.acc61-row.mine{border-color:#527fc4;background:linear-gradient(135deg,#12243d,#0d1826);box-shadow:0 0 0 1px #406ca333 inset}.acc61-rank{font-size:16px;font-weight:900;text-align:center}.acc61-rank.top{font-size:22px}.acc61-person{min-width:0}.acc61-person b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.acc61-person small{display:block;color:#8195af;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}.acc61-value{text-align:right;font-weight:900;font-size:13px}.acc61-kind{font-size:9px;color:#8fa6c2;margin-top:2px}.acc61-me-rank{font-size:32px;font-weight:950}.acc61-note{color:#8295ae;font-size:10px;line-height:1.5}.acc61-live{color:#65dda0}.acc61-refresh{font-size:10px;color:#7790ad}
@media(max-width:820px){.acc61-hero{grid-template-columns:1fr}.acc61-row{grid-template-columns:40px minmax(0,1fr) auto;padding:9px 8px}.acc61-value{font-size:11px}.acc61-tabs{position:sticky;top:58px;z-index:4;background:#0a1018;padding:7px 0}.acc61-tab{min-height:42px}}
`;document.head.appendChild(st)}
function ensureView(){
 if(!q('#view-leaderboard')){const host=q('.desktop .content')||q('.main .content')||q('.content');if(host){const v=document.createElement('section');v.id='view-leaderboard';v.className='view';v.innerHTML='<div id="acc61Root"></div>';host.appendChild(v)}}
 if(!q('[data-acc61-nav]')){
  const navHost=q('.desktop .sidebar')||q('.sidebar');
  const ref=navHost?.querySelector('.nav-view[data-view="company"]')||navHost?.querySelector('.nav-view:last-of-type');
  if(navHost){const b=document.createElement('button');b.type='button';b.className='nav-view';b.dataset.view='leaderboard';b.dataset.acc61Nav='1';b.innerHTML='🏆 <span>Leaderboard</span>';b.addEventListener('click',()=>openBoard());if(ref?.parentNode===navHost)ref.insertAdjacentElement('afterend',b);else navHost.appendChild(b)}
 }
}
function openBoard(){qa('.desktop .view,.view').forEach(v=>v.classList.toggle('active',v.id==='view-leaderboard'));qa('.nav-view[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='leaderboard'));const t=q('#desktopViewTitle');if(t)t.textContent='Leaderboard';const i=q('#desktopViewIcon');if(i)i.textContent='🏆';render(true)}
function rankIcon(i){return i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1)}
function render(force=false){
 ensureView();const root=q('#acc61Root');if(!root)return;const data=sorted(activeTab),myIndex=data.findIndex(x=>x.mine),me=data[myIndex];
 const sig=JSON.stringify([activeTab,daySerial(),S()?.wallet,S()?.bank,S()?.rep,S()?.crimeV057?.crimeRep,S()?.crimeV057?.heat,S()?.companyV060?.portfolio,S()?.companyV060?.companies?.map(c=>[c.id,c.cash,c.revenueLifetime,c.shares?.price,c.shares?.issued]),livePlayers().map(x=>[x.name,x.rep])]);if(!force&&sig===lastSig)return;lastSig=sig;
 const tabs=[['overall','🏆 รวม'],['wealth','💰 เงิน'],['reputation','⭐ REP'],['company','🏢 บริษัท'],['portfolio','📈 หุ้น'],['sports','🏟️ กีฬา'],['crime','🥷 Crime'],['knowledge','📚 ความรู้']];
 root.innerHTML=`<div class="acc61-hero"><div class="acc61-card"><div class="row"><div><div class="acc61-title">🏆 ACC City Leaderboard</div><div class="tiny muted">อันดับเมืองจากเศรษฐกิจ ชื่อเสียง บริษัท กีฬา และความรู้</div></div><span class="pill">Season ${Math.floor(daySerial()/24)+1}</span></div><div class="acc61-tabs">${tabs.map(([k,l])=>`<button class="acc61-tab ${activeTab===k?'active':''}" data-acc61-tab="${k}">${l}</button>`).join('')}</div><div class="acc61-note">ผู้เล่นออนไลน์จริงจะเข้าหมวดที่มีข้อมูลสาธารณะ เช่น Reputation เท่านั้น ส่วนข้อมูลการเงินของผู้เล่นอื่นจะไม่เดาหรือเปิดเผยจนกว่าจะมี Backend Ledger กลาง</div></div><div class="acc61-card"><div class="tiny muted">อันดับของฉัน · ${esc(tabs.find(x=>x[0]===activeTab)?.[1]||'')}</div><div class="acc61-me-rank">${myIndex>=0?'#'+(myIndex+1):'—'}</div><b>${esc(me?.name||userName())}</b><div style="font-size:16px;font-weight:900;margin-top:5px">${me?fmt(activeTab,me.value):'—'}</div><div class="acc61-refresh">อัปเดตอัตโนมัติ · วัน ACC ${daySerial()+1}</div></div></div><div class="acc61-card"><div class="row" style="margin-bottom:9px"><b>อันดับ Top ${Math.min(10,data.length)}</b><button data-acc61-refresh class="ghost">↻ รีเฟรช</button></div><div class="acc61-list">${data.slice(0,10).map((x,i)=>`<div class="acc61-row ${x.mine?'mine':''}"><div class="acc61-rank ${i<3?'top':''}">${rankIcon(i)}</div><div class="acc61-person"><b>${esc(x.name)}${x.mine?' · คุณ':''}</b><small>${esc(x.sub||x.role||'')}${x.live?' · 🟢 LIVE':''}</small></div><div class="acc61-value">${fmt(activeTab,x.value)}<div class="acc61-kind">${x.company?'COMPANY':x.live?'PLAYER LIVE':x.mine?'PLAYER':'NPC'}</div></div></div>`).join('')}</div></div>`;
 root.querySelectorAll('[data-acc61-tab]').forEach(b=>b.onclick=()=>{activeTab=b.dataset.acc61Tab;lastSig='';render(true)});q('[data-acc61-refresh]')?.addEventListener('click',()=>{lastSig='';render(true)});
}
function hookMobile(){const labels={leaderboard:'Leaderboard'};try{if(window.__accMobileV052){/* Mobile Hub discovers view/nav automatically */}}catch{};return labels}
function start(){addCss();ensureView();hookMobile();document.addEventListener('click',e=>{const b=e.target.closest('[data-view="leaderboard"]');if(b&&b.dataset.acc61Nav!=='1')setTimeout(()=>{const t=q('#desktopViewTitle');if(t)t.textContent='Leaderboard';render(true)},0)},true);setInterval(()=>{if(q('#view-leaderboard')?.classList.contains('active'))render(false)},5000);render(true);const badge=q('#acc-build-badge');if(badge)badge.textContent='ACC City '+BUILD;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.ACCLeaderboard={open:openBoard,render:()=>render(true)};
})();