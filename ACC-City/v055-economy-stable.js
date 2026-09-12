(()=>{
  if(window.__accEconomyV055)return; window.__accEconomyV055=1;
  const BUILD='v0.5.5';
  const EPOCH=new Date('2026-09-12T00:00:00+07:00').getTime();
  const DAY_MS=3600000;
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>{try{return typeof fmt==='function'?fmt(num(v)):'฿'+Math.round(num(v)).toLocaleString('th-TH')}catch{return '฿'+Math.round(num(v)).toLocaleString('th-TH')}};
  const ref=(p='TX')=>`ACC-${p}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const jobs=[
    {id:'city',icon:'🏛️',name:'งานบริการเมือง',wage:420,duration:45,roles:['citizen','worker','volunteer']},
    {id:'market',icon:'🛒',name:'ผู้ช่วยตลาดกลาง',wage:520,duration:60,roles:['merchant','service','worker']},
    {id:'delivery',icon:'🚚',name:'รอบขนส่งสินค้า',wage:680,duration:75,roles:['logistics','worker','freelance']},
    {id:'factory',icon:'🏭',name:'กะการผลิต',wage:760,duration:90,roles:['maker','craft','worker']},
    {id:'event',icon:'🎫',name:'ทีมงานอีเวนต์',wage:600,duration:60,roles:['event_host','community_host','creator','freelance']}
  ];
  const sports={
    running:{icon:'🏃',name:'แข่งวิ่ง',fee:100,prizes:[500,250,125]},
    cycling:{icon:'🚴',name:'จักรยาน',fee:150,prizes:[750,350,175]},
    horse:{icon:'🐎',name:'แข่งม้า',fee:250,prizes:[1500,750,300]},
    cock:{icon:'🐓',name:'ไก่ชนกีฬา',fee:200,prizes:[1000,500,250]}
  };
  let moneySig='',jobSig='',lastUiScan=0;
  function st(){return typeof state!=='undefined'?state:null}
  function ensure(){
    const s=st(); if(!s)return null;
    s.wallet=Math.max(0,num(s.wallet)); s.bank=Math.max(0,num(s.bank));
    s.moneyTxV054=Array.isArray(s.moneyTxV054)?s.moneyTxV054:[];
    s.jobFinanceV054=s.jobFinanceV054&&typeof s.jobFinanceV054==='object'?s.jobFinanceV054:{};
    s.jobFinanceV054.doneByDay=s.jobFinanceV054.doneByDay||{};
    s.sportFinanceV054=s.sportFinanceV054&&typeof s.sportFinanceV054==='object'?s.sportFinanceV054:{};
    return s;
  }
  function saveState(){try{save()}catch{}}
  function ledger(label,amount,account='wallet',type='general',meta={}){
    const s=ensure(); if(!s)return null;
    const id=ref(type.slice(0,3).toUpperCase());
    const tx={id,ts:Date.now(),label:String(label||type),amount:num(amount),account,type,meta};
    s.moneyTxV054.unshift(tx); s.moneyTxV054=s.moneyTxV054.slice(0,120);
    try{if(typeof addLedgerV3==='function')addLedgerV3(`${tx.label} · ${id}`,tx.amount);else if(typeof addLedger==='function')addLedger(`${tx.label} · ${id}`,tx.amount)}
    catch{try{s.ledger=Array.isArray(s.ledger)?s.ledger:[];s.ledger.unshift({t:`${tx.label} · ${id}`,v:tx.amount})}catch{}}
    return tx;
  }
  function syncMoney(force=false){
    const s=ensure(); if(!s)return;
    const sig=`${s.wallet}|${s.bank}`; if(!force&&sig===moneySig)return; moneySig=sig;
    const set=(sel,val)=>qa(sel).forEach(el=>{const t=money(val);if(el.textContent!==t)el.textContent=t});
    set('[data-acc-balance="wallet"],#walletBalance,#mWalletBalance,#walletAmount,#walletValue',s.wallet);
    set('[data-acc-balance="bank"],#bankBalance,#mBankBalance,#bankAmount,#bankValue',s.bank);
    set('[data-acc-balance="total"]',s.wallet+s.bank);
    const a=q('#accCoreWallet');if(a)a.textContent=money(s.wallet);
    const b=q('#accCoreBank');if(b)b.textContent=money(s.bank);
    const c=q('#accCoreTotal');if(c)c.textContent=money(s.wallet+s.bank);
    const latest=q('#accCoreLatest'); const tx=s.moneyTxV054[0];
    if(latest)latest.textContent=tx?`ล่าสุด: ${tx.label} · ${tx.amount>=0?'+':''}${money(tx.amount)} · ${tx.id}`:'ยังไม่มีธุรกรรม';
  }
  function credit(amount,label='รับเงิน',opts={}){
    const s=ensure(),a=Math.max(0,Math.floor(num(amount))); if(!s||!a)return null;
    const acct=opts.account==='bank'?'bank':'wallet'; s[acct]+=a;
    const tx=ledger(label,a,acct,opts.type||'income',opts.meta||{}); saveState(); syncMoney(true);
    try{floatMoney(`+${money(a)}`,true)}catch{}; return tx;
  }
  function debit(amount,label='จ่ายเงิน',opts={}){
    const s=ensure(),a=Math.max(0,Math.floor(num(amount))); if(!s||!a)return null;
    const acct=opts.account==='bank'?'bank':'wallet'; if(s[acct]<a){try{toast(`${acct==='bank'?'Bank':'Wallet'} ไม่พอ`)}catch{};return null}
    s[acct]-=a; const tx=ledger(label,-a,acct,opts.type||'expense',opts.meta||{}); saveState(); syncMoney(true);
    try{floatMoney(`-${money(a)}`,false)}catch{}; return tx;
  }
  function move(from,to,amount,label='โอนระหว่างบัญชี'){
    const s=ensure(),a=Math.max(0,Math.floor(num(amount))); if(!s||!a||from===to||!['wallet','bank'].includes(from)||!['wallet','bank'].includes(to))return null;
    if(s[from]<a){try{toast(`${from==='bank'?'Bank':'Wallet'} ไม่พอ`)}catch{};return null}
    s[from]-=a;s[to]+=a;const tx=ledger(`${label} ${from} → ${to}`,0,to,'move',{amount:a,from,to});saveState();syncMoney(true);return tx;
  }
  window.ACCMoney={credit,debit,move,record:ledger,balance:()=>{const s=ensure();return s?{wallet:s.wallet,bank:s.bank,total:s.wallet+s.bank}:{wallet:0,bank:0,total:0}}};
  function addCss(){
    if(q('#acc-v055-css'))return;const st=document.createElement('style');st.id='acc-v055-css';st.textContent=`
      .acc-money-core{border:1px solid #2a4161;background:linear-gradient(145deg,#101c2c,#0c1622);border-radius:15px;padding:13px;margin-bottom:12px}.acc-money-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.acc-money-box,.acc-job,.acc-prize{padding:10px;border-radius:11px;background:#0b1420;border:1px solid #20324a}.acc-money-box small,.acc-job .meta{color:#7f93ad}.acc-money-box b{display:block;font-size:20px;margin-top:3px}.acc-job-grid,.acc-prize-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.acc-shift{border:1px solid #3a4e70;background:#101b2a;border-radius:13px;padding:12px;margin-bottom:10px}.acc-shift-progress{height:7px;background:#172235;border-radius:99px;overflow:hidden;margin:8px 0}.acc-shift-progress span{display:block;height:100%;background:linear-gradient(90deg,#5bd79b,#6ea8ff)}.acc-prize .podium{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.acc-prize .podium span{font-size:10px;padding:4px 6px;border-radius:7px;background:#16243a}.acc-tx-mini{font-size:10px;color:#7e91aa;margin-top:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(max-width:820px){.acc-money-grid{grid-template-columns:1fr 1fr}.acc-money-box:last-child{grid-column:1/-1}.acc-job-grid,.acc-prize-grid{grid-template-columns:1fr}.acc-job button{min-height:44px;width:100%}}
    `;document.head.appendChild(st);
  }
  function financeHtml(){const s=ensure();if(!s)return'';return`<div id="accMoneyCoreCard" class="acc-money-core"><div class="row"><div><b>💳 ACC Money Core</b><div class="tiny muted">ยอดกลาง Wallet / Bank / งาน / กีฬา / คาสิโน</div></div><span style="color:#6ee5a5;font-size:10px">● STABLE</span></div><div class="acc-money-grid" style="margin-top:10px"><div class="acc-money-box"><small>Wallet</small><b id="accCoreWallet">${money(s.wallet)}</b></div><div class="acc-money-box"><small>Bank</small><b id="accCoreBank">${money(s.bank)}</b></div><div class="acc-money-box"><small>รวม</small><b id="accCoreTotal">${money(s.wallet+s.bank)}</b></div></div><div id="accCoreLatest" class="acc-tx-mini">ยังไม่มีธุรกรรม</div></div>`}
  function injectFinance(){const host=q('#view-economy')||q('#view-bank')||q('#bankViewBody');if(host&&!q('#accMoneyCoreCard')){host.insertAdjacentHTML('afterbegin',financeHtml());syncMoney(true)}}
  function daySerial(){return Math.floor(Math.max(0,Date.now()-EPOCH)/DAY_MS)}
  function doneToday(){const s=ensure();return num(s?.jobFinanceV054?.doneByDay?.[daySerial()])}
  function currentShift(){return ensure()?.jobFinanceV054?.shift||null}
  function roleId(){try{return String(state.active||'citizen')}catch{return'citizen'}}
  function jobBonus(job){const r=roleId();return job.roles.includes(r)?.12:(r==='freelance'?.05:0)}
  function startJob(id){
    const s=ensure(),job=jobs.find(x=>x.id===id);if(!s||!job)return;
    if(currentShift()){try{toast('มีงานที่กำลังทำอยู่แล้ว')}catch{};return}
    if(doneToday()>=6){try{toast('ทำครบ 6 กะของวัน ACC นี้แล้ว')}catch{};return}
    const bonus=jobBonus(job),wage=Math.round(job.wage*(1+bonus));
    s.jobFinanceV054.shift={id:job.id,name:job.name,start:Date.now(),end:Date.now()+job.duration*1000,wage,base:job.wage,bonus};saveState();jobSig='';renderJobs(true);try{toast(`เริ่ม ${job.name} · ${job.duration} วินาที`)}catch{}
  }
  function claimJob(){
    const s=ensure(),sh=currentShift();if(!s||!sh)return;if(Date.now()<sh.end){try{toast('กะงานยังไม่เสร็จ')}catch{};return}
    s.jobFinanceV054.shift=null;s.jobFinanceV054.doneByDay[daySerial()]=doneToday()+1;
    credit(sh.wage,`ค่าจ้าง · ${sh.name}`,{type:'job',meta:{job:sh.id}});if(s.activityV4&&s.activityV4.daySerial===daySerial())s.activityV4.jobs=num(s.activityV4.jobs)+1;s.rep=num(s.rep)+1;saveState();jobSig='';renderJobs(true);try{toast(`รับค่าจ้าง ${money(sh.wage)} แล้ว`)}catch{}
  }
  function cancelJob(){const s=ensure();if(!s?.jobFinanceV054?.shift)return;s.jobFinanceV054.shift=null;saveState();jobSig='';renderJobs(true)}
  function jobsHtml(){
    const sh=currentShift();let active='';
    if(sh){const total=Math.max(1,sh.end-sh.start),left=Math.max(0,sh.end-Date.now()),pct=Math.max(0,Math.min(100,(Date.now()-sh.start)/total*100));active=`<div class="acc-shift"><div class="row"><div><b>⏱️ ${esc(sh.name)}</b><div class="tiny muted">ค่าจ้าง ${money(sh.wage)} · ${left?Math.ceil(left/1000)+' วิ':'เสร็จแล้ว'}</div></div><span class="pill">${left?'กำลังทำงาน':'พร้อมรับ'}</span></div><div class="acc-shift-progress"><span style="width:${pct}%"></span></div><div class="row"><span class="tiny muted">กะวันนี้ ${doneToday()}/6</span><div><button data-v055-cancel-job class="ghost">ยกเลิก</button> <button data-v055-claim-job class="primary" ${left?'disabled':''}>รับค่าจ้าง</button></div></div></div>`}
    return `${active}<div class="row"><div><b>💼 ACC Job Payroll</b><div class="tiny muted">ค่าจ้างเข้า Wallet และลง Ledger ทุกกะ</div></div><span class="pill">${doneToday()}/6 กะวันนี้</span></div><div class="acc-job-grid" style="margin-top:10px">${jobs.map(j=>{const bonus=jobBonus(j),w=Math.round(j.wage*(1+bonus));return`<div class="acc-job"><b>${j.icon} ${j.name}</b><div class="meta">${j.duration} วินาที · ฐาน ${money(j.wage)}${bonus?` · Role Bonus +${Math.round(bonus*100)}%`:''}</div><div class="row" style="margin-top:8px"><b>${money(w)}</b><button data-v055-job="${j.id}" class="primary" ${sh||doneToday()>=6?'disabled':''}>เริ่มงาน</button></div></div>`}).join('')}</div>`;
  }
  function renderJobs(force=false){const host=q('#accJobFinance');if(!host)return;const sh=currentShift();const sec=sh?Math.max(0,Math.ceil((sh.end-Date.now())/1000)):0;const sig=`${sh?.id||''}|${sec}|${doneToday()}|${roleId()}`;if(!force&&sig===jobSig)return;jobSig=sig;host.innerHTML=jobsHtml()}
  function injectJobs(){const view=q('#view-jobs')||q('#view-work');if(!view)return;let host=q('#accJobFinance');if(!host){host=document.createElement('div');host.id='accJobFinance';host.className='card';host.style.marginBottom='12px';view.insertBefore(host,view.firstChild);jobSig=''}renderJobs()}
  function sportKey(el){const raw=((el?.dataset?.sport||'')+' '+(el?.textContent||'')).toLowerCase();if(/run|วิ่ง/.test(raw))return'running';if(/cycl|จักรยาน|ปั่น/.test(raw))return'cycling';if(/horse|ม้า/.test(raw))return'horse';if(/cock|ไก่/.test(raw))return'cock';return null}
  function beginSport(key){
    const s=ensure(),sp=sports[key];if(!s||!sp)return;const old=s.sportFinanceV054.session;if(old&&!old.settled&&Date.now()-old.started<900000)return;
    const before=s.wallet;setTimeout(()=>{const ss=ensure();if(!ss)return;const paid=Math.max(0,before-ss.wallet);if(paid<sp.fee){const missing=sp.fee-paid;if(ss.wallet<missing){try{toast('Wallet ไม่พอสำหรับค่าสมัคร')}catch{};return}debit(missing,`ค่าสมัคร ${sp.name}`,{type:'sport_entry',meta:{sport:key}})}else if(paid>0)ledger(`ค่าสมัคร ${sp.name}`,-paid,'wallet','sport_entry',{sport:key,legacy:true});ss.sportFinanceV054.session={id:ref('SPT'),sport:key,started:Date.now(),entry:sp.fee,baseWallet:ss.wallet,settled:false};saveState();syncMoney(true)},220)
  }
  function detectRank(text){const t=String(text||'');if(!/(ผลการแข่งขัน|ผลการแข่ง|เข้าเส้นชัย|จบการแข่งขัน|คุณชนะ|อันดับ|winner|finished)/i.test(t))return null;const m=t.match(/อันดับ\s*([1-9])/);if(m)return Number(m[1]);if(/คุณชนะ|ชนะการแข่งขัน|winner/i.test(t))return 1;if(/แพ้|ไม่ติดอันดับ/i.test(t))return 0;return null}
  function settleSport(rank){
    const s=ensure(),ses=s?.sportFinanceV054?.session;if(!s||!ses||ses.settled)return;const sp=sports[ses.sport];if(!sp)return;
    ses.settled=true;ses.rank=rank;const expected=rank>=1&&rank<=3?sp.prizes[rank-1]:0;const already=Math.max(0,s.wallet-num(ses.baseWallet));if(expected>already)credit(expected-already,`เงินรางวัล ${sp.name} · อันดับ ${rank}`,{type:'sport_prize',meta:{sport:ses.sport,rank,expected,already}});else if(expected>0&&already>0)ledger(`เงินรางวัล ${sp.name} · อันดับ ${rank}`,already,'wallet','sport_prize',{sport:ses.sport,rank,legacy:true});ses.reward=expected;if(s.activityV4&&s.activityV4.daySerial===daySerial())s.activityV4.sports=num(s.activityV4.sports)+1;saveState();syncMoney(true);try{toast(expected?`อันดับ ${rank} รับรางวัล ${money(expected)}`:'จบการแข่งขัน · ไม่มีเงินรางวัล')}catch{}
  }
  function inspectSportResult(){const ses=ensure()?.sportFinanceV054?.session;if(!ses||ses.settled||Date.now()-ses.started<800)return;const nodes=qa('#modal [id*="result" i],#modal [class*="result" i],#view-sports [id*="result" i],#view-sports [class*="result" i],#view-arena [id*="result" i],#view-arena [class*="result" i]');for(const el of nodes){const r=detectRank(el.textContent);if(r!==null){settleSport(r);break}}}
  function injectSports(){const view=q('#view-sports')||q('#view-arena');if(!view||q('#accSportPrizeBoard'))return;const d=document.createElement('div');d.id='accSportPrizeBoard';d.className='card';d.style.marginBottom='12px';d.innerHTML=`<div class="row"><div><b>🏆 เงินรางวัลการแข่งขัน</b><div class="tiny muted">ค่าสมัครครั้งเดียว · รางวัลเข้ Wallet ผ่าน Money Core</div></div><span class="pill">ACC Sports Treasury</span></div><div class="acc-prize-grid" style="margin-top:10px">${Object.values(sports).map(x=>`<div class="acc-prize"><b>${x.icon} ${x.name}</b><div class="tiny muted">ค่าสมัคร ${money(x.fee)}</div><div class="podium"><span>🥇 ${money(x.prizes[0])}</span><span>🥈 ${money(x.prizes[1])}</span><span>🥉 ${money(x.prizes[2])}</span></div></div>`).join('')}</div>`;view.insertBefore(d,view.firstChild)}
  function ensureUi(){addCss();injectFinance();injectJobs();injectSports()}
  document.addEventListener('click',e=>{
    const j=e.target.closest('[data-v055-job]');if(j){startJob(j.dataset.v055Job);return}
    if(e.target.closest('[data-v055-claim-job]')){claimJob();return}
    if(e.target.closest('[data-v055-cancel-job]')){cancelJob();return}
    const sp=e.target.closest('[data-sport]');if(sp){const key=sportKey(sp);if(key)beginSport(key)}
    if(e.target.closest('[data-race-act],[data-cock]'))setTimeout(inspectSportResult,120);
  },true);
  function tick(){if(!ensure())return;syncMoney();renderJobs();inspectSportResult();const now=Date.now();if(now-lastUiScan>3000){lastUiScan=now;ensureUi()}}
  function start(){ensureUi();syncMoney(true);setInterval(tick,1000);const b=q('#acc-build-badge');if(b)b.textContent=`ACC City ${BUILD}`;document.title=`ACC City ${BUILD} — Stable Economy`}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();