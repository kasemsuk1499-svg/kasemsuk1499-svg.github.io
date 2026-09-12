(()=>{
  if(window.__accV053Realtime)return; window.__accV053Realtime=1;
  const SUPABASE_URL='https://qlaykelpabbjojpqjfwi.supabase.co';
  const SUPABASE_KEY='sb_publishable_KBWwFJ2v26lLH8UVoNIZ9Q_MtWguO29';
  const q=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const publicId=localStorage.getItem('accPublicPlayerId')||('ACC-P-'+Math.random().toString(36).slice(2,10).toUpperCase());
  localStorage.setItem('accPublicPlayerId',publicId);
  let channel=null, online=[], connected=false, lastSig='';

  function player(){
    let name='Guest', role='พลเมือง', location='เมือง', rep=0;
    try{ if(typeof state!=='undefined'){name=state.name||name;rep=Number(state.rep||0);location=state.location||state.currentLocation||q('#viewTitle')?.textContent||location;} }catch{}
    try{ role=q('#activeRoleTop')?.textContent?.trim()||q('#mActiveRole')?.textContent?.trim()||role; }catch{}
    return {public_id:publicId,name,role,location,rep,online_at:new Date().toISOString()};
  }
  function addCss(){
    if(q('#acc-v053-rt-css'))return;
    const st=document.createElement('style');st.id='acc-v053-rt-css';st.textContent=`
      #onlinePanel,#mOnlineStrip{display:none!important}
      .acc-rt-status{display:flex;align-items:center;gap:6px;font-size:10px;color:#86a0bf;margin:5px 0 8px}.acc-rt-dot{width:7px;height:7px;border-radius:50%;background:#ffb454}.acc-rt-status.live .acc-rt-dot{background:#55dc96;box-shadow:0 0 10px #55dc9688}.acc-rt-list{display:flex;flex-direction:column;gap:7px}.acc-rt-user{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:8px;border:1px solid #1d2b40;border-radius:10px;background:#0d1622}.acc-rt-ava{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#182840;font-weight:850;position:relative}.acc-rt-ava:after{content:'';position:absolute;right:-1px;bottom:-1px;width:9px;height:9px;border-radius:50%;background:#55dc96;border:2px solid #0d1622}.acc-rt-meta{min-width:0}.acc-rt-meta b{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.acc-rt-meta small{display:block;color:#7f93ad;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.acc-rt-kind{font-size:9px;padding:3px 5px;border:1px solid #2a405d;border-radius:6px;color:#9bb6d7}.acc-rt-mobile{display:flex;gap:6px;overflow:auto;margin-top:8px;padding-bottom:3px}.acc-rt-chip{display:flex;align-items:center;gap:6px;white-space:nowrap;border:1px solid var(--line,#223047);border-radius:999px;padding:5px 8px;background:#0d1622;font-size:10px}.acc-rt-chip i{width:6px;height:6px;border-radius:50%;background:#55dc96;display:block}
    `;document.head.appendChild(st);
  }
  function ensureUi(){
    addCss();
    const old=q('#onlinePanel');
    if(old&&!q('#accRealtimeOnline')) old.insertAdjacentHTML('afterend','<div id="accRtStatus" class="acc-rt-status"><span class="acc-rt-dot"></span><span>กำลังเชื่อม Realtime…</span></div><div id="accRealtimeOnline" class="acc-rt-list"></div>');
    const ms=q('#mOnlineStrip');
    if(ms&&!q('#accRealtimeMobile')) ms.insertAdjacentHTML('afterend','<div id="accRtMobileStatus" class="acc-rt-status"><span class="acc-rt-dot"></span><span>กำลังเชื่อม Realtime…</span></div><div id="accRealtimeMobile" class="acc-rt-mobile"></div>');
  }
  function render(){
    ensureUi();
    const sig=JSON.stringify([connected,online.map(x=>[x.public_id,x.name,x.role,x.location,x.rep])]); if(sig===lastSig)return; lastSig=sig;
    const status=q('#accRtStatus'), mstatus=q('#accRtMobileStatus');
    [status,mstatus].forEach(el=>{if(!el)return;el.classList.toggle('live',connected);const s=el.querySelector('span:last-child');if(s)s.textContent=connected?`ออนไลน์จริง ${online.length} คน`:'Realtime ยังไม่เชื่อม';});
    const html=online.map(u=>`<div class="acc-rt-user"><div class="acc-rt-ava">${esc((u.name||'?').slice(0,1).toUpperCase())}</div><div class="acc-rt-meta"><b>${esc(u.name||'Guest')}${u.public_id===publicId?' · คุณ':''}</b><small>${esc(u.role||'พลเมือง')} · ${esc(u.location||'เมือง')} · ⭐${Number(u.rep||0)}</small></div><span class="acc-rt-kind">PLAYER</span></div>`).join('')||'<div class="tiny muted">ยังไม่มีผู้เล่นออนไลน์คนอื่น</div>';
    const list=q('#accRealtimeOnline'); if(list)list.innerHTML=html;
    const mob=q('#accRealtimeMobile'); if(mob)mob.innerHTML=online.map(u=>`<span class="acc-rt-chip"><i></i>${esc(u.name||'Guest')}${u.public_id===publicId?' · คุณ':''}</span>`).join('');
    const count=q('#onlineCountText'); if(count&&connected)count.textContent=`${online.length} ออนไลน์จริง`;
    const mc=q('#mOnlineCount'); if(mc&&connected)mc.textContent=`${online.length} คน`;
  }
  function syncPresence(){
    if(!channel||!connected)return; channel.track(player()).catch(()=>{});
  }
  async function start(){
    ensureUi();
    try{
      const mod=await import('https://esm.sh/@supabase/supabase-js@2.57.4');
      const sb=mod.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      channel=sb.channel('acc-city-global-presence',{config:{presence:{key:publicId}}});
      channel.on('presence',{event:'sync'},()=>{
        const stateMap=channel.presenceState(); const rows=[];
        Object.values(stateMap).forEach(arr=>(arr||[]).forEach(x=>{if(x?.public_id)rows.push(x)}));
        const uniq=new Map(); rows.forEach(x=>uniq.set(x.public_id,x)); online=[...uniq.values()].sort((a,b)=>String(a.name).localeCompare(String(b.name),'th')); connected=true; render();
      });
      channel.on('presence',{event:'join'},()=>{}).on('presence',{event:'leave'},()=>{});
      channel.subscribe(async status=>{
        if(status==='SUBSCRIBED'){connected=true;await channel.track(player());render();}
        if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){connected=false;render();}
      });
      setInterval(syncPresence,10000);
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncPresence()});
      document.addEventListener('click',()=>setTimeout(syncPresence,250),{passive:true});
    }catch(e){connected=false;render();console.warn('ACC realtime presence unavailable',e);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();