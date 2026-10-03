(() => {
  "use strict";

  const SAVE_KEY = "card-base-prototype-v01";
  const CARD_MIN_ID = 1;
  const CARD_MAX_ID = 20;
  const ROLL_MS = 3500;
  const SUPABASE_URL = "https://qlaykelpabbjojpqjfwi.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_KBWwFJ2v26lLH8UVoNIZ9Q_MtWguO29";
  const CLOUD_TABLE = "card_base_saves";
  const GRADE_ROLL_MS = 450;

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

  const GRADE_REROLL_COSTS = [1000,2000,3000,5500,10000,18000,32000,60000,110000,200000];

  const TITLES = [
    "Rookie Collector","Card Scout","Pack Seeker","Card Hunter","Vault Keeper",
    "Elite Collector","Card Warden","Treasure Keeper","Renowned Collector","Hall Master",
    "Card Baron","Vault Lord","Collection Master","Grand Collector","Card Duke",
    "Legend Keeper","Collector King","Card Emperor","Legend Sovereign","Grand Sovereign"
  ];
  const STANDS = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30];
  const REBIRTH_CARD_LEVELS = [3,5,8,12,16,21,27,34,42,51,61,72,84,97,111,126,142,159,177];

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const newState = () => ({
    money:0, baseLevel:1, cards:[], placed:[],
    currentPack:null, rollingUntil:0, lastTick:Date.now(), uidCounter:1,
    autoTargets:[], autoRolling:false, fullAuto:false, targetFound:false,
    storedPacks:[], packUidCounter:1, gradeAuto:null
  });

  let state = load();
  let activeStand = null;
  let rollFrame = 0;
  let autoTimer = 0;
  let gradeTimer = 0;
  let gradeAutoSetupUid = null;
  let supabaseClient = null;
  let authSession = null;
  let cloudReady = false;
  let cloudLoading = false;
  let cloudTimer = 0;
  let activeCloudUserId = null;
  let onlineProfile = null;
  let onlineHeartbeatTimer = 0;
  let onlineCache = {online:[],friendships:[],profiles:new Map(),bases:new Map()};
  let socialProfiles = new Map();
  let authRequestBusy = false;
  let signupCooldownUntil = 0;
  let signupCooldownTimer = 0;

  function hydrateState(parsed){
    const s={...newState(),...(parsed||{})};
    s.cards=(Array.isArray(s.cards)?s.cards:[]).filter(c=>Number.isInteger(c.charId)&&c.charId>=CARD_MIN_ID&&c.charId<=CARD_MAX_ID);
    s.autoTargets=(Array.isArray(s.autoTargets)?s.autoTargets:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<10);
    s.storedPacks=(Array.isArray(s.storedPacks)?s.storedPacks:[]).filter(p=>p&&Number.isInteger(p.tier)&&p.tier>=0&&p.tier<10);
    s.autoRolling=false;
    s.fullAuto=false;
    s.targetFound=false;
    s.gradeAuto=null;
    s.rollingUntil=0;
    const valid=new Set(s.cards.map(c=>c.uid));
    const old=Array.isArray(s.placed)?s.placed:[];
    s.placed=old.map(uid=>valid.has(uid)?uid:null);
    s.uidCounter=Math.max(Number(s.uidCounter)||1,...s.cards.map(c=>(Number(c.uid)||0)+1));
    s.packUidCounter=Math.max(Number(s.packUidCounter)||1,...s.storedPacks.map(p=>(Number(p.uid)||0)+1));
    return s;
  }

  function load(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw) return newState();
      return hydrateState(JSON.parse(raw));
    }catch{
      return newState();
    }
  }

  function cloudPayload(){
    return {...state,autoRolling:false,fullAuto:false,targetFound:false,gradeAuto:null,rollingUntil:0};
  }

  function scheduleCloudSave(){
    if(!cloudReady||cloudLoading||!authSession||!supabaseClient)return;
    clearTimeout(cloudTimer);
    cloudTimer=setTimeout(()=>flushCloudSave(),900);
    updateSyncUi("syncing");
  }

  async function flushCloudSave(){
    if(!cloudReady||cloudLoading||!authSession||!supabaseClient)return;
    clearTimeout(cloudTimer);
    const snapshot=JSON.parse(JSON.stringify(cloudPayload()));
    const {error}=await supabaseClient.from(CLOUD_TABLE).upsert({
      user_id:authSession.user.id,
      state:snapshot,
      updated_at:new Date().toISOString()
    },{onConflict:"user_id"});
    if(error){
      console.error("Cloud save failed",error);
      updateSyncUi("error");
      return;
    }
    updateSyncUi("online");
    publishPublicBase();
  }

  function save(){
    localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    scheduleCloudSave();
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
  function formatDuration(sec){const m=Math.floor(sec/60),s=Math.round(sec%60);return m?m+" นาที "+(s?s+" วิ":""):s+" วิ"}
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

  function cardIntrinsicIncome(card){
    const tier=TIERS[card.tier],grade=GRADES[card.grade];
    const levelMulti=Math.pow(1.04,Math.max(0,card.level-1));
    return charBaseIncome(card.charId)*tier.multi*grade.multi*levelMulti;
  }

  function cardIncome(card){
    return cardIntrinsicIncome(card)*baseIncomeMultiplier();
  }

  function totalIncome(){
    normalizeSlots();
    return state.placed.reduce((sum,uid)=>{
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      return sum+(c?cardIncome(c):0);
    },0);
  }

  function upgradeCost(card){
    const income=cardIntrinsicIncome(card);
    const seconds=6+Math.min(24,card.level*0.12);
    return roundUpNice(Math.min(income*seconds,Number.MAX_SAFE_INTEGER));
  }

  function rerollCost(card){
    return GRADE_REROLL_COSTS[card.tier]||GRADE_REROLL_COSTS[0];
  }

  function sellValue(card){
    const income=cardIntrinsicIncome(card);
    return roundUpNice(income*(4+Math.min(20,card.level*0.14)));
  }

  function roundUpNice(value){
    if(!Number.isFinite(value)||value<=0)return 0;
    const power=Math.max(0,Math.floor(Math.log10(value))-2);
    const step=Math.pow(10,power);
    return Math.ceil(value/step)*step;
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
  function expectedTierMultiplier(level){
    const odds=tierOdds(level);
    return odds.reduce((sum,p,i)=>sum+p*TIERS[i].multi,0);
  }

  function rebirthRequiredLevel(level=state.baseLevel){
    return REBIRTH_CARD_LEVELS[Math.min(REBIRTH_CARD_LEVELS.length-1,Math.max(0,level-1))];
  }

  function rebirthTargetSeconds(level=state.baseLevel){
    return 55+11*Math.max(0,level-1);
  }

  function rebirthCost(level=state.baseLevel){
    const avgCharacterIncome=545;
    const reqLevel=rebirthRequiredLevel(level);
    const assumedLevel=Math.max(1,Math.round(reqLevel*0.35));
    const expectedCardIncome=
      avgCharacterIncome*
      expectedTierMultiplier(level)*
      Math.pow(1.04,assumedLevel-1)*
      baseIncomeMultiplier(level);
    const expectedBaseIncome=expectedCardIncome*standLimit(level);
    return roundUpNice(expectedBaseIncome*rebirthTargetSeconds(level));
  }

  function rebirthRequiredId(level=state.baseLevel){return ((level*7+3)%20)+1}

  function bestRequiredCard(id){
    return state.cards.filter(c=>c.charId===id).sort((a,b)=>b.level-a.level)[0]||null;
  }

  function hasRequiredCard(id,level){
    const card=bestRequiredCard(id);
    return !!card&&card.level>=level;
  }

  function updateSyncUi(mode="local"){
    const dot=$("#syncDot"),label=$("#accountLabel"),sync=$("#syncLabel");
    if(!dot||!label||!sync)return;
    dot.className="sync-dot";
    if(!authSession){
      label.textContent="เล่นแบบ Local";
      sync.textContent="ล็อกอินเพื่อใช้ Cloud Save";
      return;
    }
    label.textContent=authSession.user.email||"Player";
    if(mode==="syncing"){dot.classList.add("syncing");sync.textContent="กำลังซิงก์…"}
    else if(mode==="error"){dot.classList.add("error");sync.textContent="Cloud มีปัญหา · เก็บ Local ไว้ก่อน"}
    else{dot.classList.add("online");sync.textContent="Cloud Save พร้อมใช้งาน"}
  }

  function setAuthMessage(message,type=""){
    const el=$("#authMessage");if(!el)return;
    el.textContent=message||"";
    el.className="auth-message"+(type?" "+type:"");
  }

  function renderAuth(){
    const signedIn=!!authSession;
    $("#authSignedOut").hidden=signedIn;
    $("#authSignedIn").hidden=!signedIn;
    if(signedIn)$("#authUserEmail").textContent=authSession.user.email||"Player";
    updateSyncUi(signedIn?(cloudReady?"online":"syncing"):"local");
  }

  function openAuth(){
    renderAuth();
    $("#authModal").classList.add("show");
    $("#authModal").setAttribute("aria-hidden","false");
  }

  function closeAuth(){
    $("#authModal").classList.remove("show");
    $("#authModal").setAttribute("aria-hidden","true");
  }

  async function loadCloudState(){
    if(!authSession||!supabaseClient)return;
    cloudLoading=true;cloudReady=false;updateSyncUi("syncing");
    const userId=authSession.user.id;
    const {data,error}=await supabaseClient.from(CLOUD_TABLE)
      .select("state,updated_at")
      .eq("user_id",userId)
      .maybeSingle();

    if(error){
      console.error("Cloud load failed",error);
      cloudLoading=false;updateSyncUi("error");return;
    }

    if(data&&data.state){
      state=hydrateState(data.state);
      const now=Date.now();
      const offlineSeconds=Math.max(0,(now-(state.lastTick||now))/1000);
      normalizeSlots();
      if(offlineSeconds>2&&state.placed.some(Boolean)){
        state.money+=totalIncome()*offlineSeconds;
      }
      state.lastTick=now;
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    }

    cloudLoading=false;cloudReady=true;activeCloudUserId=userId;
    if(!data)await flushCloudSave();
    renderAll();
    updateSyncUi("online");
  }

  async function handleAuthSession(session){
    const previous=activeCloudUserId;
    authSession=session||null;
    renderAuth();
    if(!authSession){
      cloudReady=false;activeCloudUserId=null;onlineProfile=null;renderOnlineShell();return;
    }
    if(previous!==authSession.user.id||!cloudReady)await loadCloudState();
    await ensureOnlineProfile();
    await heartbeatOnline();
    await publishPublicBase();
    renderOnlineShell();
  }

  async function initCloud(){
    if(!window.supabase||typeof window.supabase.createClient!=="function"){
      updateSyncUi("error");
      return;
    }
    supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    const {data:{session},error}=await supabaseClient.auth.getSession();
    if(error)console.error("Session read failed",error);
    await handleAuthSession(session);
    supabaseClient.auth.onAuthStateChange((_event,nextSession)=>{
      Promise.resolve().then(()=>handleAuthSession(nextSession));
    });
  }

  function authErrorMessage(error,context="login"){
    const code=error?.code||"";
    const msg=String(error?.message||"").toLowerCase();
    if(code==="over_email_send_rate_limit"||msg.includes("email rate limit")){
      return "ระบบส่งอีเมลยืนยันถึงขีดจำกัดชั่วคราว กรุณารอสักพักก่อนลองใหม่ หากเคยสมัครแล้วให้เช็กอีเมลยืนยันเดิมและใช้ปุ่มเข้าสู่ระบบ ไม่ต้องกดสร้างบัญชีซ้ำ";
    }
    if(code==="email_not_confirmed"||msg.includes("email not confirmed")){
      return "อีเมลนี้สมัครแล้ว แต่ยังไม่ได้ยืนยันค่ะ กรุณาเปิดอีเมลยืนยันที่ได้รับก่อน แล้วกลับมาเข้าสู่ระบบ";
    }
    if(msg.includes("invalid login credentials")){
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    }
    if(msg.includes("user already registered")||msg.includes("already registered")){
      return "อีเมลนี้มีบัญชีแล้วค่ะ ใช้ปุ่มเข้าสู่ระบบได้เลย";
    }
    if(msg.includes("email address")&&msg.includes("invalid")){
      return "อีเมลนี้ไม่ถูกต้องหรือผู้ให้บริการไม่ยอมรับ กรุณาตรวจสอบอีเมลอีกครั้ง";
    }
    if(msg.includes("password")&&msg.includes("weak")){
      return "รหัสผ่านยังไม่แข็งแรงพอ กรุณาใช้รหัสผ่านที่ยาวและคาดเดายากขึ้น";
    }
    return context==="signup"
      ?"สมัครบัญชีไม่สำเร็จชั่วคราว กรุณาลองใหม่อีกครั้ง"
      :"เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่";
  }

  function setAuthBusy(busy){
    authRequestBusy=busy;
    $("#loginBtn").disabled=busy;
    $("#signupBtn").disabled=busy||Date.now()<signupCooldownUntil;
  }

  function startSignupCooldown(seconds=60){
    signupCooldownUntil=Math.max(signupCooldownUntil,Date.now()+seconds*1000);
    clearInterval(signupCooldownTimer);
    const update=()=>{
      const left=Math.max(0,Math.ceil((signupCooldownUntil-Date.now())/1000));
      const btn=$("#signupBtn");
      if(left>0){
        btn.disabled=true;
        btn.textContent="สร้างบัญชีอีกครั้งใน "+left+" วิ";
      }else{
        clearInterval(signupCooldownTimer);
        btn.disabled=authRequestBusy;
        btn.textContent="สร้างบัญชี";
      }
    };
    update();
    signupCooldownTimer=setInterval(update,1000);
  }

  async function loginAccount(){
    if(authRequestBusy)return;
    if(!supabaseClient){setAuthMessage("Cloud ยังไม่พร้อม ลองรีเฟรชหน้าเว็บ","error");return}
    const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
    if(!email||!password){setAuthMessage("กรอกอีเมลและรหัสผ่านก่อนนะ","error");return}
    setAuthBusy(true);
    setAuthMessage("กำลังเข้าสู่ระบบ…");
    try{
      const {error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error){setAuthMessage(authErrorMessage(error,"login"),"error");return}
      setAuthMessage("เข้าสู่ระบบสำเร็จ ✓","ok");
    }finally{
      setAuthBusy(false);
    }
  }

  async function signupAccount(){
    if(authRequestBusy)return;
    if(Date.now()<signupCooldownUntil){
      const left=Math.ceil((signupCooldownUntil-Date.now())/1000);
      setAuthMessage("กรุณารอ "+left+" วินาทีก่อนส่งคำขอสมัครอีกครั้ง","error");
      return;
    }
    if(!supabaseClient){setAuthMessage("Cloud ยังไม่พร้อม ลองรีเฟรชหน้าเว็บ","error");return}
    const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
    if(!email||password.length<6){setAuthMessage("กรอกอีเมล และรหัสผ่านอย่างน้อย 6 ตัวอักษร","error");return}
    setAuthBusy(true);
    startSignupCooldown(60);
    setAuthMessage("กำลังสร้างบัญชี… กรุณากดเพียงครั้งเดียว");
    try{
      const redirectTo=window.location.origin+window.location.pathname;
      const {data,error}=await supabaseClient.auth.signUp({
        email,password,
        options:{emailRedirectTo:redirectTo}
      });
      if(error){
        setAuthMessage(authErrorMessage(error,"signup"),"error");
        return;
      }
      if(data.session){
        setAuthMessage("สร้างบัญชีและเข้าสู่ระบบแล้ว ✓","ok");
      }else{
        setAuthMessage("ส่งอีเมลยืนยันแล้ว ✓ กรุณาเช็ก Inbox/Spam แล้วกดลิงก์ยืนยันก่อนเข้าสู่ระบบ อย่ากดสร้างบัญชีซ้ำ","ok");
      }
    }finally{
      setAuthBusy(false);
    }
  }

  async function logoutAccount(){
    if(!supabaseClient)return;
    await flushCloudSave();
    if(authSession){
      const oldSeen=new Date(Date.now()-5*60*1000).toISOString();
      await supabaseClient.from("card_base_profiles").update({last_seen:oldSeen,updated_at:new Date().toISOString()}).eq("user_id",authSession.user.id);
    }
    const {error}=await supabaseClient.auth.signOut();
    if(error){setAuthMessage(error.message,"error");return}
    authSession=null;cloudReady=false;activeCloudUserId=null;
    renderAuth();closeAuth();toast("ออกจากระบบแล้ว · เล่น Local ต่อได้");
  }


  function escapeHtml(value){
    return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function publicStandSnapshot(){
    normalizeSlots();
    return state.placed.map((uid,slot)=>{
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      if(!c)return null;
      return {
        slot,
        charId:c.charId,
        tier:c.tier,
        grade:c.grade,
        level:c.level,
        income:Math.round(cardIncome(c))
      };
    }).filter(Boolean);
  }

  async function publishPublicBase(){
    if(!authSession||!supabaseClient)return;
    const payload={
      user_id:authSession.user.id,
      base_level:state.baseLevel,
      title:TITLES[state.baseLevel-1]||"Collector",
      stands:publicStandSnapshot(),
      updated_at:new Date().toISOString()
    };
    const {error}=await supabaseClient.from("card_base_public_bases").upsert(payload,{onConflict:"user_id"});
    if(error)console.error("Public base publish failed",error);
  }

  async function ensureOnlineProfile(){
    if(!authSession||!supabaseClient)return null;
    const uid=authSession.user.id;
    let {data,error}=await supabaseClient.from("card_base_profiles")
      .select("user_id,player_code,display_name,last_seen")
      .eq("user_id",uid).maybeSingle();
    if(error){console.error("Profile load failed",error);return null}
    if(!data){
      const created=await supabaseClient.from("card_base_profiles")
        .insert({user_id:uid})
        .select("user_id,player_code,display_name,last_seen").single();
      if(created.error){console.error("Profile create failed",created.error);return null}
      data=created.data;
    }
    if(data.display_name==="Player"){
      const generated="Player-"+String(data.player_code||"0000").slice(0,4);
      const renamed=await supabaseClient.from("card_base_profiles")
        .update({display_name:generated,updated_at:new Date().toISOString()})
        .eq("user_id",uid)
        .select("user_id,player_code,display_name,last_seen").single();
      if(!renamed.error)data=renamed.data;
    }
    onlineProfile=data;
    socialProfiles.set(data.user_id,data);
    renderOnlineShell();
    return data;
  }

  async function heartbeatOnline(){
    if(!authSession||!supabaseClient)return;
    if(!onlineProfile)await ensureOnlineProfile();
    if(!onlineProfile)return;
    const now=new Date().toISOString();
    const {error}=await supabaseClient.from("card_base_profiles")
      .update({last_seen:now,updated_at:now})
      .eq("user_id",authSession.user.id);
    if(!error)onlineProfile.last_seen=now;
  }

  function renderOnlineShell(){
    const gate=$("#onlineGate"),content=$("#onlineContent");
    if(!gate||!content)return;
    const signedIn=!!authSession;
    gate.hidden=signedIn;
    content.hidden=!signedIn;
    if(!signedIn)return;
    $("#onlineBaseLevel").textContent="Lv."+state.baseLevel;
    if(onlineProfile){
      $("#onlineDisplayName").value=onlineProfile.display_name||"";
      $("#onlinePlayerCode").textContent="#"+(onlineProfile.player_code||"—");
    }
  }

  function friendshipFor(userId){
    return onlineCache.friendships.find(f=>f.requester_id===userId||f.addressee_id===userId)||null;
  }

  function socialRow(profile,options={}){
    if(!profile)return '<div class="social-empty">ไม่พบข้อมูลผู้เล่น</div>';
    socialProfiles.set(profile.user_id,profile);
    const base=onlineCache.bases.get(profile.user_id);
    const relation=friendshipFor(profile.user_id);
    let actions='<button data-social-action="visit" data-user="'+profile.user_id+'">ดูฐาน</button>';
    if(options.request){
      actions+='<button class="accept" data-social-action="accept" data-friend="'+options.request.id+'">รับเพื่อน</button>'+
               '<button class="remove" data-social-action="remove" data-friend="'+options.request.id+'">ปฏิเสธ</button>';
    }else if(options.friend){
      actions+='<button class="remove" data-social-action="remove" data-friend="'+options.friend.id+'">ลบเพื่อน</button>';
    }else if(relation){
      const text=relation.status==="accepted"?"เพื่อนแล้ว":(relation.requester_id===authSession.user.id?"ส่งคำขอแล้ว":"มีคำขอเข้า");
      actions+='<button disabled>'+text+'</button>';
    }else{
      actions+='<button data-social-action="add" data-user="'+profile.user_id+'">+ เพื่อน</button>';
    }
    return '<div class="player-row"><div class="player-main"><strong>'+escapeHtml(profile.display_name)+'</strong>'+
      '<small>#'+escapeHtml(profile.player_code)+' · '+(base?'Base Lv.'+base.base_level:'ยังไม่เผยแพร่ฐาน')+'</small></div>'+
      '<div class="player-actions">'+actions+'</div></div>';
  }

  function renderOnlineLists(){
    if(!authSession)return;
    const onlineEl=$("#onlinePlayersList"),requestsEl=$("#friendRequestsList"),friendsEl=$("#friendsList");
    if(!onlineEl||!requestsEl||!friendsEl)return;

    onlineEl.innerHTML=onlineCache.online.length
      ? onlineCache.online.map(p=>socialRow(p)).join("")
      : '<div class="social-empty">ยังไม่มีผู้เล่นอื่นออนไลน์ในตอนนี้</div>';

    const uid=authSession.user.id;
    const requests=onlineCache.friendships.filter(f=>f.status==="pending"&&f.addressee_id===uid);
    $("#requestCount").textContent=requests.length+" รายการ";
    requestsEl.innerHTML=requests.length
      ? requests.map(f=>socialRow(onlineCache.profiles.get(f.requester_id),{request:f})).join("")
      : '<div class="social-empty">ไม่มีคำขอใหม่</div>';

    const friends=onlineCache.friendships.filter(f=>f.status==="accepted");
    $("#friendCount").textContent=friends.length+" คน";
    friendsEl.innerHTML=friends.length
      ? friends.map(f=>{
          const other=f.requester_id===uid?f.addressee_id:f.requester_id;
          return socialRow(onlineCache.profiles.get(other),{friend:f});
        }).join("")
      : '<div class="social-empty">ยังไม่มีเพื่อน — ลองค้นหาผู้เล่นด้านบน</div>';
  }

  async function refreshOnline(){
    renderOnlineShell();
    if(!authSession||!supabaseClient)return;
    await ensureOnlineProfile();
    await heartbeatOnline();
    await publishPublicBase();

    const uid=authSession.user.id;
    const cutoff=new Date(Date.now()-120000).toISOString();

    const [onlineRes,friendsRes]=await Promise.all([
      supabaseClient.from("card_base_profiles")
        .select("user_id,player_code,display_name,last_seen")
        .gte("last_seen",cutoff).neq("user_id",uid)
        .order("last_seen",{ascending:false}).limit(20),
      supabaseClient.from("card_base_friendships")
        .select("id,requester_id,addressee_id,status,created_at,updated_at")
        .or("requester_id.eq."+uid+",addressee_id.eq."+uid)
        .order("updated_at",{ascending:false})
    ]);

    if(onlineRes.error)console.error("Online players load failed",onlineRes.error);
    if(friendsRes.error)console.error("Friends load failed",friendsRes.error);

    const online=onlineRes.data||[];
    const friendships=friendsRes.data||[];
    const ids=new Set(online.map(p=>p.user_id));
    friendships.forEach(fr=>ids.add(fr.requester_id===uid?fr.addressee_id:fr.requester_id));

    let profiles=[];
    let bases=[];
    const idList=[...ids];
    if(idList.length){
      const [profileRes,baseRes]=await Promise.all([
        supabaseClient.from("card_base_profiles")
          .select("user_id,player_code,display_name,last_seen").in("user_id",idList),
        supabaseClient.from("card_base_public_bases")
          .select("user_id,base_level,title,updated_at").in("user_id",idList)
      ]);
      if(!profileRes.error)profiles=profileRes.data||[];
      if(!baseRes.error)bases=baseRes.data||[];
    }

    const profileMap=new Map();
    [...online,...profiles].forEach(p=>{profileMap.set(p.user_id,p);socialProfiles.set(p.user_id,p)});
    onlineCache={
      online,
      friendships,
      profiles:profileMap,
      bases:new Map(bases.map(b=>[b.user_id,b]))
    };
    renderOnlineLists();
  }

  async function saveOnlineName(){
    if(!authSession||!supabaseClient)return;
    const name=$("#onlineDisplayName").value.trim();
    if(name.length<2||name.length>20){toast("ชื่อผู้เล่นต้องยาว 2–20 ตัวอักษร");return}
    const {data,error}=await supabaseClient.from("card_base_profiles")
      .update({display_name:name,updated_at:new Date().toISOString()})
      .eq("user_id",authSession.user.id)
      .select("user_id,player_code,display_name,last_seen").single();
    if(error){toast("บันทึกชื่อไม่สำเร็จ");console.error(error);return}
    onlineProfile=data;socialProfiles.set(data.user_id,data);toast("เปลี่ยนชื่อเป็น "+name+" แล้ว");
    await refreshOnline();
  }

  async function searchPlayers(){
    if(!authSession||!supabaseClient)return;
    const q=$("#playerSearchInput").value.trim();
    const out=$("#playerSearchResults");
    if(!q){out.innerHTML="";return}
    const code=q.replace(/^#/,"").toUpperCase();
    const [nameRes,codeRes]=await Promise.all([
      supabaseClient.from("card_base_profiles")
        .select("user_id,player_code,display_name,last_seen")
        .ilike("display_name","%"+q+"%").neq("user_id",authSession.user.id).limit(10),
      supabaseClient.from("card_base_profiles")
        .select("user_id,player_code,display_name,last_seen")
        .eq("player_code",code).neq("user_id",authSession.user.id).limit(3)
    ]);
    const merged=new Map();
    [...(nameRes.data||[]),...(codeRes.data||[])].forEach(p=>{merged.set(p.user_id,p);socialProfiles.set(p.user_id,p)});
    const list=[...merged.values()];
    if(list.length){
      const br=await supabaseClient.from("card_base_public_bases").select("user_id,base_level,title,updated_at").in("user_id",list.map(p=>p.user_id));
      (br.data||[]).forEach(b=>onlineCache.bases.set(b.user_id,b));
    }
    out.innerHTML=list.length?list.map(p=>socialRow(p)).join(""):'<div class="social-empty">ไม่พบผู้เล่น</div>';
  }

  async function sendFriendRequest(userId){
    if(!authSession||!supabaseClient||userId===authSession.user.id)return;
    const {error}=await supabaseClient.from("card_base_friendships").insert({
      requester_id:authSession.user.id,
      addressee_id:userId,
      status:"pending"
    });
    if(error){
      toast(error.code==="23505"?"มีคำขอหรือเป็นเพื่อนกันอยู่แล้ว":"ส่งคำขอไม่สำเร็จ");
      console.error(error);return;
    }
    toast("ส่งคำขอเป็นเพื่อนแล้ว");
    await refreshOnline();
  }

  async function acceptFriend(friendshipId){
    const {error}=await supabaseClient.from("card_base_friendships")
      .update({status:"accepted",updated_at:new Date().toISOString()})
      .eq("id",friendshipId);
    if(error){toast("รับเพื่อนไม่สำเร็จ");console.error(error);return}
    toast("เป็นเพื่อนกันแล้ว 🎉");await refreshOnline();
  }

  async function removeFriend(friendshipId){
    const {error}=await supabaseClient.from("card_base_friendships").delete().eq("id",friendshipId);
    if(error){toast("ดำเนินการไม่สำเร็จ");console.error(error);return}
    toast("อัปเดตรายชื่อเพื่อนแล้ว");await refreshOnline();
  }

  async function visitPlayerBase(userId){
    if(!authSession||!supabaseClient)return;
    const profile=socialProfiles.get(userId)||onlineCache.profiles.get(userId);
    $("#socialBaseName").textContent=(profile?profile.display_name:"Player")+"'s Base";
    $("#socialBaseMeta").textContent="กำลังโหลด…";
    $("#socialBaseStands").innerHTML="";
    $("#socialBaseModal").classList.add("show");
    $("#socialBaseModal").setAttribute("aria-hidden","false");

    const {data,error}=await supabaseClient.from("card_base_public_bases")
      .select("user_id,base_level,title,stands,updated_at")
      .eq("user_id",userId).maybeSingle();
    if(error||!data){
      $("#socialBaseMeta").textContent="ผู้เล่นคนนี้ยังไม่ได้เผยแพร่ฐาน";
      $("#socialBaseStands").innerHTML='<div class="social-empty">ยังไม่มีข้อมูลฐาน</div>';
      return;
    }
    $("#socialBaseMeta").textContent="Base Lv."+data.base_level+" · "+data.title;
    const max=STANDS[data.base_level-1]||30;
    const bySlot=new Map((Array.isArray(data.stands)?data.stands:[]).map(x=>[x.slot,x]));
    const wrap=$("#socialBaseStands");
    let html="";
    for(let i=0;i<max;i++){
      const c=bySlot.get(i);
      if(!c){html+='<div class="visitor-stand empty"><span>แท่น '+(i+1)+'</span></div>';continue}
      const t=TIERS[c.tier]||TIERS[0],g=GRADES[c.grade]||GRADES[0];
      html+='<div class="visitor-stand" style="--tier:'+t.color+'"><div class="visitor-card">'+
        '<img src="'+imageFor(c.charId)+'" alt="'+padId(c.charId)+'"><div class="tier-ring"></div>'+
        '<div class="stand-grade grade-'+c.grade+'" style="--grade:'+g.color+'">'+g.name+'</div>'+
        '<div class="visitor-meta"><b>'+padId(c.charId)+' · '+t.name+'</b><span>Lv.'+c.level+' · '+fmt(c.income||0)+'/s</span></div>'+
        '</div></div>';
    }
    wrap.innerHTML=html;
    wrap.querySelectorAll("img").forEach(img=>img.addEventListener("error",e=>e.currentTarget.style.display="none"));
  }

  function closeSocialBase(){
    $("#socialBaseModal").classList.remove("show");
    $("#socialBaseModal").setAttribute("aria-hidden","true");
  }

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
            '<div class="stand-grade grade-'+c.grade+'" style="--grade:'+g.color+'">'+g.name+'</div>'+
            '<div class="mini-meta"><b>'+padId(c.charId)+' · '+t.name+'</b><span>Lv.'+c.level+' · '+fmt(cardIncome(c))+'/s</span></div>'+
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
    $("#autoBtn").textContent=state.autoRolling?"หยุด Auto":"Auto · หยุดเมื่อเจอ";
    $("#fullAutoBtn").classList.toggle("on",state.fullAuto);
    $("#fullAutoBtn").textContent=state.fullAuto?"หยุด Full Auto":"Full Auto";
    const active=state.autoRolling||state.fullAuto;
    $("#autoStatus").className="auto-status"+(active?" on":"");
    $("#autoStatus").textContent=state.fullAuto
      ?"Full Auto · เก็บซองเป้าหมายแล้วสุ่มต่อ: "+state.autoTargets.map(i=>TIERS[i].name).join(", ")
      :state.autoRolling
        ?"Auto · หยุดเมื่อเจอ: "+state.autoTargets.map(i=>TIERS[i].name).join(", ")
        :"Auto Roll ปิดอยู่";
  }

  function renderPack(){
    const p=state.currentPack,card=$("#packCard");
    if(!p){
      card.className="pack-card empty";
      card.style.removeProperty("--pack");
      $("#packTier").textContent="NO PACK";
      $("#packHint").textContent=state.fullAuto?"Full Auto กำลังสุ่มและเก็บซองเป้าหมาย…":state.autoRolling?"Auto Roll กำลังทำงาน…":"กดสุ่มซองก่อน";
      return;
    }
    const t=TIERS[p.tier];
    card.className="pack-card sparkle"+(state.targetFound?" found":"");
    card.style.setProperty("--pack",t.color);
    $("#packTier").textContent=t.name.toUpperCase();
    $("#packHint").textContent="คลิกเพื่อเปิด · การ์ดด้านในเป็น "+t.name+" แน่นอน";
  }

  function renderStoredPacks(){
    const count=state.storedPacks.length;
    $("#storedPackCount").textContent=count+" ซอง";
    const wrap=$("#storedPacks");
    if(!count){
      wrap.innerHTML='<div class="social-empty">ยังไม่มีซองที่เก็บไว้</div>';
      return;
    }
    const groups=new Map();
    state.storedPacks.forEach(p=>groups.set(p.tier,(groups.get(p.tier)||0)+1));
    wrap.innerHTML=[...groups.entries()].sort((a,b)=>b[0]-a[0]).map(([tier,n])=>{
      const t=TIERS[tier];
      return '<div class="stored-pack-row" style="--tier:'+t.color+'">'+
        '<div class="stored-pack-main"><strong>'+t.name+'</strong><span>'+n+' ซอง</span></div>'+
        '<button data-open-stored-tier="'+tier+'">เปิด 1 ซอง</button></div>';
    }).join("");
  }

  function storePack(tier,obtainedAt=Date.now()){
    state.storedPacks.push({uid:state.packUidCounter++,tier,obtainedAt});
  }

  function openStoredPack(tier){
    const idx=state.storedPacks.findIndex(p=>p.tier===tier);
    if(idx<0)return;
    const [pack]=state.storedPacks.splice(idx,1);
    const card=createCardFromTier(pack.tier);
    showReveal(card);
    renderAll();
  }

  function createCardFromTier(tier){
    const charId=CARD_MIN_ID+Math.floor(Math.random()*(CARD_MAX_ID-CARD_MIN_ID+1));
    const card={uid:state.uidCounter++,charId,tier,grade:0,level:1,locked:false,obtainedAt:Date.now()};
    state.cards.push(card);
    return card;
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
          '<button data-a="grade">สุ่ม Grade</button><button class="'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"grade-running":"")+'" data-a="grade-auto">'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"Auto Grade…":"Auto Grade")+'</button>'+
          '<button class="'+(c.locked?"locked":"")+'" data-a="lock">'+(c.locked?"🔒 ปลดล็อก":"🔓 ล็อก")+'</button>'+
          '<button class="sell" data-a="sell" '+((placed||c.locked)?"disabled":"")+'>ขาย '+fmt(sellValue(c))+'</button>'+
        '</div></div>';
      const img=el.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
      el.addEventListener("click",ev=>{
        const btn=ev.target.closest("button[data-a]");if(!btn)return;
        const a=btn.dataset.a;
        if(a==="place")togglePlace(c.uid);
        if(a==="level")levelUp(c.uid);
        if(a==="grade")rerollGrade(c.uid);
        if(a==="grade-auto")openGradeAuto(c.uid);
        if(a==="lock")toggleLock(c.uid);
        if(a==="sell")sellCard(c.uid);
      });
      wrap.appendChild(el);
    });
  }

  function renderRebirth(){
    if(state.baseLevel>=20){
      $("#rebirthHeadline").textContent="Lv.20 · MAX";$("#rebirthMoney").textContent="—";$("#rebirthCard").textContent="—";
      $("#rebirthOwned").textContent="ถึงระดับสูงสุดของ V1 แล้ว";const pace=$("#rebirthPace");if(pace)pace.textContent="—";$("#rebirthBtn").disabled=true;$("#nextTitle").textContent="MAX";
      $("#nextStands").textContent="30";$("#nextIncome").textContent="×"+baseIncomeMultiplier(20).toFixed(2);$("#nextLuck").textContent="×"+luckValue(20).toFixed(2);return;
    }
    const next=state.baseLevel+1,need=rebirthRequiredId(),needLevel=rebirthRequiredLevel(),cost=rebirthCost();
    const best=bestRequiredCard(need),has=hasRequiredCard(need,needLevel);
    $("#rebirthHeadline").textContent="Lv."+state.baseLevel+" → Lv."+next;$("#rebirthMoney").textContent=fmt(cost);
    $("#rebirthCard").textContent=padId(need)+" · Lv."+needLevel+"+";
    $("#rebirthOwned").textContent=best?(has?"Lv."+best.level+" ✓":"ดีที่สุด Lv."+best.level+" / ต้อง Lv."+needLevel):"ยังไม่มีการ์ด ID นี้";
    $("#rebirthOwned").style.color=has?"var(--ok)":"var(--danger)";
    const pace=$("#rebirthPace");if(pace)pace.textContent="~"+formatDuration(rebirthTargetSeconds());
    $("#rebirthBtn").disabled=!(state.money>=cost&&has);$("#nextTitle").textContent=TITLES[next-1];$("#nextStands").textContent=standLimit(next);
    $("#nextIncome").textContent="×"+baseIncomeMultiplier(next).toFixed(2);$("#nextLuck").textContent="×"+luckValue(next).toFixed(2);
  }

  function renderAll(){
    renderHeader();renderBase();renderPack();renderOdds();renderFilters();renderStoredPacks();renderCollection();renderRebirth();renderOnlineShell();save();
  }

  function rollTargetsReady(){
    const max=maxTierForLevel();
    state.autoTargets=state.autoTargets.filter(i=>i<max);
    if(!state.autoTargets.length){
      toast("ติ๊ก Tier ที่ต้องการอย่างน้อย 1 ระดับก่อน");
      return false;
    }
    return true;
  }

  function updateRollProgress(){
    if(!state.rollingUntil){
      $("#timerFill").style.width="100%";
      $("#timerText").textContent=state.targetFound?"เจอเป้าหมายแล้ว":"พร้อมสุ่ม";
      $("#rollBtn").disabled=false;
      return;
    }
    const remaining=Math.max(0,state.rollingUntil-Date.now());
    const p=Math.max(0,Math.min(1,1-(remaining/ROLL_MS)));
    $("#timerFill").style.width=(p*100)+"%";
    $("#timerText").textContent="กำลังสุ่ม… "+(remaining/1000).toFixed(1)+" วิ";
    $("#rollBtn").disabled=true;
  }

  function scheduleRollEngine(){
    clearTimeout(autoTimer);
    if(!state.rollingUntil)return;
    const remaining=Math.max(0,state.rollingUntil-Date.now());
    autoTimer=setTimeout(processRollEngine,Math.min(250,Math.max(20,remaining)));
  }

  function beginRoll(){
    if(Date.now()<state.rollingUntil)return;
    state.currentPack=null;
    state.targetFound=false;
    state.rollingUntil=Date.now()+ROLL_MS;
    renderPack();renderFilters();updateRollProgress();save();
    scheduleRollEngine();
  }

  function manualRoll(){
    if(state.autoRolling||state.fullAuto){
      state.autoRolling=false;state.fullAuto=false;
      clearTimeout(autoTimer);state.rollingUntil=0;
    }
    beginRoll();
  }

  function processRollEngine(){
    clearTimeout(autoTimer);
    if(!state.rollingUntil){updateRollProgress();return}
    const now=Date.now();
    if(now<state.rollingUntil){
      updateRollProgress();
      scheduleRollEngine();
      return;
    }

    let processed=0,storedHits=0,lastStoredTier=null;
    while(state.rollingUntil&&now>=state.rollingUntil&&processed<2000){
      const finishedAt=state.rollingUntil;
      const tier=randomTier();
      processed++;

      if(state.fullAuto){
        if(state.autoTargets.includes(tier)){
          storePack(tier,finishedAt);
          storedHits++;
          lastStoredTier=tier;
        }
        state.currentPack=null;
        state.targetFound=false;
        state.rollingUntil=finishedAt+ROLL_MS;
        continue;
      }

      if(state.autoRolling){
        if(state.autoTargets.includes(tier)){
          state.currentPack={tier};
          state.autoRolling=false;
          state.targetFound=true;
          state.rollingUntil=0;
          toast("เจอ "+TIERS[tier].name+" แล้ว! Auto หยุดให้แล้ว ✨",true);
          break;
        }
        state.currentPack=null;
        state.rollingUntil=finishedAt+ROLL_MS;
        continue;
      }

      state.currentPack={tier};
      state.rollingUntil=0;
      toast("ได้ซอง "+TIERS[tier].name+"!");
      break;
    }

    if(storedHits){
      toast("Full Auto เก็บ "+storedHits+" ซอง"+(lastStoredTier!==null?" · ล่าสุด "+TIERS[lastStoredTier].name:"")+" ✨",true);
    }

    renderPack();renderFilters();renderStoredPacks();updateRollProgress();save();

    if(state.rollingUntil){
      if(Date.now()>=state.rollingUntil)setTimeout(processRollEngine,0);
      else scheduleRollEngine();
    }
  }

  function tickRoll(){
    processRollEngine();
  }

  function toggleAuto(){
    if(state.autoRolling){
      state.autoRolling=false;state.rollingUntil=0;clearTimeout(autoTimer);
      toast("หยุด Auto Roll แล้ว");renderFilters();renderPack();updateRollProgress();save();return;
    }
    if(!rollTargetsReady())return;
    state.fullAuto=false;
    state.autoRolling=true;
    state.targetFound=false;
    if(state.currentPack&&state.autoTargets.includes(state.currentPack.tier)){
      state.autoRolling=false;state.targetFound=true;
      toast("ซองปัจจุบันตรงกับ Filter อยู่แล้ว ✨",true);
      renderAll();return;
    }
    state.currentPack=null;
    state.rollingUntil=0;
    renderFilters();save();beginRoll();
  }

  function toggleFullAuto(){
    if(state.fullAuto){
      state.fullAuto=false;state.rollingUntil=0;clearTimeout(autoTimer);
      toast("หยุด Full Auto แล้ว");renderFilters();renderPack();updateRollProgress();save();return;
    }
    if(!rollTargetsReady())return;
    state.autoRolling=false;
    state.fullAuto=true;
    state.targetFound=false;
    if(state.currentPack&&state.autoTargets.includes(state.currentPack.tier)){
      storePack(state.currentPack.tier);
      toast("เก็บซอง "+TIERS[state.currentPack.tier].name+" เข้าคลังแล้ว ✨",true);
    }
    state.currentPack=null;
    state.rollingUntil=0;
    renderFilters();renderStoredPacks();save();beginRoll();
  }

  function openPack(){
    if(!state.currentPack||Date.now()<state.rollingUntil)return;
    const tier=state.currentPack.tier;
    const card=createCardFromTier(tier);
    state.currentPack=null;state.targetFound=false;
    showReveal(card);renderAll();
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
      '<div class="stand-actions"><button data-modal-a="level">อัป Level</button><button data-modal-a="grade">สุ่ม Grade</button><button class="'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"grade-running":"")+'" data-modal-a="grade-auto">'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"Auto Grade…":"Auto Grade")+'</button><button data-modal-a="change">เปลี่ยนการ์ด</button><button class="remove" data-modal-a="remove">ถอดจากแท่น</button></div></div></div>';
    const img=body.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
    body.querySelector('[data-modal-a="level"]').addEventListener("click",()=>{levelUp(c.uid,true)});
    body.querySelector('[data-modal-a="grade"]').addEventListener("click",()=>{rerollGrade(c.uid,true)});
    body.querySelector('[data-modal-a="grade-auto"]').addEventListener("click",()=>{openGradeAuto(c.uid)});
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
    if(state.gradeAuto&&state.gradeAuto.uid===uid){toast("Auto Grade กำลังทำงานอยู่");return}
    const cost=rerollCost(c);
    if(state.money<cost){toast("เงินไม่พอ · ต้องใช้ "+fmt(cost));return}
    const ok=window.confirm(
      "สุ่ม Grade ใหม่ของ "+padId(c.charId)+" ใช้เงิน "+fmt(cost)+
      "\nGrade ปัจจุบัน: "+GRADES[c.grade].name+
      "\n\nผลใหม่จะเขียนทับ Grade เดิมทันที แม้จะต่ำลง ต้องการสุ่มต่อไหม?"
    );
    if(!ok)return;
    state.money-=cost;
    c.grade=randomGrade();
    toast("Grade ใหม่: "+GRADES[c.grade].name+(c.grade>=8?" ✨":""));
    renderAll();if(fromModal&&activeStand!==null)renderStandModal();
  }

  function openGradeAuto(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    if(state.gradeAuto&&state.gradeAuto.uid!==uid){
      toast("มี Auto Grade อีกใบกำลังทำงานอยู่ · หยุดใบนั้นก่อน");
      return;
    }
    gradeAutoSetupUid=uid;
    const g=GRADES[c.grade];
    $("#gradeAutoCardInfo").innerHTML='<strong>'+padId(c.charId)+' · '+TIERS[c.tier].name+'</strong>'+
      '<span>Grade ปัจจุบัน '+g.name+' · '+fmt(rerollCost(c))+' ต่อครั้ง</span>';
    $("#gradeTargetSelect").innerHTML=GRADES.map((x,i)=>'<option value="'+i+'">'+x.name+'</option>').join("");
    $("#gradeTargetSelect").value=String(Math.min(9,c.grade+1));
    $("#startGradeAutoBtn").hidden=!!state.gradeAuto;
    $("#stopGradeAutoBtn").hidden=!state.gradeAuto;
    $("#gradeAutoModal").classList.add("show");
    $("#gradeAutoModal").setAttribute("aria-hidden","false");
  }

  function closeGradeAuto(){
    $("#gradeAutoModal").classList.remove("show");
    $("#gradeAutoModal").setAttribute("aria-hidden","true");
    gradeAutoSetupUid=null;
  }

  function startGradeAuto(){
    const c=state.cards.find(x=>x.uid===gradeAutoSetupUid);if(!c)return;
    const target=Number($("#gradeTargetSelect").value);
    if(!Number.isInteger(target)||target<0||target>=GRADES.length)return;
    if(c.grade===target){toast("การ์ดใบนี้เป็น Grade "+GRADES[target].name+" อยู่แล้ว");return}
    const cost=rerollCost(c);
    const ok=window.confirm(
      "เริ่ม Auto Grade "+padId(c.charId)+" → "+GRADES[target].name+
      "\nค่าใช้จ่ายคงที่ "+fmt(cost)+" ต่อครั้ง"+
      "\n\nGrade จะเปลี่ยนทุกครั้ง แม้ต่ำลง และระบบจะสุ่มจนเจอเป้าหมายหรือเงินไม่พอ ต้องการเริ่มไหม?"
    );
    if(!ok)return;
    state.gradeAuto={uid:c.uid,target,nextAt:Date.now(),startedAt:Date.now()};
    closeGradeAuto();
    toast("เริ่ม Auto Grade → "+GRADES[target].name);
    save();
    processGradeAuto();
  }

  function stopGradeAuto(message="หยุด Auto Grade แล้ว"){
    if(!state.gradeAuto)return;
    state.gradeAuto=null;
    clearTimeout(gradeTimer);
    toast(message);
    renderAll();
    if(activeStand!==null)renderStandModal();
  }

  function processGradeAuto(){
    clearTimeout(gradeTimer);
    const job=state.gradeAuto;
    if(!job)return;
    accrueIncomeToNow();
    const c=state.cards.find(x=>x.uid===job.uid);
    if(!c){stopGradeAuto("ไม่พบการ์ด · Auto Grade หยุดแล้ว");return}
    if(c.grade===job.target){stopGradeAuto("ได้ Grade "+GRADES[c.grade].name+" แล้ว! ✨");return}

    const now=Date.now();
    let loops=0;
    while(state.gradeAuto&&now>=state.gradeAuto.nextAt&&loops<1000){
      const cost=rerollCost(c);
      if(state.money<cost){
        const latest=GRADES[c.grade].name;
        state.gradeAuto=null;
        toast("เงินไม่พอ · Auto Grade หยุดที่ "+latest);
        break;
      }
      state.money-=cost;
      c.grade=randomGrade();
      loops++;
      if(c.grade===job.target){
        state.gradeAuto=null;
        toast("Auto Grade สำเร็จ: "+GRADES[c.grade].name+" ✨",true);
        break;
      }
      job.nextAt+=GRADE_ROLL_MS;
    }

    renderAll();
    if(activeStand!==null&&state.placed[activeStand]===c.uid)renderStandModal();

    if(state.gradeAuto){
      const delay=Math.max(20,Math.min(250,state.gradeAuto.nextAt-Date.now()));
      gradeTimer=setTimeout(processGradeAuto,delay);
    }
  }

  function toggleLock(uid){const c=state.cards.find(x=>x.uid===uid);if(!c)return;c.locked=!c.locked;renderAll()}
  function sellCard(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c||c.locked||state.placed.includes(uid))return;
    const value=sellValue(c);state.money+=value;state.cards=state.cards.filter(x=>x.uid!==uid);toast("ขายการ์ดแล้ว +"+fmt(value));renderAll();
  }

  function doRebirth(){
    if(state.baseLevel>=20)return;
    const cost=rebirthCost(),need=rebirthRequiredId(),needLevel=rebirthRequiredLevel();
    if(state.money<cost||!hasRequiredCard(need,needLevel)){toast("ยังไม่ครบเงื่อนไขเงิน + ID + Level");return}
    state.money=0;state.baseLevel++;normalizeSlots();toast("Rebirth สำเร็จ! ฐาน Lv."+state.baseLevel);renderAll();
  }

  function accrueIncomeToNow(){
    const now=Date.now();
    const dt=Math.max(0,(now-(state.lastTick||now))/1000);
    if(dt>0){
      state.money+=totalIncome()*dt;
      state.lastTick=now;
    }
    return dt;
  }

  function economyTick(){
    if(accrueIncomeToNow()>0){
      renderHeader();renderRebirth();
      if(Math.random()<0.15)save();
    }
  }

  function bind(){
    $$(".tab").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".tab").forEach(x=>x.classList.remove("active"));$$(".panel").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");$("#panel-"+btn.dataset.tab).classList.add("active");
      if(btn.dataset.tab==="collection")renderCollection();
      if(btn.dataset.tab==="online")refreshOnline();
    }));
    $("#accountBtn").addEventListener("click",openAuth);
    $("#closeAuthModal").addEventListener("click",closeAuth);
    $("[data-close-auth]").addEventListener("click",closeAuth);
    $("#loginBtn").addEventListener("click",loginAccount);
    $("#signupBtn").addEventListener("click",signupAccount);
    $("#logoutBtn").addEventListener("click",logoutAccount);
    $("#authPassword").addEventListener("keydown",e=>{if(e.key==="Enter")loginAccount()});
    $("#onlineLoginBtn").addEventListener("click",openAuth);
    $("#refreshOnlineBtn").addEventListener("click",refreshOnline);
    $("#saveOnlineNameBtn").addEventListener("click",saveOnlineName);
    $("#playerSearchBtn").addEventListener("click",searchPlayers);
    $("#playerSearchInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchPlayers()});
    $("#closeSocialBaseModal").addEventListener("click",closeSocialBase);
    $("[data-close-social-base]").addEventListener("click",closeSocialBase);
    document.addEventListener("click",e=>{
      const btn=e.target.closest("[data-social-action]");if(!btn)return;
      const action=btn.dataset.socialAction;
      if(action==="visit")visitPlayerBase(btn.dataset.user);
      if(action==="add")sendFriendRequest(btn.dataset.user);
      if(action==="accept")acceptFriend(btn.dataset.friend);
      if(action==="remove")removeFriend(btn.dataset.friend);
    });
    $("#rollBtn").addEventListener("click",manualRoll);$("#autoBtn").addEventListener("click",toggleAuto);$("#fullAutoBtn").addEventListener("click",toggleFullAuto);$("#packCard").addEventListener("click",openPack);
    $("#storedPacks").addEventListener("click",e=>{const b=e.target.closest("[data-open-stored-tier]");if(b)openStoredPack(Number(b.dataset.openStoredTier))});
    $("#closeGradeAutoModal").addEventListener("click",closeGradeAuto);$("[data-close-grade-auto]").addEventListener("click",closeGradeAuto);
    $("#startGradeAutoBtn").addEventListener("click",startGradeAuto);$("#stopGradeAutoBtn").addEventListener("click",()=>stopGradeAuto());
    $("#closeReveal").addEventListener("click",closeReveal);$("#closeStandModal").addEventListener("click",closeStand);$("[data-close-modal]").addEventListener("click",closeStand);
    $("#searchId").addEventListener("input",renderCollection);$("#sortCards").addEventListener("change",renderCollection);$("#rebirthBtn").addEventListener("click",doRebirth);
    $("#tierFilters").addEventListener("change",e=>{
      const input=e.target.closest("input[data-tier]");if(!input)return;
      const tier=Number(input.dataset.tier);
      if(input.checked&&!state.autoTargets.includes(tier))state.autoTargets.push(tier);
      if(!input.checked)state.autoTargets=state.autoTargets.filter(x=>x!==tier);
      if(!state.autoTargets.length&&(state.autoRolling||state.fullAuto)){
        state.autoRolling=false;state.fullAuto=false;state.rollingUntil=0;clearTimeout(autoTimer);
        toast("ไม่มี Tier เป้าหมาย · หยุด Auto แล้ว");
      }
      renderFilters();renderPack();updateRollProgress();save();
    });
    $("#clearFilters").addEventListener("click",()=>{state.autoTargets=[];if(state.autoRolling||state.fullAuto){state.autoRolling=false;state.fullAuto=false;state.rollingUntil=0;clearTimeout(autoTimer)}renderFilters();renderPack();updateRollProgress();save()});
    $("#selectUnlocked").addEventListener("click",()=>{state.autoTargets=Array.from({length:maxTierForLevel()},(_,i)=>i);renderFilters();save()});
    document.addEventListener("keydown",e=>{
      if(e.key==="1"&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)&&!state.autoRolling&&!state.fullAuto)manualRoll();
      if(e.key==="Escape"){closeReveal();closeStand();closeAuth();closeSocialBase();closeGradeAuto()}
    });
    window.addEventListener("beforeunload",save);
  }

  function init(){
    normalizeSlots();bind();
    const now=Date.now(),offlineSeconds=Math.max(0,(now-(state.lastTick||now))/1000);
    if(offlineSeconds>2&&state.placed.some(Boolean)){const gain=totalIncome()*offlineSeconds;state.money+=gain;toast("รับรายได้ออฟไลน์ "+fmt(gain))}
    state.lastTick=now;renderAll();updateRollProgress();
    state.rollingUntil=0;
    setInterval(economyTick,1000);
    onlineHeartbeatTimer=setInterval(()=>{if(document.visibilityState==="visible"&&authSession)heartbeatOnline()},45000);
    const catchUpActiveSystems=()=>{
      accrueIncomeToNow();
      if(state.rollingUntil)processRollEngine();
      if(state.gradeAuto)processGradeAuto();
      renderHeader();renderRebirth();
      if(authSession){heartbeatOnline();flushCloudSave()}
    };
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")catchUpActiveSystems()});
    window.addEventListener("focus",catchUpActiveSystems);
    initCloud();
  }

  init();
})();