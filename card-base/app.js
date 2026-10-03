(() => {
  "use strict";

  const SAVE_KEY = "card-base-prototype-v01";
  const CARD_MIN_ID = 1;
  const CARD_MAX_ID = 20;
  const ROLL_MS = 3500;

  const TIERS = [
    {name:"Common",color:"#9aa1ad",multi:1},
    {name:"Uncommon",color:"#62d58b",multi:1.8},
    {name:"Rare",color:"#58a9ff",multi:3},
    {name:"Epic",color:"#a579ff",multi:5.5},
    {name:"Legendary",color:"#ffbd4a",multi:10},
    {name:"Mythic",color:"#ff638b",multi:18},
    {name:"Divine",color:"#67f1e4",multi:32},
    {name:"Celestial",color:"#7f8cff",multi:60},
    {name:"Transcendent",color:"#ff79ee",multi:110},
    {name:"Eternal",color:"#fff0a8",multi:200}
  ];

  const GRADES = [
    {name:"C",color:"#a0a6b1",multi:1},
    {name:"B",color:"#7ecb94",multi:1.12},
    {name:"A",color:"#63b7ff",multi:1.28},
    {name:"A+",color:"#8f9cff",multi:1.48},
    {name:"S",color:"#c17cff",multi:1.75},
    {name:"S+",color:"#ff7fce",multi:2.10},
    {name:"SS",color:"#ff8d79",multi:2.55},
    {name:"SS+",color:"#ffd166",multi:3.10},
    {name:"SSS",color:"#82fff3",multi:3.80},
    {name:"SSS★",color:"#fff2a9",multi:5.00}
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
    money:0, baseLevel:1, cards:[], placed:[],
    currentPack:null, rollingUntil:0, lastTick:Date.now(), uidCounter:1,
    autoTargets:[], autoRolling:false, targetFound:false
  });

  let state = load();
  let activeStand = null;
  let rollFrame = 0;
  let autoTimer = 0;

  function load(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw) return newState();
      const parsed=JSON.parse(raw);
      const s={...newState(),...parsed};
      s.cards=(Array.isArray(s.cards)?s.cards:[]).filter(c=>Number.isInteger(c.charId)&&c.charId>=CARD_MIN_ID&&c.charId<=CARD_MAX_ID);
      s.autoTargets=(Array.isArray(s.autoTargets)?s.autoTargets:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<10);
      s.autoRolling=false;
      s.targetFound=false;
      const valid=new Set(s.cards.map(c=>c.uid));
      const old=Array.isArray(s.placed)?s.placed:[];
      s.placed=old.map(uid=>valid.has(uid)?uid:null);
      return s;
    }catch{
      return newState();
    }
  }

  function save(){
    state.lastTick=Date.now();
    localStorage.setItem(SAVE_KEY,JSON.stringify(state));
  }

  function fmt(n){
    if(!Number.isFinite(n)) return "∞";
    if(n<1000) return Math.floor(n).toLocaleString("th-TH");
    const units=["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    let v=n,i=-1;
    while(v>=1000&&i<units.length-1){v/=1000;i++}
    return v.toFixed(v>=100?0:v>=10?1:2)+units[i];
  }

  function padId(id){return "#"+String(id).padStart(4,"0")}
  function imageFor(id){return "../assets/cards/"+id+".png"}
  function baseIncomeMultiplier(level=state.baseLevel){return 1+(level-1)*0.25}
  function luckValue(level=state.baseLevel){return 1+(level-1)*0.145}
  function standLimit(level=state.baseLevel){return STANDS[level-1]||30}
  function charBaseIncome(id){return 80+((id*7919+113)%921)}

  function normalizeSlots(){
    const count=standLimit();
    const next=new Array(count).fill(null);
    const seen=new Set();
    for(let i=0;i<Math.min(state.placed.length,count);i++){
      const uid=state.placed[i];
      if(uid&&state.cards.some(c=>c.uid===uid)&&!seen.has(uid)){next[i]=uid;seen.add(uid)}
    }
    state.placed=next;
  }

  function cardIncome(card){
    const tier=TIERS[card.tier],grade=GRADES[card.grade];
    const levelMulti=Math.pow(1.105,Math.max(0,card.level-1));
    return charBaseIncome(card.charId)*tier.multi*grade.multi*levelMulti*baseIncomeMultiplier();
  }

  function totalIncome(){
    normalizeSlots();
    return state.placed.reduce((sum,uid)=>{
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      return sum+(c?cardIncome(c):0);
    },0);
  }

  function upgradeCost(card){
    return Math.min(140*Math.sqrt(TIERS[card.tier].multi)*Math.pow(1.17,Math.max(0,card.level-1)),Number.MAX_SAFE_INTEGER);
  }
  function rerollCost(card){
    return Math.min(900*TIERS[card.tier].multi*Math.pow(1.08,card.grade),Number.MAX_SAFE_INTEGER);
  }
  function sellValue(card){
    return Math.floor(350*TIERS[card.tier].multi*GRADES[card.grade].multi*Math.pow(1.06,card.level-1));
  }
  function maxTierForLevel(level=state.baseLevel){
    return Math.min(10,3+Math.floor((level-1)*7/19));
  }
  function tierOdds(level=state.baseLevel){
    const maxTier=maxTierForLevel(level),luck=luckValue(level),ratio=0.28*luck;
    const weights=TIERS.map((_,i)=>i<maxTier?Math.pow(ratio,i):0);
    const sum=weights.reduce((a,b)=>a+b,0);
    return weights.map(w=>sum?w/sum:0);
  }
  function randomTier(){
    const odds=tierOdds();
    let r=Math.random();
    for(let i=0;i<odds.length;i++){r-=odds[i];if(r<=0)return i}
    for(let i=odds.length-1;i>=0;i--) if(odds[i]>0) return i;
    return 0;
  }
  function randomGrade(){
    const weights=[44,25,14,7,4,2.5,1.5,.8,.18,.02];
    let r=Math.random()*weights.reduce((a,b)=>a+b,0);
    for(let i=0;i<weights.length;i++){r-=weights[i];if(r<=0)return i}
    return 0;
  }
  function rebirthCost(level=state.baseLevel){return Math.floor(12000*Math.pow(2.15,level-1))}
  function rebirthRequiredId(level=state.baseLevel){return ((level*7+3)%20)+1}
  function hasCharacter(id){return state.cards.some(c=>c.charId===id)}

  function toast(msg,found=false){
    const el=$("#toast");
    el.textContent=msg;
    el.classList.toggle("found",found);
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t=setTimeout(()=>{el.classList.remove("show","found")},2300);
  }

  function tierStyle(index){return "--tier:"+TIERS[index].color}

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
    normalizeSlots();
    const wrap=$("#stands"); wrap.innerHTML="";
    for(let i=0;i<standLimit();i++){
      const uid=state.placed[i];
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      const slot=document.createElement("button");
      slot.type="button";
      slot.className="stand"+(c?"":" empty");
      slot.dataset.slot=i;
      if(!c){
        slot.innerHTML='<span class="stand-number">แท่น '+(i+1)+'</span><div class="empty-stand"><b>＋</b><span>เลือกการ์ดจากคลัง</span></div>';
      }else{
        const t=TIERS[c.tier],g=GRADES[c.grade];
        slot.innerHTML=
          '<span class="stand-number">แท่น '+(i+1)+'</span>'+
          '<div class="mini-card" style="'+tierStyle(c.tier)+'">'+
            '<img src="'+imageFor(c.charId)+'" alt="Card '+padId(c.charId)+'">'+
            '<div class="tier-ring"></div>'+
            '<div class="mini-meta"><b>'+padId(c.charId)+' · '+t.name+'</b><span>Lv.'+c.level+' · '+g.name+' · '+fmt(cardIncome(c))+'/s</span></div>'+
          '</div>';
        const img=slot.querySelector("img"); if(img) img.addEventListener("error",e=>e.currentTarget.style.display="none");
      }
      slot.addEventListener("click",()=>openStand(i));
      wrap.appendChild(slot);
    }
  }

  function renderOdds(){
    const odds=tierOdds();
    $("#luckTitle").textContent="Luck ×"+luckValue().toFixed(2)+" · ปลด Tier "+maxTierForLevel()+"/10";
    $("#odds").innerHTML=TIERS.map((t,i)=>
      '<div class="odd" style="--tier:'+t.color+';opacity:'+(odds[i]>0?1:.28)+'"><span>'+t.name+'</span><b>'+(odds[i]*100).toFixed(odds[i]*100<1?2:1)+'%</b></div>'
    ).join("");
  }

  function renderFilters(){
    const max=maxTierForLevel();
    state.autoTargets=state.autoTargets.filter(i=>i<max);
    $("#tierFilters").innerHTML=TIERS.map((t,i)=>{
      const locked=i>=max,checked=state.autoTargets.includes(i);
      return '<label class="tier-check '+(locked?'locked':'')+'" style="--tier:'+t.color+'">'+
        '<input type="checkbox" data-tier="'+i+'" '+(checked?'checked ':'')+(locked?'disabled ':'')+'>'+
        '<span>'+t.name+(locked?' · Locked':'')+'</span></label>';
    }).join("");
    $("#autoBtn").classList.toggle("on",state.autoRolling);
    $("#autoBtn").textContent=state.autoRolling?"หยุด Auto Roll":"เริ่ม Auto Roll";
    $("#autoStatus").className="auto-status"+(state.autoRolling?" on":"");
    $("#autoStatus").textContent=state.autoRolling
      ?"กำลังหา: "+state.autoTargets.map(i=>TIERS[i].name).join(", ")
      :"Auto Roll ปิดอยู่";
  }

  function renderPack(){
    const p=state.currentPack,card=$("#packCard");
    if(!p){
      card.className="pack-card empty";
      card.style.removeProperty("--pack");
      $("#packTier").textContent="NO PACK";
      $("#packHint").textContent=state.autoRolling?"Auto Roll กำลังทำงาน…":"กดสุ่มซองก่อน";
      return;
    }
    const t=TIERS[p.tier];
    card.className="pack-card sparkle"+(state.targetFound?" found":"");
    card.style.setProperty("--pack",t.color);
    $("#packTier").textContent=t.name.toUpperCase();
    $("#packHint").textContent="คลิกเพื่อเปิด · การ์ดด้านในเป็น "+t.name+" แน่นอน";
  }

  function renderCollection(){
    const q=$("#searchId").value.trim(),mode=$("#sortCards").value;
    let arr=[...state.cards];
    if(q) arr=arr.filter(c=>String(c.charId).includes(q));
    arr.sort((a,b)=>{
      if(mode==="tier")return b.tier-a.tier||b.level-a.level;
      if(mode==="level")return b.level-a.level||b.tier-a.tier;
      if(mode==="new")return b.uid-a.uid;
      return cardIncome(b)-cardIncome(a);
    });
    const wrap=$("#collection"); wrap.innerHTML="";
    $("#emptyCollection").style.display=arr.length?"none":"block";
    arr.forEach(c=>{
      const t=TIERS[c.tier],g=GRADES[c.grade],placed=state.placed.includes(c.uid);
      const el=document.createElement("article"); el.className="card-item";
      el.innerHTML=
        '<div class="card-art" style="'+tierStyle(c.tier)+'">'+
          '<img src="'+imageFor(c.charId)+'" alt="Character '+padId(c.charId)+'"><div class="tier-ring"></div>'+
          '<div class="card-grade" style="--grade:'+g.color+'">'+g.name+'</div><div class="card-tier">'+t.name+'</div><div class="card-id">'+padId(c.charId)+'</div>'+
        '</div>'+
        '<div class="card-body"><div class="card-stats">'+
          '<div><span>Level</span><b>'+c.level+'</b></div><div><span>รายได้</span><b>'+fmt(cardIncome(c))+'/s</b></div>'+
          '<div><span>อัป Lv.</span><b>'+fmt(upgradeCost(c))+'</b></div><div><span>สุ่ม Grade</span><b>'+fmt(rerollCost(c))+'</b></div>'+
        '</div><div class="card-actions">'+
          '<button data-a="place">'+(placed?"เอาออกจากฐาน":"วางในแท่นว่าง")+'</button><button data-a="level">อัป Level</button>'+
          '<button data-a="grade">สุ่ม Grade</button><button class="'+(c.locked?"locked":"")+'" data-a="lock">'+(c.locked?"🔒 ปลดล็อก":"🔓 ล็อก")+'</button>'+
          '<button class="sell" data-a="sell" '+((placed||c.locked)?"disabled":"")+'>ขาย '+fmt(sellValue(c))+'</button>'+
        '</div></div>';
      const img=el.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
      el.addEventListener("click",ev=>{
        const btn=ev.target.closest("button[data-a]");if(!btn)return;
        const a=btn.dataset.a;
        if(a==="place")togglePlace(c.uid);
        if(a==="level")levelUp(c.uid);
        if(a==="grade")rerollGrade(c.uid);
        if(a==="lock")toggleLock(c.uid);
        if(a==="sell")sellCard(c.uid);
      });
      wrap.appendChild(el);
    });
  }

  function renderRebirth(){
    if(state.baseLevel>=20){
      $("#rebirthHeadline").textContent="Lv.20 · MAX";$("#rebirthMoney").textContent="—";$("#rebirthCard").textContent="—";
      $("#rebirthOwned").textContent="ถึงระดับสูงสุดของ V1 แล้ว";$("#rebirthBtn").disabled=true;$("#nextTitle").textContent="MAX";
      $("#nextStands").textContent="30";$("#nextIncome").textContent="×"+baseIncomeMultiplier(20).toFixed(2);$("#nextLuck").textContent="×"+luckValue(20).toFixed(2);return;
    }
    const next=state.baseLevel+1,need=rebirthRequiredId(),cost=rebirthCost(),has=hasCharacter(need);
    $("#rebirthHeadline").textContent="Lv."+state.baseLevel+" → Lv."+next;$("#rebirthMoney").textContent=fmt(cost);$("#rebirthCard").textContent=padId(need);
    $("#rebirthOwned").textContent=has?"มีแล้ว ✓":"ยังไม่มี";$("#rebirthOwned").style.color=has?"var(--ok)":"var(--danger)";
    $("#rebirthBtn").disabled=!(state.money>=cost&&has);$("#nextTitle").textContent=TITLES[next-1];$("#nextStands").textContent=standLimit(next);
    $("#nextIncome").textContent="×"+baseIncomeMultiplier(next).toFixed(2);$("#nextLuck").textContent="×"+luckValue(next).toFixed(2);
  }

  function renderAll(){
    renderHeader();renderBase();renderPack();renderOdds();renderFilters();renderCollection();renderRebirth();save();
  }

  function beginRoll(){
    if(Date.now()<state.rollingUntil)return;
    state.currentPack=null;state.targetFound=false;state.rollingUntil=Date.now()+ROLL_MS;
    $("#rollBtn").disabled=true;renderPack();cancelAnimationFrame(rollFrame);tickRoll();save();
  }

  function tickRoll(){
    const remaining=state.rollingUntil-Date.now();
    if(remaining<=0){
      state.rollingUntil=0;
      state.currentPack={tier:randomTier()};
      const hit=state.autoRolling&&state.autoTargets.includes(state.currentPack.tier);
      if(hit){
        state.autoRolling=false;state.targetFound=true;
        clearTimeout(autoTimer);
        toast("เจอ "+TIERS[state.currentPack.tier].name+" แล้ว! Auto Roll หยุดให้แล้ว ✨",true);
      }else if(state.autoRolling){
        autoTimer=setTimeout(()=>{if(state.autoRolling)beginRoll()},450);
      }else{
        toast("ได้ซอง "+TIERS[state.currentPack.tier].name+"!");
      }
      $("#rollBtn").disabled=false;$("#timerFill").style.width="100%";$("#timerText").textContent=hit?"เจอเป้าหมายแล้ว":"พร้อม · สุ่มใหม่ได้";
      renderAll();return;
    }
    const p=1-(remaining/ROLL_MS);
    $("#timerFill").style.width=(p*100)+"%";$("#timerText").textContent="กำลังสุ่ม… "+(remaining/1000).toFixed(1)+" วิ";
    $("#rollBtn").disabled=true;rollFrame=requestAnimationFrame(tickRoll);
  }

  function toggleAuto(){
    if(state.autoRolling){
      state.autoRolling=false;clearTimeout(autoTimer);toast("หยุด Auto Roll แล้ว");renderFilters();save();return;
    }
    const max=maxTierForLevel();
    state.autoTargets=state.autoTargets.filter(i=>i<max);
    if(!state.autoTargets.length){toast("ติ๊ก Tier ที่ต้องการอย่างน้อย 1 ระดับก่อน");return}
    if(state.currentPack&&state.autoTargets.includes(state.currentPack.tier)){
      state.targetFound=true;toast("ซองปัจจุบันตรงกับ Filter อยู่แล้ว ✨",true);renderAll();return;
    }
    state.autoRolling=true;state.targetFound=false;renderFilters();save();
    if(Date.now()>=state.rollingUntil)beginRoll();
  }

  function openPack(){
    if(!state.currentPack||Date.now()<state.rollingUntil)return;
    state.autoRolling=false;clearTimeout(autoTimer);
    const tier=state.currentPack.tier;
    const charId=CARD_MIN_ID+Math.floor(Math.random()*(CARD_MAX_ID-CARD_MIN_ID+1));
    const card={uid:state.uidCounter++,charId,tier,grade:0,level:1,locked:false,obtainedAt:Date.now()};
    state.cards.push(card);state.currentPack=null;state.targetFound=false;showReveal(card);renderAll();
  }

  function showReveal(c){
    const t=TIERS[c.tier],g=GRADES[c.grade];
    $("#revealVisual").innerHTML='<div class="reveal-visual" style="--tier:'+t.color+'"><div class="reveal-art"><img src="'+imageFor(c.charId)+'" alt="Card '+padId(c.charId)+'"><div class="tier-ring"></div></div><div class="reveal-info"><h2>'+t.name+'</h2><p>'+padId(c.charId)+' · Grade '+g.name+'</p></div></div>';
    $("#reveal").classList.add("show");$("#reveal").setAttribute("aria-hidden","false");
    const img=$("#revealVisual img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
  }
  function closeReveal(){$("#reveal").classList.remove("show");$("#reveal").setAttribute("aria-hidden","true")}

  function openStand(slot){
    activeStand=slot;$("#standModal").classList.add("show");$("#standModal").setAttribute("aria-hidden","false");renderStandModal();
  }
  function closeStand(){activeStand=null;$("#standModal").classList.remove("show");$("#standModal").setAttribute("aria-hidden","true")}

  function renderStandModal(){
    if(activeStand===null)return;
    normalizeSlots();
    const uid=state.placed[activeStand],c=uid?state.cards.find(x=>x.uid===uid):null;
    $("#standModalTitle").textContent="แท่น "+(activeStand+1);
    const body=$("#standModalBody");
    if(!c){renderPicker(body,activeStand);return}
    const t=TIERS[c.tier],g=GRADES[c.grade];
    body.innerHTML=
      '<div class="stand-detail"><div class="stand-detail-art" style="'+tierStyle(c.tier)+'"><img src="'+imageFor(c.charId)+'" alt="'+padId(c.charId)+'"><div class="tier-ring"></div><div class="card-grade" style="--grade:'+g.color+'">'+g.name+'</div><div class="card-tier">'+t.name+'</div><div class="card-id">'+padId(c.charId)+'</div></div>'+
      '<div class="stand-detail-info"><div><div class="eyebrow">INCOME</div><div class="big-income">'+fmt(cardIncome(c))+'/s</div></div>'+
      '<div class="card-stats"><div><span>Level</span><b>'+c.level+'</b></div><div><span>Grade</span><b>'+g.name+' ×'+g.multi.toFixed(2)+'</b></div><div><span>อัป Level</span><b>'+fmt(upgradeCost(c))+'</b></div><div><span>สุ่ม Grade</span><b>'+fmt(rerollCost(c))+'</b></div></div>'+
      '<div class="stand-actions"><button data-modal-a="level">อัป Level</button><button data-modal-a="grade">สุ่ม Grade</button><button data-modal-a="change">เปลี่ยนการ์ด</button><button class="remove" data-modal-a="remove">ถอดจากแท่น</button></div></div></div>';
    const img=body.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
    body.querySelector('[data-modal-a="level"]').addEventListener("click",()=>{levelUp(c.uid,true)});
    body.querySelector('[data-modal-a="grade"]').addEventListener("click",()=>{rerollGrade(c.uid,true)});
    body.querySelector('[data-modal-a="remove"]').addEventListener("click",()=>{state.placed[activeStand]=null;toast("ถอดการ์ดจากแท่นแล้ว");renderAll();renderStandModal()});
    body.querySelector('[data-modal-a="change"]').addEventListener("click",()=>renderPicker(body,activeStand,c.uid));
  }

  function renderPicker(body,slot,currentUid=null){
    const used=new Set(state.placed.filter(Boolean));
    if(currentUid)used.delete(currentUid);
    const choices=state.cards.filter(c=>!used.has(c.uid)).sort((a,b)=>cardIncome(b)-cardIncome(a));
    body.innerHTML='<p class="picker-note">'+(choices.length?'เลือกการ์ดจากคลังเพื่อวางที่แท่นนี้':'ยังไม่มีการ์ดว่างในคลัง')+'</p><div class="picker-grid"></div>';
    const grid=body.querySelector(".picker-grid");
    choices.forEach(c=>{
      const t=TIERS[c.tier],g=GRADES[c.grade],btn=document.createElement("button");
      btn.type="button";btn.className="picker-card";
      btn.innerHTML='<div class="picker-art" style="'+tierStyle(c.tier)+'"><img src="'+imageFor(c.charId)+'" alt="'+padId(c.charId)+'"><div class="tier-ring"></div></div><div class="picker-meta"><b>'+padId(c.charId)+' · '+t.name+'</b><span>Lv.'+c.level+' · '+g.name+' · '+fmt(cardIncome(c))+'/s</span></div>';
      const img=btn.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
      btn.addEventListener("click",()=>{state.placed[slot]=c.uid;toast("วาง "+padId(c.charId)+" ที่แท่น "+(slot+1));renderAll();renderStandModal()});
      grid.appendChild(btn);
    });
  }

  function togglePlace(uid){
    normalizeSlots();
    const existing=state.placed.indexOf(uid);
    if(existing>=0){state.placed[existing]=null;toast("นำการ์ดออกจากฐานแล้ว");renderAll();return}
    const empty=state.placed.findIndex(x=>!x);
    if(empty<0){toast("แท่นเต็มแล้ว");return}
    state.placed[empty]=uid;toast("วางการ์ดที่แท่น "+(empty+1));renderAll();
  }

  function levelUp(uid,fromModal=false){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    const cost=upgradeCost(c);if(state.money<cost){toast("เงินไม่พอ");return}
    state.money-=cost;c.level++;toast("อัปเป็น Lv."+c.level);renderAll();if(fromModal)renderStandModal();
  }
  function rerollGrade(uid,fromModal=false){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    const cost=rerollCost(c);if(state.money<cost){toast("เงินไม่พอ");return}
    state.money-=cost;const rolled=randomGrade();
    if(rolled>c.grade){c.grade=rolled;toast("Grade ใหม่: "+GRADES[rolled].name+" ✨")}else toast("ได้ "+GRADES[rolled].name+" · เก็บ Grade เดิมไว้");
    renderAll();if(fromModal)renderStandModal();
  }
  function toggleLock(uid){const c=state.cards.find(x=>x.uid===uid);if(!c)return;c.locked=!c.locked;renderAll()}
  function sellCard(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c||c.locked||state.placed.includes(uid))return;
    const value=sellValue(c);state.money+=value;state.cards=state.cards.filter(x=>x.uid!==uid);toast("ขายการ์ดแล้ว +"+fmt(value));renderAll();
  }

  function doRebirth(){
    if(state.baseLevel>=20)return;
    const cost=rebirthCost(),need=rebirthRequiredId();
    if(state.money<cost||!hasCharacter(need)){toast("ยังไม่ครบเงื่อนไข");return}
    state.money=0;state.baseLevel++;normalizeSlots();toast("Rebirth สำเร็จ! ฐาน Lv."+state.baseLevel);renderAll();
  }

  function economyTick(){
    const now=Date.now(),dt=Math.min(5,(now-state.lastTick)/1000);
    if(dt>0){state.money+=totalIncome()*dt;state.lastTick=now;renderHeader();renderRebirth();if(Math.random()<0.15)save()}
  }

  function bind(){
    $$(".tab").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".tab").forEach(x=>x.classList.remove("active"));$$(".panel").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");$("#panel-"+btn.dataset.tab).classList.add("active");if(btn.dataset.tab==="collection")renderCollection();
    }));
    $("#rollBtn").addEventListener("click",beginRoll);$("#autoBtn").addEventListener("click",toggleAuto);$("#packCard").addEventListener("click",openPack);
    $("#closeReveal").addEventListener("click",closeReveal);$("#closeStandModal").addEventListener("click",closeStand);$("[data-close-modal]").addEventListener("click",closeStand);
    $("#searchId").addEventListener("input",renderCollection);$("#sortCards").addEventListener("change",renderCollection);$("#rebirthBtn").addEventListener("click",doRebirth);
    $("#tierFilters").addEventListener("change",e=>{
      const input=e.target.closest("input[data-tier]");if(!input)return;
      const tier=Number(input.dataset.tier);
      if(input.checked&&!state.autoTargets.includes(tier))state.autoTargets.push(tier);
      if(!input.checked)state.autoTargets=state.autoTargets.filter(x=>x!==tier);
      renderFilters();save();
    });
    $("#clearFilters").addEventListener("click",()=>{state.autoTargets=[];if(state.autoRolling){state.autoRolling=false;clearTimeout(autoTimer)}renderFilters();save()});
    $("#selectUnlocked").addEventListener("click",()=>{state.autoTargets=Array.from({length:maxTierForLevel()},(_,i)=>i);renderFilters();save()});
    document.addEventListener("keydown",e=>{
      if(e.key==="1"&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)&&!state.autoRolling)beginRoll();
      if(e.key==="Escape"){closeReveal();closeStand()}
    });
    window.addEventListener("beforeunload",save);
  }

  function init(){
    normalizeSlots();bind();
    const now=Date.now(),offlineSeconds=Math.min(8*3600,Math.max(0,(now-(state.lastTick||now))/1000));
    if(offlineSeconds>2&&state.placed.some(Boolean)){const gain=totalIncome()*offlineSeconds;state.money+=gain;toast("รับรายได้ออฟไลน์ "+fmt(gain))}
    state.lastTick=now;renderAll();
    if(state.rollingUntil>Date.now())tickRoll();
    else if(state.rollingUntil&&!state.currentPack){state.rollingUntil=0;state.currentPack={tier:randomTier()};renderAll()}
    setInterval(economyTick,1000);
  }

  init();
})();