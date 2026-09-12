(() => {
  if (window.__accCityV04Community) return;
  window.__accCityV04Community = true;

  const BUILD = 'v0.4.0';
  const EPOCH = new Date('2026-09-12T00:00:00+07:00').getTime();
  const REAL_HOUR = 3600000;
  const GAME_DAYS_PER_MONTH = 24;
  const GAME_MONTHS_PER_YEAR = 12;
  const PRESENCE_KEY = 'accCityPresenceV1';
  const TAB_KEY = 'accCityTabIdV1';
  const STALE_MS = 18000;
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe = raw => { try { return JSON.parse(raw); } catch { return null; } };
  const tabId = sessionStorage.getItem(TAB_KEY) || ('tab_' + Math.random().toString(36).slice(2) + Date.now().toString(36));
  sessionStorage.setItem(TAB_KEY, tabId);

  function gameTime(now = Date.now()) {
    const elapsed = Math.max(0, now - EPOCH);
    const totalDays = Math.floor(elapsed / REAL_HOUR);
    const day = (totalDays % GAME_DAYS_PER_MONTH) + 1;
    const monthSerial = Math.floor(totalDays / GAME_DAYS_PER_MONTH);
    return {
      daySerial: totalDays,
      day,
      month: (monthSerial % GAME_MONTHS_PER_YEAR) + 1,
      year: Math.floor(monthSerial / GAME_MONTHS_PER_YEAR) + 1,
      monthSerial,
      nextDayMs: EPOCH + (totalDays + 1) * REAL_HOUR,
      nextMonthMs: EPOCH + (monthSerial + 1) * GAME_DAYS_PER_MONTH * REAL_HOUR
    };
  }
  function formatLeft(ms) {
    ms = Math.max(0, ms);
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    return h > 0 ? `${h}ชม. ${m}น.` : `${m}น. ${String(s).padStart(2,'0')}วิ.`;
  }
  function roleLabel() {
    try {
      if (state?.isGod) return '👑 GOD';
      const r = typeof role === 'function' ? role(state.active) : null;
      return r ? `${r.icon} ${r.name}` : '🧑 พลเมือง';
    } catch { return '🧑 พลเมือง'; }
  }
  function addCss() {
    if (q('#acc-v04-css')) return;
    const st = document.createElement('style'); st.id = 'acc-v04-css';
    st.textContent = `
      .online-pill{cursor:pointer;transition:.2s}.online-pill:hover{border-color:#4f8cff;transform:translateY(-1px)}
      .online-list{display:flex;flex-direction:column;gap:7px}.online-user{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:8px;border:1px solid #1d2b40;border-radius:10px;background:#0d1622;animation:accV4In .25s ease both}.online-avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#182840;font-weight:850;position:relative}.online-avatar:after{content:'';position:absolute;right:-1px;bottom:-1px;width:9px;height:9px;border-radius:50%;background:#5bd79b;border:2px solid #0d1622;box-shadow:0 0 10px #5bd79b88}.online-meta{min-width:0}.online-meta b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px}.online-meta small{display:block;color:#7f93ad;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.online-kind{font-size:9px;padding:3px 5px;border:1px solid #2a405d;border-radius:6px;color:#9bb6d7}.online-kind.npc{color:#ffd98d;border-color:#594827}.online-kind.system{color:#8ee6ff;border-color:#28515c}
      .goal-board{margin-top:14px}.goal-grid{display:grid;grid-template-columns:1.2fr .9fr .9fr;gap:10px}.goal-card{border:1px solid var(--line);background:linear-gradient(145deg,#101a29,#0d151f);border-radius:14px;padding:14px;position:relative;overflow:hidden}.goal-card:before{content:'';position:absolute;width:120px;height:120px;border-radius:50%;right:-50px;top:-55px;background:rgba(110,168,255,.07);pointer-events:none}.goal-row{display:grid;grid-template-columns:36px 1fr auto;gap:9px;align-items:center;padding:9px 0;border-bottom:1px solid #1c2a3e}.goal-row:last-child{border-bottom:0}.goal-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:#17243a}.goal-name{font-size:12px;font-weight:800}.goal-sub{font-size:10px;color:#7f91aa;margin-top:2px}.goal-progress{height:6px;background:#172235;border-radius:99px;overflow:hidden;margin-top:6px}.goal-progress span{display:block;height:100%;background:linear-gradient(90deg,#5bd79b,#6ea8ff);border-radius:inherit;transition:width .35s ease}.goal-claim{padding:6px 8px;font-size:10px}.goal-done{color:#5bd79b;font-size:11px;font-weight:800}.city-event{display:flex;gap:9px;align-items:center;padding:9px;border:1px solid #1d2b40;border-radius:10px;background:#0c1520;margin-top:7px}.city-event .eico{font-size:22px;animation:accV4Float 3.2s ease-in-out infinite}.city-event b{font-size:12px}.city-event small{display:block;color:#8093ad;font-size:10px;margin-top:2px}.goal-total{font-size:28px;font-weight:900;letter-spacing:-.03em}.goal-streak{display:inline-flex;gap:6px;align-items:center;padding:5px 8px;border-radius:999px;background:#1c1722;border:1px solid #493154;color:#ffb5f7;font-size:10px}
      .m-online-strip{display:flex;gap:6px;overflow:auto;margin-top:8px;padding-bottom:3px}.m-online-chip{display:flex;align-items:center;gap:6px;white-space:nowrap;border:1px solid var(--line);border-radius:999px;padding:5px 8px;background:#0d1622;font-size:10px}.m-online-dot{width:6px;height:6px;border-radius:50%;background:#5bd79b}.m-goal{padding:8px 0;border-bottom:1px solid #1c2a3e}.m-goal:last-child{border-bottom:0}.m-goal .row{gap:6px}.v4-pulse{animation:accV4Pulse 2s ease-in-out infinite}
      @keyframes accV4In{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}@keyframes accV4Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes accV4Pulse{0%,100%{box-shadow:0 0 0 0 rgba(91,215,155,.08)}50%{box-shadow:0 0 0 7px rgba(91,215,155,0)}}
      @media(max-width:1350px){.goal-grid{grid-template-columns:1fr 1fr}.goal-grid>.goal-card:first-child{grid-column:1/-1}}@media(max-width:720px){.goal-grid{grid-template-columns:1fr}.goal-grid>.goal-card:first-child{grid-column:auto}}
    `;
    document.head.appendChild(st);
  }

  function ensureUi() {
    if (!q('#app')) return false;
    document.title = `ACC City ${BUILD} — Living Community`;
    const badge = q('#acc-build-badge'); if (badge) badge.textContent = `ACC City ${BUILD}`;
    const sideVer = q('.sidebar-head .muted'); if (sideVer) sideVer.textContent = BUILD;

    const oldPill = [...document.querySelectorAll('.main-title .pill')].find(x => x.textContent.includes('ออนไลน์'));
    if (oldPill && !oldPill.id) { oldPill.id = 'onlineCountPill'; oldPill.classList.add('online-pill'); oldPill.innerHTML = '<span class="dot v4-pulse"></span><span id="onlineCountText">กำลังตรวจออนไลน์…</span>'; }

    if (!q('#accGoalBoard')) {
      const city = q('#view-city'); const note = city?.querySelector('.system-note');
      if (city && note) note.insertAdjacentHTML('afterend', `<div id="accGoalBoard" class="goal-board"></div>`);
    }
    const rb = q('.rightbar');
    if (rb && !q('#onlinePanel')) {
      const logout = q('#logoutBtn');
      const block = document.createElement('div');
      block.innerHTML = `<div class="section-title">ออนไลน์ตอนนี้</div><div id="onlinePanel" class="online-list"></div><div class="tiny muted" style="margin-top:7px">ผู้เล่น = Session ที่ตรวจพบในเบราว์เซอร์นี้ · NPC/ระบบติดป้ายแยก</div>`;
      rb.insertBefore(block, logout || null);
    }
    const mc = q('#mview-city');
    if (mc && !q('#mCommunityPulse')) {
      mc.insertAdjacentHTML('afterbegin', `<div id="mCommunityPulse" class="m-card" style="margin-bottom:8px"><div class="row"><b>🟢 Online Now</b><span id="mOnlineCount" class="pill">...</span></div><div id="mOnlineStrip" class="m-online-strip"></div></div><div id="mGoalBoard" class="m-card" style="margin-bottom:8px"></div>`);
    }
    return true;
  }

  const npcPool = [
    {name:'Alice',avatar:'A',role:'🛒 พ่อค้า',where:['Central Market','Moonlight Cafe','ACC Plaza'],kind:'NPC'},
    {name:'Kansai',avatar:'K',role:'💬 Community Host',where:['#ทั่วไป','ACC Plaza','Night Owl Community'],kind:'NPC'},
    {name:'Rin',avatar:'R',role:'🏃 นักกีฬา',where:['Sports District','สนามวิ่ง','ACC Plaza'],kind:'NPC'},
    {name:'Mika',avatar:'M',role:'🚚 ขนส่ง',where:['City Logistics','Central Market','Industrial Zone'],kind:'NPC'},
    {name:'ACC Clerk',avatar:'AC',role:'🏦 เจ้าหน้าที่เมือง',where:['Central Bank','City Hall','Employment Center'],kind:'SYSTEM'}
  ];
  function readPresence() {
    const now = Date.now(); const map = safe(localStorage.getItem(PRESENCE_KEY)) || {};
    Object.keys(map).forEach(k => { if (!map[k] || now - Number(map[k].ts || 0) > STALE_MS) delete map[k]; });
    return map;
  }
  function writePresence() {
    if (typeof state === 'undefined' || !state.uid || q('#app')?.classList.contains('hidden')) return;
    const map = readPresence();
    map[tabId] = { uid: state.uid, name: state.name || 'Guest', role: roleLabel(), rep: Number(state.rep || 0), ts: Date.now(), where: q('#viewTitle')?.textContent || 'เมือง' };
    try { localStorage.setItem(PRESENCE_KEY, JSON.stringify(map)); } catch {}
    renderOnline(map);
  }
  function removePresence() {
    const map = readPresence(); delete map[tabId];
    try { localStorage.setItem(PRESENCE_KEY, JSON.stringify(map)); } catch {}
  }
  function onlineRows(map) {
    const seen = new Set();
    const sessions = Object.values(map).filter(x => x?.uid && !seen.has(x.uid) && seen.add(x.uid));
    const gt = gameTime();
    const npcs = npcPool.slice(0, 4).map((n,i) => ({...n, where:n.where[(gt.daySerial+i)%n.where.length]}));
    return {sessions,npcs};
  }
  function renderOnline(map = readPresence()) {
    if (!ensureUi()) return;
    const {sessions,npcs} = onlineRows(map);
    const total = sessions.length + npcs.length;
    const txt = q('#onlineCountText'); if (txt) txt.textContent = `${total} ออนไลน์`;
    const mcount = q('#mOnlineCount'); if (mcount) mcount.textContent = `${total} คน`;
    const userHtml = sessions.map(u => `<div class="online-user"><div class="online-avatar">${esc((u.name||'?').slice(0,1).toUpperCase())}</div><div class="online-meta"><b>${esc(u.name)}</b><small>${esc(u.role)} · ${esc(u.where||'เมือง')} · ⭐${Number(u.rep||0)}</small></div><span class="online-kind">PLAYER</span></div>`).join('');
    const npcHtml = npcs.map(n => `<div class="online-user"><div class="online-avatar">${esc(n.avatar)}</div><div class="online-meta"><b>${esc(n.name)}</b><small>${esc(n.role)} · ${esc(n.where)}</small></div><span class="online-kind ${n.kind==='SYSTEM'?'system':'npc'}">${n.kind}</span></div>`).join('');
    const panel = q('#onlinePanel'); if (panel) panel.innerHTML = userHtml + npcHtml;
    const strip = q('#mOnlineStrip'); if (strip) strip.innerHTML = [...sessions.map(u=>({name:u.name,kind:'PLAYER'})), ...npcs.slice(0,3)].map(x=>`<span class="m-online-chip"><span class="m-online-dot"></span>${esc(x.name)}${x.kind!=='PLAYER'?` · ${x.kind}`:''}</span>`).join('');
  }

  function ensureActivity() {
    if (typeof state === 'undefined') return null;
    const g = gameTime();
    if (!state.activityV4 || state.activityV4.daySerial !== g.daySerial) {
      state.activityV4 = {daySerial:g.daySerial,jobs:0,bank:0,sports:0,social:0,claims:{},bonus:false};
      try { save(); } catch {}
    }
    state.milestoneClaimsV4 ||= {};
    return state.activityV4;
  }
  function bump(key) {
    const a = ensureActivity(); if (!a || !(key in a)) return;
    a[key] = Number(a[key]||0) + 1;
    try { save(); } catch {}
    setTimeout(renderGoals, 40);
  }
  function goalDefs() {
    const a = ensureActivity() || {};
    return [
      {id:'job',icon:'💼',name:'ทำงานให้เมือง 1 ครั้ง',sub:'Job Center',value:a.jobs||0,target:1,reward:250},
      {id:'bank',icon:'🏦',name:'ใช้บริการธนาคาร 1 ครั้ง',sub:'ฝาก / ถอน / โอน / จ่าย',value:a.bank||0,target:1,reward:150},
      {id:'sport',icon:'🏟️',name:'ลงสนามกีฬา 1 ครั้ง',sub:'วิ่ง / ม้า / ไก่กีฬา / จักรยาน',value:a.sports||0,target:1,reward:200,rep:2},
      {id:'social',icon:'💬',name:'คุยในเมือง 1 ข้อความ',sub:'สร้าง Social Activity',value:a.social||0,target:1,reward:100}
    ];
  }
  function milestoneDefs() {
    if (typeof state === 'undefined') return [];
    const assets = Number(state.wallet||0)+Number(state.bank||0);
    return [
      {id:'rep100',icon:'⭐',name:'ชื่อเสียง 100',value:Number(state.rep||0),target:100,reward:800},
      {id:'assets50k',icon:'💰',name:'สินทรัพย์ 50,000',value:assets,target:50000,reward:1200},
      {id:'roles4',icon:'🎭',name:'สะสม 4 Role',value:(state.owned||[]).length,target:4,reward:750},
      {id:'org1',icon:'🏢',name:'มีกิจการแรก',value:(state.orgs||[]).length,target:1,reward:1500},
      {id:'credit800',icon:'💳',name:'Credit Score 800',value:Number(state.creditScore||720),target:800,reward:1000}
    ];
  }
  function claimDaily(id) {
    const a = ensureActivity(); const g = goalDefs().find(x=>x.id===id); if(!a||!g||g.value<g.target||a.claims[id]) return;
    a.claims[id]=true; state.wallet = Number(state.wallet||0)+g.reward; state.rep=Number(state.rep||0)+Number(g.rep||0);
    try { addLedger(`Daily Board · ${g.name}`,g.reward); } catch {}
    const all = goalDefs().every(x => a.claims[x.id]);
    if (all && !a.bonus) { a.bonus=true; state.wallet+=500; state.rep+=3; try{addLedger('Daily Board Completion',500)}catch{} }
    try { save(); renderAll(); } catch {}
    renderGoals(); if (typeof toast==='function') toast(all?'🎯 Daily Board ครบ! โบนัส ฿500 +3 REP':`รับรางวัล ฿${g.reward.toLocaleString('th-TH')}`);
  }
  function claimMilestone(id) {
    const m = milestoneDefs().find(x=>x.id===id); if(!m||m.value<m.target||state.milestoneClaimsV4[id]) return;
    state.milestoneClaimsV4[id]=true; state.wallet=Number(state.wallet||0)+m.reward;
    try{addLedger(`Milestone · ${m.name}`,m.reward)}catch{}; try{save();renderAll()}catch{}; renderGoals(); if(typeof toast==='function')toast(`🏆 Milestone สำเร็จ +฿${m.reward.toLocaleString('th-TH')}`);
  }
  function goalRow(x,claimed,type) {
    const pct=Math.min(100,Math.round((Number(x.value||0)/Math.max(1,x.target))*100)); const done=x.value>=x.target;
    return `<div class="goal-row"><div class="goal-icon">${x.icon}</div><div><div class="goal-name">${x.name}</div><div class="goal-sub">${x.sub||`${Math.min(x.value,x.target).toLocaleString('th-TH')} / ${x.target.toLocaleString('th-TH')}`}</div><div class="goal-progress"><span style="width:${pct}%"></span></div></div>${claimed?'<span class="goal-done">✓ รับแล้ว</span>':done?`<button class="goal-claim primary" data-v4-claim="${type}:${x.id}">รับ ฿${x.reward.toLocaleString('th-TH')}</button>`:`<span class="tiny muted">${pct}%</span>`}</div>`;
  }
  function renderGoals() {
    if (!ensureUi() || typeof state === 'undefined' || !state.uid) return;
    const a=ensureActivity(); const daily=goalDefs(); const milestones=milestoneDefs(); const gt=gameTime();
    const dailyClaimed=daily.filter(x=>a.claims[x.id]).length; const milestoneDone=milestones.filter(x=>state.milestoneClaimsV4[x.id]).length;
    const nextSportsDay=Math.ceil((gt.daySerial+1)/6)*6; const sportsMs=EPOCH+nextSportsDay*REAL_HOUR;
    const nextMarketDay=Math.ceil((gt.daySerial+1)/8)*8; const marketMs=EPOCH+nextMarketDay*REAL_HOUR;
    const html=`<div class="goal-grid">
      <div class="goal-card"><div class="row"><div><div class="tiny muted">DAILY BOARD · ACC DAY ${gt.day}</div><h3 style="margin:3px 0 0">🎯 วันนี้ทำอะไรต่อดี?</h3></div><span class="goal-streak">รีเซ็ต ${formatLeft(gt.nextDayMs-Date.now())}</span></div>${daily.map(x=>goalRow(x,!!a.claims[x.id],'daily')).join('')}<div class="tiny ${a.bonus?'pos':'muted'}" style="margin-top:9px">${a.bonus?'✓ รับโบนัสทำครบแล้ว':'ทำครบ 4 ภารกิจ รับโบนัส ฿500 +3 REP'}</div></div>
      <div class="goal-card"><div class="tiny muted">MILESTONES</div><div class="row"><h3 style="margin:3px 0 6px">🏆 เส้นทางของคุณ</h3><b>${milestoneDone}/${milestones.length}</b></div>${milestones.map(x=>goalRow(x,!!state.milestoneClaimsV4[x.id],'mile')).join('')}</div>
      <div class="goal-card"><div class="tiny muted">CITY BULLETIN</div><h3 style="margin:3px 0 6px">📌 กิจกรรมเมือง</h3><div class="city-event"><div class="eico">🏦</div><div><b>รอบบัญชีเดือนถัดไป</b><small>ดอกเบี้ย / งวดสินเชื่อ · อีก ${formatLeft(gt.nextMonthMs-Date.now())}</small></div></div><div class="city-event"><div class="eico">🏟️</div><div><b>ACC Sports Cup</b><small>เปิดรายการทุก 6 วัน ACC · อีก ${formatLeft(sportsMs-Date.now())}</small></div></div><div class="city-event"><div class="eico">🛒</div><div><b>Market Festival</b><small>กิจกรรมตลาดทุก 8 วัน ACC · อีก ${formatLeft(marketMs-Date.now())}</small></div></div><div style="margin-top:13px"><div class="tiny muted">DAILY PROGRESS</div><div class="goal-total">${dailyClaimed}/4</div><div class="goal-progress"><span style="width:${dailyClaimed*25}%"></span></div></div></div>
    </div>`;
    const board=q('#accGoalBoard'); if(board)board.innerHTML=html;
    const mb=q('#mGoalBoard'); if(mb)mb.innerHTML=`<div class="row"><div><b>🎯 Daily Board</b><div class="tiny muted">Day ${gt.day} · รีเซ็ต ${formatLeft(gt.nextDayMs-Date.now())}</div></div><span class="pill">${dailyClaimed}/4</span></div>${daily.map(x=>`<div class="m-goal"><div class="row"><span class="small">${x.icon} ${x.name}</span>${a.claims[x.id]?'<span class="pos tiny">✓</span>':x.value>=x.target?`<button class="goal-claim primary" data-v4-claim="daily:${x.id}">รับ</button>`:`<span class="tiny muted">${Math.min(x.value,x.target)}/${x.target}</span>`}</div></div>`).join('')}`;
  }

  function installTracking() {
    document.addEventListener('click', e => {
      const t=e.target.closest('button,[data-job],[data-race-act],[data-cock]'); if(!t)return;
      if(t.dataset?.job) setTimeout(()=>bump('jobs'),30);
      if(t.id==='bankConfirm') setTimeout(()=>bump('bank'),80);
      if(t.dataset?.sport) setTimeout(()=>bump('sports'),80);
      const claim=t.dataset?.v4Claim; if(claim){ const [type,id]=claim.split(':'); type==='daily'?claimDaily(id):claimMilestone(id); }
      setTimeout(()=>{renderGoals();writePresence()},120);
    });
    document.addEventListener('keydown', e => {
      if(e.key==='Enter' && (e.target?.id==='chatInput'||e.target?.id==='mChatInput') && e.target.value.trim()) setTimeout(()=>bump('social'),80);
    });
    ['sendChat','mSendChat'].forEach(id=>{document.addEventListener('click',e=>{if(e.target?.id===id){const inp=q(id==='sendChat'?'#chatInput':'#mChatInput');if(inp?.value.trim())setTimeout(()=>bump('social'),80)}})});
    window.addEventListener('storage', e=>{if(e.key===PRESENCE_KEY)renderOnline(safe(e.newValue)||{})});
    window.addEventListener('beforeunload',removePresence);
  }

  function start() {
    addCss(); ensureUi(); installTracking(); ensureActivity(); writePresence(); renderGoals();
    setInterval(()=>{writePresence();renderGoals()},5000);
    setInterval(()=>{if(typeof state !== 'undefined' && state.uid){ensureUi();renderOnline();renderGoals()}},1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
