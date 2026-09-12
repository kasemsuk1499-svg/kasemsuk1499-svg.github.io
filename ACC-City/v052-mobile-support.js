(()=>{
  if(window.__accMobileV052)return; window.__accMobileV052=1;
  const BUILD='v0.5.2';
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const mobile=()=>matchMedia('(max-width:820px)').matches;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labelMap={city:'เมือง',chat:'แชท',roles:'Role Center',role:'Role Center',orgs:'องค์กร & กิจการ',organizations:'องค์กร & กิจการ',jobs:'Job Center',work:'งาน & การผลิต',economy:'การเงิน',bank:'ธนาคาร',finance:'การเงิน',market:'ตลาด',casino:'คาสิโน',sports:'Sports District',arena:'Sports District',admin:'GOD Console'};

  function addCss(){
    if(q('#acc-v052-mobile-css'))return;
    const st=document.createElement('style'); st.id='acc-v052-mobile-css';
    st.textContent=`
      #accMobileSystemsBtn,#accMobileSheet,#accMobileFullbar,#accMobileQuick{display:none}
      @media(max-width:820px){
        html,body{max-width:100%;overflow-x:hidden}
        button,.input,input,select,textarea{touch-action:manipulation}
        input,select,textarea{font-size:16px!important}
        #accMobileSystemsBtn{display:flex;position:fixed;right:14px;bottom:calc(78px + env(safe-area-inset-bottom));z-index:70;align-items:center;gap:7px;border:1px solid #36527a;background:linear-gradient(135deg,#315d9d,#6d55d9);color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.38);padding:11px 14px;border-radius:999px;font-weight:850;font-size:12px}
        #accMobileSystemsBtn:active{transform:scale(.97)}
        #accMobileSheet{position:fixed;inset:0;z-index:120;background:rgba(3,7,12,.72);backdrop-filter:blur(7px);align-items:flex-end;padding:0}
        #accMobileSheet.open{display:flex}
        .acc-ms-panel{width:100%;max-height:84vh;overflow:auto;background:#0d1521;border:1px solid #273a55;border-bottom:0;border-radius:22px 22px 0 0;padding:12px 12px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -24px 70px rgba(0,0,0,.4)}
        .acc-ms-grab{width:42px;height:4px;border-radius:99px;background:#40516b;margin:1px auto 12px}
        .acc-ms-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.acc-ms-head h3{margin:0;font-size:17px}.acc-ms-head small{display:block;color:#8294ac;margin-top:2px}
        .acc-ms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        .acc-ms-item{min-height:66px;text-align:left;padding:11px;border:1px solid #21334d;background:#101b2b;border-radius:13px;color:#e9f2ff}.acc-ms-item b{display:block;font-size:13px}.acc-ms-item small{display:block;color:#8194ad;font-size:10px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        #accMobileQuick{display:block;margin:0 0 10px}.acc-mq-card{border:1px solid #223550;background:linear-gradient(135deg,#101b2a,#0d1722);border-radius:14px;padding:11px}.acc-mq-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.acc-mq-actions{display:flex;gap:7px;overflow:auto;padding-top:9px;padding-bottom:2px;scrollbar-width:none}.acc-mq-actions::-webkit-scrollbar{display:none}.acc-mq-chip{white-space:nowrap;padding:8px 10px;border-radius:10px;border:1px solid #263a57;background:#121f31;font-size:11px}

        body.acc-mobile-system{overflow:hidden}
        body.acc-mobile-system .mobile{display:none!important}
        body.acc-mobile-system .desktop{display:grid!important;grid-template-columns:minmax(0,1fr)!important;min-height:100dvh!important;width:100%!important}
        body.acc-mobile-system .desktop>.rail,body.acc-mobile-system .desktop>.sidebar,body.acc-mobile-system .desktop>.rightbar{display:none!important}
        body.acc-mobile-system .desktop>.main{display:block!important;min-width:0!important;width:100%!important;max-width:100vw!important;padding:0!important;margin:0!important;overflow-x:hidden!important}
        body.acc-mobile-system .main-head{height:auto!important;min-height:58px!important;padding:8px 10px!important;gap:7px!important;position:sticky!important;top:0!important;z-index:55!important;flex-wrap:wrap!important;background:rgba(10,16,24,.96)!important;backdrop-filter:blur(12px)}
        body.acc-mobile-system .main-title{min-width:0;max-width:100%;font-size:13px}.main-title>*{min-width:0}
        body.acc-mobile-system .main-actions{display:flex!important;width:100%;max-width:100%;gap:6px!important;overflow-x:auto!important;padding-bottom:2px;scrollbar-width:none}body.acc-mobile-system .main-actions::-webkit-scrollbar{display:none}
        body.acc-mobile-system .main-actions>*{flex:0 0 auto}
        body.acc-mobile-system .content{padding:10px 10px calc(96px + env(safe-area-inset-bottom))!important;max-width:100vw!important;overflow-x:hidden!important}
        body.acc-mobile-system .hero-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
        body.acc-mobile-system .hero-strip>.stat:first-child{grid-column:1/-1}
        body.acc-mobile-system .panel-grid,body.acc-mobile-system .goal-grid,body.acc-mobile-system .stats-grid,body.acc-mobile-system .bank-grid,body.acc-mobile-system .sports-grid{grid-template-columns:minmax(0,1fr)!important;gap:9px!important}
        body.acc-mobile-system .market-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
        body.acc-mobile-system .card,body.acc-mobile-system .goal-card,body.acc-mobile-system .stat{border-radius:12px!important;padding:12px!important;min-width:0!important}
        body.acc-mobile-system .row{gap:7px;flex-wrap:wrap}
        body.acc-mobile-system table{display:block;width:100%;max-width:100%;overflow-x:auto;white-space:nowrap}
        body.acc-mobile-system .slots{gap:6px!important;margin:16px 0!important}body.acc-mobile-system .slot{width:72px!important;height:72px!important;font-size:30px!important}
        body.acc-mobile-system .roulette-wheel{max-width:280px!important;margin-inline:auto!important}
        body.acc-mobile-system .casino-actions,body.acc-mobile-system .action-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;width:100%!important}
        body.acc-mobile-system button{min-height:42px}
        body.acc-mobile-system .chat-compose{left:0!important;right:0!important;bottom:calc(58px + env(safe-area-inset-bottom))!important;padding:8px!important;background:#0a1018!important}
        body.acc-mobile-system .compose-inner{max-width:100%;padding:5px!important}
        body.acc-mobile-system .message{grid-template-columns:36px minmax(0,1fr)!important;padding:8px 3px!important}body.acc-mobile-system .message .avatar{width:34px!important;height:34px!important}
        body.acc-mobile-system .production-line{overflow-x:auto;padding-bottom:4px}.production-line .node{min-width:120px}
        body.acc-mobile-system #accMobileFullbar{display:grid;position:fixed;left:0;right:0;bottom:0;z-index:80;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;background:rgba(10,16,24,.97);border-top:1px solid #24344b;padding:7px 9px calc(7px + env(safe-area-inset-bottom));backdrop-filter:blur(12px)}
        #accMobileFullbar .acc-mfb-title{min-width:0;text-align:center;font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#d9e7fb}
        #accMobileFullbar button{min-height:40px;padding:7px 10px;font-size:11px}
        body.acc-mobile-system #accMobileSystemsBtn{display:none!important}
      }
      @media(max-width:420px){
        body.acc-mobile-system .market-grid{grid-template-columns:1fr!important}
        .acc-ms-grid{grid-template-columns:1fr 1fr}
        body.acc-mobile-system .hero-strip{grid-template-columns:1fr 1fr!important}
        body.acc-mobile-system .bigmoney{font-size:25px!important}
      }
      @media(prefers-reduced-motion:reduce){#accMobileSystemsBtn,.acc-ms-panel,*{scroll-behavior:auto!important}}
    `;
    document.head.appendChild(st);
  }

  function iconFor(view,label=''){
    const s=(view+' '+label).toLowerCase();
    if(/bank|finance|economy|การเงิน|ธนาคาร/.test(s))return '🏦'; if(/casino|คาสิโน/.test(s))return '🎰'; if(/sport|arena|กีฬา/.test(s))return '🏟️'; if(/market|ตลาด/.test(s))return '🛒'; if(/job|work|งาน/.test(s))return '💼'; if(/role/.test(s))return '🎭'; if(/org|บริษัท|องค์กร/.test(s))return '🏢'; if(/chat|แชท/.test(s))return '💬'; if(/admin|god/.test(s))return '👑'; if(/city|เมือง/.test(s))return '🏙️'; return '◆';
  }
  function systems(){
    const seen=new Set(), out=[];
    qa('.desktop .nav-view[data-view],.sidebar [data-view]').forEach(el=>{const v=el.dataset.view;if(!v||seen.has(v))return;seen.add(v);const raw=(el.textContent||'').replace(/\s+/g,' ').trim();out.push({view:v,label:labelMap[v]||raw||v,icon:iconFor(v,raw)});});
    qa('.desktop .view[id^="view-"]').forEach(el=>{const v=el.id.replace(/^view-/,'');if(!v||seen.has(v))return;seen.add(v);out.push({view:v,label:labelMap[v]||v,icon:iconFor(v)});});
    return out;
  }
  function ensureUi(){
    if(!mobile()||!q('#app')||q('#app')?.classList.contains('hidden'))return;
    if(!q('#accMobileSystemsBtn')){
      const b=document.createElement('button');b.id='accMobileSystemsBtn';b.type='button';b.innerHTML='☰ <span>ระบบทั้งหมด</span>';b.onclick=openSheet;document.body.appendChild(b);
    }
    if(!q('#accMobileSheet')){
      const s=document.createElement('div');s.id='accMobileSheet';s.innerHTML='<div class="acc-ms-panel"><div class="acc-ms-grab"></div><div class="acc-ms-head"><div><h3>📱 ระบบ ACC City</h3><small>เข้าถึงระบบเดียวกับบนคอม</small></div><button type="button" data-ms-close>✕</button></div><div id="accMobileSystemGrid" class="acc-ms-grid"></div></div>';
      s.addEventListener('click',e=>{if(e.target===s||e.target.closest('[data-ms-close]'))closeSheet();const b=e.target.closest('[data-ms-view]');if(b){closeSheet();openSystem(b.dataset.msView);}});document.body.appendChild(s);
    }
    if(!q('#accMobileFullbar')){
      const f=document.createElement('div');f.id='accMobileFullbar';f.innerHTML='<button type="button" data-mfb-back>‹ มือถือ</button><div class="acc-mfb-title" id="accMfbTitle">ระบบ</div><button type="button" data-mfb-menu>☰ เมนู</button>';
      f.addEventListener('click',e=>{if(e.target.closest('[data-mfb-back]'))exitSystem();if(e.target.closest('[data-mfb-menu]'))openSheet();});document.body.appendChild(f);
    }
    const city=q('#mview-city')||q('.m-content');
    if(city&&!q('#accMobileQuick')){
      const wrap=document.createElement('div');wrap.id='accMobileQuick';wrap.innerHTML='<div class="acc-mq-card"><div class="acc-mq-top"><div><b>📱 ระบบทั้งหมด</b><div class="tiny muted">Bank · Casino · Sports · Role · Living City</div></div><button type="button" data-mq-all>เปิด</button></div><div class="acc-mq-actions" id="accMqActions"></div></div>';
      wrap.addEventListener('click',e=>{if(e.target.closest('[data-mq-all]'))openSheet();const b=e.target.closest('[data-mq-view]');if(b)openSystem(b.dataset.mqView);});city.insertAdjacentElement('afterbegin',wrap);
    }
    renderSystemLists();
  }
  function renderSystemLists(){
    const list=systems();
    const grid=q('#accMobileSystemGrid');if(grid)grid.innerHTML=list.map(x=>`<button class="acc-ms-item" type="button" data-ms-view="${esc(x.view)}"><b>${x.icon} ${esc(x.label)}</b><small>เปิดระบบแบบเต็มสำหรับมือถือ</small></button>`).join('')||'<div class="muted tiny">กำลังโหลดระบบ…</div>';
    const quick=q('#accMqActions');if(quick){const preferred=['bank','economy','casino','sports','market','roles','orgs','jobs'];const chosen=[...list].sort((a,b)=>{const ai=preferred.indexOf(a.view),bi=preferred.indexOf(b.view);return (ai<0?99:ai)-(bi<0?99:bi)}).slice(0,6);quick.innerHTML=chosen.map(x=>`<button type="button" class="acc-mq-chip" data-mq-view="${esc(x.view)}">${x.icon} ${esc(x.label)}</button>`).join('');}
  }
  function openSheet(){if(!mobile())return;ensureUi();renderSystemLists();q('#accMobileSheet')?.classList.add('open');}
  function closeSheet(){q('#accMobileSheet')?.classList.remove('open');}
  function setDesktopView(v){
    try{if(typeof setView==='function'){setView(v);return true;}}catch{}
    const b=q(`.desktop .nav-view[data-view="${CSS.escape(v)}"],.sidebar [data-view="${CSS.escape(v)}"]`);if(b){b.click();return true;}
    const target=q('#view-'+CSS.escape(v));if(target){qa('.desktop .view').forEach(x=>x.classList.toggle('active',x===target));return true;}return false;
  }
  function openSystem(v){
    if(!mobile())return;closeSheet();setDesktopView(v);document.body.classList.add('acc-mobile-system');document.body.dataset.mobileSystem=v;
    const label=labelMap[v]||q(`.desktop [data-view="${CSS.escape(v)}"]`)?.textContent?.trim()||v;const t=q('#accMfbTitle');if(t)t.textContent=`${iconFor(v,label)} ${label}`;
    try{history.pushState({accMobileSystem:v},'',location.href);}catch{}
    window.scrollTo(0,0);
  }
  function exitSystem(fromPop=false){
    if(!document.body.classList.contains('acc-mobile-system'))return;document.body.classList.remove('acc-mobile-system');delete document.body.dataset.mobileSystem;closeSheet();
    if(!fromPop){try{history.back();}catch{}}
  }
  function tick(){addCss();ensureUi();if(mobile())renderSystemLists();else{document.body.classList.remove('acc-mobile-system');closeSheet();}}
  window.addEventListener('resize',()=>{clearTimeout(window.__accMResize);window.__accMResize=setTimeout(tick,100)});
  window.addEventListener('popstate',()=>exitSystem(true));
  const mo=new MutationObserver(()=>{clearTimeout(window.__accMMut);window.__accMMut=setTimeout(tick,120)});mo.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();
  setTimeout(tick,500);setTimeout(tick,1800);
})();