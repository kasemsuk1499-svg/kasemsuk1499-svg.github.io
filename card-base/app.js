(() => {
  "use strict";

  const SAVE_KEY = "card-base-prototype-v01";
  const CARD_MAX_ID = 9999;
  const ROLL_MS = 3500;

  const TIERS = [
    {name:"Common",      color:"#9aa1ad", multi:1},
    {name:"Uncommon",    color:"#62d58b", multi:1.8},
    {name:"Rare",        color:"#58a9ff", multi:3},
    {name:"Epic",        color:"#a579ff", multi:5.5},
    {name:"Legendary",   color:"#ffbd4a", multi:10},
    {name:"Mythic",      color:"#ff638b", multi:18},
    {name:"Divine",      color:"#67f1e4", multi:32},
    {name:"Celestial",   color:"#7f8cff", multi:60},
    {name:"Transcendent",color:"#ff79ee", multi:110},
    {name:"Eternal",     color:"#fff0a8", multi:200}
  ];

  const GRADES = [
    {name:"C",    color:"#a0a6b1", multi:1},
    {name:"B",    color:"#7ecb94", multi:1.12},
    {name:"A",    color:"#63b7ff", multi:1.28},
    {name:"A+",   color:"#8f9cff", multi:1.48},
    {name:"S",    color:"#c17cff", multi:1.75},
    {name:"S+",   color:"#ff7fce", multi:2.10},
    {name:"SS",   color:"#ff8d79", multi:2.55},
    {name:"SS+",  color:"#ffd166", multi:3.10},
    {name:"SSS",  color:"#82fff3", multi:3.80},
    {name:"SSS★", color:"#fff2a9", multi:5.00}
  ];

  const TITLES = [
    "Rookie Collector","Card Scout","Pack Seeker","Card Hunter","Vault Keeper",
    "Elite Collector","Card Warden","Treasure Keeper","Renowned Collector","Hall Master",
    "Card Baron","Vault Lord","Collection Master","Grand Collector","Card Duke",
    "Legend Keeper","Collector King","Card Emperor","Legend Sovereign","Grand Sovereign"
  ];

  const STANDS = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30];

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const newState = () => ({
    money: 0,
    baseLevel: 1,
    cards: [],
    placed: [],
    currentPack: null,
    rollingUntil: 0,
    lastTick: Date.now(),
    uidCounter: 1
  });

  let state = load();

  function load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY);
      if(!raw) return newState();
      const parsed = JSON.parse(raw);
      return {...newState(), ...parsed, lastTick: Date.now()};
    }catch{
      return newState();
    }
  }

  function save(){
    state.lastTick = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function fmt(n){
    if(!Number.isFinite(n)) return "∞";
    if(n < 1000) return Math.floor(n).toLocaleString("th-TH");
    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    let v=n, i=-1;
    while(v>=1000 && i<units.length-1){v/=1000;i++}
    return v.toFixed(v>=100?0:v>=10?1:2)+units[i];
  }

  function padId(id){ return "#"+String(id).padStart(4,"0"); }
  function imageFor(id){ return "../assets/cards/"+id+".png"; }
  function baseIncomeMultiplier(level=state.baseLevel){ return 1 + (level-1)*0.25; }
  function luckValue(level=state.baseLevel){ return 1 + (level-1)*0.145; }
  function standLimit(level=state.baseLevel){ return STANDS[level-1] || 30; }

  function charBaseIncome(id){
    return 80 + ((id * 7919 + 113) % 921);
  }

  function cardIncome(card){
    const tier = TIERS[card.tier];
    const grade = GRADES[card.grade];
    const levelMulti = Math.pow(1.105, Math.max(0,card.level-1));
    return charBaseIncome(card.charId) * tier.multi * grade.multi * levelMulti * baseIncomeMultiplier();
  }

  function totalIncome(){
    return state.placed.reduce((sum, uid) => {
      const c = state.cards.find(x=>x.uid===uid);
      return sum + (c ? cardIncome(c) : 0);
    },0);
  }

  function upgradeCost(card){
    const t = TIERS[card.tier].multi;
    const raw = 140 * Math.sqrt(t) * Math.pow(1.17, Math.max(0,card.level-1));
    return Math.min(raw, Number.MAX_SAFE_INTEGER);
  }

  function rerollCost(card){
    const raw = 900 * TIERS[card.tier].multi * Math.pow(1.08,card.grade);
    return Math.min(raw, Number.MAX_SAFE_INTEGER);
  }

  function sellValue(card){
    return Math.floor(350 * TIERS[card.tier].multi * GRADES[card.grade].multi * Math.pow(1.06,card.level-1));
  }

  function maxTierForLevel(level=state.baseLevel){
    return Math.min(10, 3 + Math.floor((level-1)*7/19));
  }

  function tierOdds(level=state.baseLevel){
    const maxTier = maxTierForLevel(level);
    const luck = luckValue(level);
    const ratio = 0.28 * luck;
    const weights = TIERS.map((_,i) => i < maxTier ? Math.pow(ratio,i) : 0);
    const sum = weights.reduce((a,b)=>a+b,0);
    return weights.map(w => sum ? w/sum : 0);
  }

  function randomTier(){
    const odds = tierOdds();
    let r = Math.random();
    for(let i=0;i<odds.length;i++){
      r -= odds[i];
      if(r<=0) return i;
    }
    return Math.max(0, odds.findLastIndex(x=>x>0));
  }

  function randomGrade(){
    const weights=[44,25,14,7,4,2.5,1.5,.8,.18,.02];
    let r=Math.random()*weights.reduce((a,b)=>a+b,0);
    for(let i=0;i<weights.length;i++){r-=weights[i];if(r<=0)return i}
    return 0;
  }

  function rebirthCost(level=state.baseLevel){
    return Math.floor(12000 * Math.pow(2.15, level-1));
  }

  function rebirthRequiredId(level=state.baseLevel){
    return (level * 487 + 113) % (CARD_MAX_ID+1);
  }

  function hasCharacter(id){
    return state.cards.some(c=>c.charId===id);
  }

  function toast(msg){
    const el=$("#toast");
    el.textContent=msg;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t=setTimeout(()=>el.classList.remove("show"),1800);
  }

  function tierStyle(index){
    return "--tier:"+TIERS[index].color;
  }

  function renderHeader(){
    $("#money").textContent=fmt(state.money);
    $("#income").textContent=fmt(totalIncome())+"/s";
    $("#baseLevel").textContent="Lv."+state.baseLevel;
    $("#luck").textContent="×"+luckValue().toFixed(2);
    $("#baseTitle").textContent=TITLES[state.baseLevel-1];
    $("#standCount").textContent=standLimit()+" แท่น";
    $("#incomeMulti").textContent="Income ×"+baseIncomeMultiplier().toFixed(2);
  }

  function renderBase(){
    const wrap=$("#stands");
    wrap.innerHTML="";
    const count=standLimit();
    state.placed=state.placed.filter(uid=>state.cards.some(c=>c.uid===uid)).slice(0,count);
    for(let i=0;i<count;i++){
      const uid=state.placed[i];
      const c=uid ? state.cards.find(x=>x.uid===uid) : null;
      const slot=document.createElement("div");
      slot.className="stand"+(c?"":" empty");
      if(!c){
        slot.innerHTML='<span class="stand-number">แท่น '+(i+1)+'</span><div>+ ว่าง</div>';
      }else{
        const t=TIERS[c.tier], g=GRADES[c.grade];
        slot.innerHTML =
          '<span class="stand-number">แท่น '+(i+1)+'</span>'+
          '<div class="mini-card" style="'+tierStyle(c.tier)+'">'+
            '<img src="'+imageFor(c.charId)+'" alt="Card '+padId(c.charId)+'">'+
            '<div class="tier-ring"></div>'+
            '<div class="mini-meta"><b>'+padId(c.charId)+' · '+t.name+'</b><span>Lv.'+c.level+' · '+g.name+' · '+fmt(cardIncome(c))+'/s</span></div>'+
          '</div>';
        slot.querySelector("img").addEventListener("error",e=>{
          e.currentTarget.style.display="none";
        });
      }
      wrap.appendChild(slot);
    }
  }

  function renderOdds(){
    const odds=tierOdds();
    $("#luckTitle").textContent="Luck ×"+luckValue().toFixed(2)+" · ปลด Tier "+maxTierForLevel()+"/10";
    $("#odds").innerHTML=TIERS.map((t,i)=>
      '<div class="odd" style="--tier:'+t.color+';opacity:'+(odds[i]>0?1:.28)+'">'+
      '<span>'+t.name+'</span><b>'+(odds[i]*100).toFixed(odds[i]*100<1?2:1)+'%</b></div>'
    ).join("");
  }

  function renderPack(){
    const p=state.currentPack;
    const card=$("#packCard");
    if(!p){
      card.className="pack-card empty";
      card.style.removeProperty("--pack");
      $("#packTier").textContent="NO PACK";
      $("#packHint").textContent="กดสุ่มซองก่อน";
      return;
    }
    const t=TIERS[p.tier];
    card.className="pack-card sparkle";
    card.style.setProperty("--pack",t.color);
    $("#packTier").textContent=t.name.toUpperCase();
    $("#packHint").textContent="คลิกเพื่อเปิด · การ์ดด้านในเป็น "+t.name+" แน่นอน";
  }

  function renderCollection(){
    const q=$("#searchId").value.trim();
    const mode=$("#sortCards").value;
    let arr=[...state.cards];
    if(q) arr=arr.filter(c=>String(c.charId).includes(q));
    arr.sort((a,b)=>{
      if(mode==="tier") return b.tier-a.tier || b.level-a.level;
      if(mode==="level") return b.level-a.level || b.tier-a.tier;
      if(mode==="new") return b.uid-a.uid;
      return cardIncome(b)-cardIncome(a);
    });
    const wrap=$("#collection");
    wrap.innerHTML="";
    $("#emptyCollection").style.display=arr.length?"none":"block";

    arr.forEach(c=>{
      const t=TIERS[c.tier], g=GRADES[c.grade];
      const placed=state.placed.includes(c.uid);
      const el=document.createElement("article");
      el.className="card-item";
      el.innerHTML=
        '<div class="card-art" style="'+tierStyle(c.tier)+'">'+
          '<img src="'+imageFor(c.charId)+'" alt="Character '+padId(c.charId)+'">'+
          '<div class="tier-ring"></div>'+
          '<div class="card-grade" style="--grade:'+g.color+'">'+g.name+'</div>'+
          '<div class="card-tier">'+t.name+'</div>'+
          '<div class="card-id">'+padId(c.charId)+'</div>'+
        '</div>'+
        '<div class="card-body">'+
          '<div class="card-stats">'+
            '<div><span>Level</span><b>'+c.level+'</b></div>'+
            '<div><span>รายได้</span><b>'+fmt(cardIncome(c))+'/s</b></div>'+
            '<div><span>อัป Lv.</span><b>'+fmt(upgradeCost(c))+'</b></div>'+
            '<div><span>สุ่ม Grade</span><b>'+fmt(rerollCost(c))+'</b></div>'+
          '</div>'+
          '<div class="card-actions">'+
            '<button data-a="place">'+(placed?"เอาออกจากฐาน":"วางในฐาน")+'</button>'+
            '<button data-a="level">อัป Level</button>'+
            '<button data-a="grade">สุ่ม Grade</button>'+
            '<button class="'+(c.locked?"locked":"")+'" data-a="lock">'+(c.locked?"🔒 ปลดล็อก":"🔓 ล็อก")+'</button>'+
            '<button class="sell" data-a="sell" '+((placed||c.locked)?"disabled":"")+'>ขาย '+fmt(sellValue(c))+'</button>'+
          '</div>'+
        '</div>';
      el.querySelector("img").addEventListener("error",e=>{
        e.currentTarget.style.display="none";
      });
      el.addEventListener("click",ev=>{
        const btn=ev.target.closest("button[data-a]");
        if(!btn) return;
        const action=btn.dataset.a;
        if(action==="place") togglePlace(c.uid);
        if(action==="level") levelUp(c.uid);
        if(action==="grade") rerollGrade(c.uid);
        if(action==="lock") toggleLock(c.uid);
        if(action==="sell") sellCard(c.uid);
      });
      wrap.appendChild(el);
    });
  }

  function renderRebirth(){
    if(state.baseLevel>=20){
      $("#rebirthHeadline").textContent="Lv.20 · MAX";
      $("#rebirthMoney").textContent="—";
      $("#rebirthCard").textContent="—";
      $("#rebirthOwned").textContent="ถึงระดับสูงสุดของ V1 แล้ว";
      $("#rebirthBtn").disabled=true;
      $("#nextTitle").textContent="MAX";
      $("#nextStands").textContent="30";
      $("#nextIncome").textContent="×"+baseIncomeMultiplier(20).toFixed(2);
      $("#nextLuck").textContent="×"+luckValue(20).toFixed(2);
      return;
    }
    const next=state.baseLevel+1;
    const need=rebirthRequiredId();
    const cost=rebirthCost();
    const has=hasCharacter(need);
    $("#rebirthHeadline").textContent="Lv."+state.baseLevel+" → Lv."+next;
    $("#rebirthMoney").textContent=fmt(cost);
    $("#rebirthCard").textContent=padId(need);
    $("#rebirthOwned").textContent=has?"มีแล้ว ✓":"ยังไม่มี";
    $("#rebirthOwned").style.color=has?"var(--ok)":"var(--danger)";
    $("#rebirthBtn").disabled=!(state.money>=cost && has);
    $("#nextTitle").textContent=TITLES[next-1];
    $("#nextStands").textContent=standLimit(next);
    $("#nextIncome").textContent="×"+baseIncomeMultiplier(next).toFixed(2);
    $("#nextLuck").textContent="×"+luckValue(next).toFixed(2);
  }

  function renderAll(){
    renderHeader();
    renderBase();
    renderPack();
    renderOdds();
    renderCollection();
    renderRebirth();
    save();
  }

  function rollPack(){
    if(Date.now()<state.rollingUntil) return;
    state.currentPack=null;
    state.rollingUntil=Date.now()+ROLL_MS;
    $("#rollBtn").disabled=true;
    renderPack();
    tickRoll();
    save();
  }

  function tickRoll(){
    const remaining=state.rollingUntil-Date.now();
    if(remaining<=0){
      if(!state.currentPack){
        state.currentPack={tier:randomTier()};
        state.rollingUntil=0;
        toast("ได้ซอง "+TIERS[state.currentPack.tier].name+"!");
        renderAll();
      }
      $("#rollBtn").disabled=false;
      $("#timerFill").style.width="100%";
      $("#timerText").textContent="พร้อม · สุ่มใหม่ได้";
      return;
    }
    const p=1-(remaining/ROLL_MS);
    $("#timerFill").style.width=(p*100)+"%";
    $("#timerText").textContent="กำลังสุ่ม… "+(remaining/1000).toFixed(1)+" วิ";
    $("#rollBtn").disabled=true;
    requestAnimationFrame(tickRoll);
  }

  function openPack(){
    if(!state.currentPack || Date.now()<state.rollingUntil) return;
    const tier=state.currentPack.tier;
    const charId=Math.floor(Math.random()*(CARD_MAX_ID+1));
    const card={
      uid: state.uidCounter++,
      charId,
      tier,
      grade:0,
      level:1,
      locked:false,
      obtainedAt:Date.now()
    };
    state.cards.push(card);
    state.currentPack=null;
    showReveal(card);
    renderAll();
  }

  function showReveal(c){
    const t=TIERS[c.tier],g=GRADES[c.grade];
    $("#revealVisual").innerHTML=
      '<div class="reveal-visual" style="--tier:'+t.color+'">'+
        '<div class="reveal-art"><img src="'+imageFor(c.charId)+'" alt="Card '+padId(c.charId)+'"><div class="tier-ring"></div></div>'+
        '<div class="reveal-info"><h2>'+t.name+'</h2><p>'+padId(c.charId)+' · Grade '+g.name+'</p></div>'+
      '</div>';
    $("#reveal").classList.add("show");
    $("#reveal").setAttribute("aria-hidden","false");
    const img=$("#revealVisual img");
    if(img) img.addEventListener("error",e=>e.currentTarget.style.display="none");
  }

  function closeReveal(){
    $("#reveal").classList.remove("show");
    $("#reveal").setAttribute("aria-hidden","true");
  }

  function togglePlace(uid){
    const idx=state.placed.indexOf(uid);
    if(idx>=0){
      state.placed.splice(idx,1);
      toast("นำการ์ดออกจากฐานแล้ว");
    }else{
      if(state.placed.length>=standLimit()){
        toast("แท่นเต็มแล้ว");
        return;
      }
      state.placed.push(uid);
      toast("วางการ์ดบนฐานแล้ว");
    }
    renderAll();
  }

  function levelUp(uid){
    const c=state.cards.find(x=>x.uid===uid);
    if(!c) return;
    const cost=upgradeCost(c);
    if(state.money<cost){toast("เงินไม่พอ");return}
    state.money-=cost;
    c.level++;
    toast("อัปเป็น Lv."+c.level);
    renderAll();
  }

  function rerollGrade(uid){
    const c=state.cards.find(x=>x.uid===uid);
    if(!c) return;
    const cost=rerollCost(c);
    if(state.money<cost){toast("เงินไม่พอ");return}
    state.money-=cost;
    const rolled=randomGrade();
    if(rolled>c.grade){
      c.grade=rolled;
      toast("Grade ใหม่: "+GRADES[rolled].name+" ✨");
    }else{
      toast("ได้ "+GRADES[rolled].name+" · เก็บ Grade เดิมไว้");
    }
    renderAll();
  }

  function toggleLock(uid){
    const c=state.cards.find(x=>x.uid===uid);
    if(!c) return;
    c.locked=!c.locked;
    renderAll();
  }

  function sellCard(uid){
    const c=state.cards.find(x=>x.uid===uid);
    if(!c || c.locked || state.placed.includes(uid)) return;
    state.money+=sellValue(c);
    state.cards=state.cards.filter(x=>x.uid!==uid);
    toast("ขายการ์ดแล้ว +"+fmt(sellValue(c)));
    renderAll();
  }

  function doRebirth(){
    if(state.baseLevel>=20) return;
    const cost=rebirthCost();
    const need=rebirthRequiredId();
    if(state.money<cost || !hasCharacter(need)){toast("ยังไม่ครบเงื่อนไข");return}
    state.money=0;
    state.baseLevel++;
    state.placed=state.placed.slice(0,standLimit());
    toast("Rebirth สำเร็จ! ฐาน Lv."+state.baseLevel);
    renderAll();
  }

  function economyTick(){
    const now=Date.now();
    const dt=Math.min(5,(now-state.lastTick)/1000);
    if(dt>0){
      state.money+=totalIncome()*dt;
      state.lastTick=now;
      renderHeader();
      renderRebirth();
      if(Math.random()<0.15) save();
    }
  }

  function bind(){
    $$(".tab").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".tab").forEach(x=>x.classList.remove("active"));
      $$(".panel").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      $("#panel-"+btn.dataset.tab).classList.add("active");
      if(btn.dataset.tab==="collection") renderCollection();
    }));
    $("#rollBtn").addEventListener("click",rollPack);
    $("#packCard").addEventListener("click",openPack);
    $("#closeReveal").addEventListener("click",closeReveal);
    $("#searchId").addEventListener("input",renderCollection);
    $("#sortCards").addEventListener("change",renderCollection);
    $("#rebirthBtn").addEventListener("click",doRebirth);
    document.addEventListener("keydown",e=>{
      if(e.key==="1" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) rollPack();
      if(e.key==="Escape") closeReveal();
    });
    window.addEventListener("beforeunload",save);
  }

  function init(){
    bind();
    const now=Date.now();
    const offlineSeconds=Math.min(8*3600,Math.max(0,(now-(state.lastTick||now))/1000));
    if(offlineSeconds>2 && state.placed.length){
      state.money+=totalIncome()*offlineSeconds;
      toast("รับรายได้ออฟไลน์ "+fmt(totalIncome()*offlineSeconds));
    }
    state.lastTick=now;
    renderAll();
    if(state.rollingUntil>Date.now()) tickRoll();
    else if(state.rollingUntil && !state.currentPack){
      state.rollingUntil=0;
      state.currentPack={tier:randomTier()};
      renderAll();
    }
    setInterval(economyTick,1000);
  }

  init();
})();