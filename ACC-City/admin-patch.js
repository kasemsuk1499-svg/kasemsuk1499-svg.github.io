(() => {
  if (window.__accGodRoleAdminV1) return;
  window.__accGodRoleAdminV1 = true;

  const ROLE_STORE = 'accCityRoleDefsV1';
  const classOrder = ['ประชาชน','ผู้ประกอบอาชีพ','ผู้ประกอบการ','ชนชั้นธุรกิจ','ชนชั้นสูง','ผู้ทรงอิทธิพล'];

  function safeParse(v){ try { return JSON.parse(v); } catch { return null; } }
  function normalizeRole(r){
    return {
      id: String(r.id || ('custom_'+Date.now().toString(36))),
      icon: String(r.icon || '✨').slice(0,8),
      name: String(r.name || 'โรลใหม่').slice(0,40),
      color: /^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color : '#b78cff',
      cls: classOrder.includes(r.cls) ? r.cls : 'ประชาชน',
      desc: String(r.desc || '').slice(0,180),
      perms: Array.isArray(r.perms) ? r.perms.map(x=>String(x).trim()).filter(Boolean).slice(0,20) : [],
      creates: Array.isArray(r.creates) ? r.creates.filter(x=>createDefs[x]).slice(0,20) : [],
      advanced: !!r.advanced,
      unlockCost: Math.max(0, Number(r.unlockCost || 0)),
      minRep: Math.max(0, Number(r.minRep || 0)),
      minAssets: Math.max(0, Number(r.minAssets || 0)),
      minClass: classOrder.includes(r.minClass) ? r.minClass : 'ประชาชน',
      custom: !!r.custom
    };
  }
  function persistRoles(){
    try { localStorage.setItem(ROLE_STORE, JSON.stringify(roles)); } catch(e) {}
  }
  function restoreRoles(){
    const saved = safeParse(localStorage.getItem(ROLE_STORE));
    if (!Array.isArray(saved) || !saved.length) return;
    const defs = saved.map(normalizeRole);
    roles.splice(0, roles.length, ...defs);
    const valid = new Set(roles.map(r=>r.id));
    state.owned = (state.owned || []).filter(id=>valid.has(id));
    if (!state.owned.includes('citizen') && valid.has('citizen')) state.owned.unshift('citizen');
    if (!valid.has(state.active)) state.active = valid.has('citizen') ? 'citizen' : roles[0]?.id;
    if (state.isGod) state.owned = [...new Set([...state.owned, ...roles.map(r=>r.id)])];
  }
  restoreRoles();

  const originalSave = save;
  save = function(){ persistRoles(); return originalSave(); };
  const originalLoadSaved = loadSaved;
  loadSaved = function(uid){
    const ok = originalLoadSaved(uid);
    restoreRoles();
    if (state.isGod) state.owned = [...new Set([...state.owned, ...roles.map(r=>r.id)])];
    return ok;
  };

  function reqText(r){
    const req=[];
    if (r.minClass && r.minClass!=='ประชาชน') req.push('ฐานะ '+r.minClass+'+');
    if (r.minRep) req.push('ชื่อเสียง '+r.minRep+'+');
    if (r.minAssets) req.push('สินทรัพย์ '+fmt(r.minAssets)+'+');
    if (r.unlockCost) req.push('ค่าปลด '+fmt(r.unlockCost));
    return req.length ? req.join(' · ') : (r.advanced ? 'โรลขั้นสูง' : 'โรลพื้นฐาน');
  }

  unlockRole = function(id){
    const r=role(id);
    if (!r || state.owned.includes(id)) return;
    if (!state.isGod){
      const myClass = classOrder.indexOf(state.className);
      const needClass = classOrder.indexOf(r.minClass || 'ประชาชน');
      if (myClass < needClass){ toast('ต้องมีฐานะ '+(r.minClass||'ประชาชน')+' ขึ้นไป'); return; }
      if (state.rep < Number(r.minRep||0)){ toast('ต้องมี Reputation '+Number(r.minRep||0)+'+'); return; }
      if ((state.wallet+state.bank) < Number(r.minAssets||0)){ toast('สินทรัพย์รวมยังไม่ถึง '+fmt(Number(r.minAssets||0))); return; }
      if (id==='company_owner' && (state.orgs.length<1 || state.rep<100)){ toast('ต้องมี Reputation 100+ และมีกิจการอย่างน้อย 1 แห่ง'); return; }
      if (id==='investor' && (state.wallet+state.bank<100000 || state.rep<150)){ toast('ต้องมีสินทรัพย์ 100,000+ และ Reputation 150+'); return; }
      const fee=Number(r.unlockCost||0);
      if (fee>0 && state.wallet<fee){ toast('Wallet ไม่พอสำหรับค่าปลดโรล'); return; }
      if (fee>0){ state.wallet-=fee; addLedger('ค่าปลด Role: '+r.name,-fee); }
    }
    state.owned.push(id); state.rep+=3; renderAll(); save(); toast('ได้รับ Role: '+r.name);
  };

  const originalRenderRoles = renderRoles;
  renderRoles = function(){
    originalRenderRoles();
    const center = document.querySelector('#roleCenter');
    if (center) {
      center.querySelectorAll('[data-unlock]').forEach(btn=>{
        const r=role(btn.dataset.unlock);
        const row=btn.closest('.role-row');
        if (!r || !row) return;
        const detail=row.querySelector('.tiny.muted');
        if (detail && !detail.dataset.reqAdded){
          detail.dataset.reqAdded='1';
          detail.insertAdjacentHTML('beforeend', `<div style="margin-top:4px;color:#7f93ad">${reqText(r)}</div>`);
        }
      });
    }
    renderGodRoleAdmin();
  };

  function ensureAdminUI(){
    const panel=document.querySelector('#godPanel');
    if (!panel || document.querySelector('#godRoleAdmin')) return;
    const tools=panel.querySelector('.god-tools');
    if (tools) tools.insertAdjacentHTML('beforeend','<button id="godRoleManagerBtn" type="button">🎭 จัดการโรล</button>');
    panel.insertAdjacentHTML('beforeend', `
      <div id="godRoleAdmin" style="margin-top:12px;border-top:1px solid #624ca0;padding-top:12px">
        <div class="row wrap"><div><b>🎭 GOD Role Manager</b><div class="tiny muted">เพิ่ม แก้ไข ลบ และกำหนดสิทธิ์ของทุกโรลในเมือง</div></div><button id="godAddRole" class="primary" type="button">＋ เพิ่มโรลใหม่</button></div>
        <div id="godRoleList" style="margin-top:10px;display:flex;flex-direction:column;gap:7px"></div>
      </div>`);
    document.querySelector('#godRoleManagerBtn')?.addEventListener('click',()=>document.querySelector('#godRoleAdmin')?.scrollIntoView({behavior:'smooth',block:'nearest'}));
    document.querySelector('#godAddRole')?.addEventListener('click',()=>openRoleEditor());
  }

  function renderGodRoleAdmin(){
    ensureAdminUI();
    const box=document.querySelector('#godRoleList');
    if (!box) return;
    if (!state.isGod){ box.innerHTML=''; return; }
    box.innerHTML=roles.map(r=>`<div style="display:grid;grid-template-columns:36px minmax(120px,1fr) auto;gap:8px;align-items:center;padding:8px 9px;border:1px solid var(--line);border-radius:10px;background:#0d151f">
      <div style="font-size:21px">${r.icon}</div>
      <div style="min-width:0"><b style="color:${r.color}">${escapeHtml(r.name)}</b><div class="tiny muted">${escapeHtml(r.cls)} · ${escapeHtml(reqText(r))}</div></div>
      <div style="display:flex;gap:5px"><button type="button" data-role-edit="${r.id}" style="padding:6px 8px">แก้</button><button type="button" data-role-del="${r.id}" style="padding:6px 8px" ${r.id==='citizen'?'disabled title="Core Role"':''}>ลบ</button></div>
    </div>`).join('');
    box.querySelectorAll('[data-role-edit]').forEach(b=>b.addEventListener('click',()=>openRoleEditor(b.dataset.roleEdit)));
    box.querySelectorAll('[data-role-del]').forEach(b=>b.addEventListener('click',()=>deleteRole(b.dataset.roleDel)));
  }

  function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function openRoleEditor(id){
    if (!state.isGod){ toast('GOD only'); return; }
    const existing=id ? roles.find(r=>r.id===id) : null;
    const r=normalizeRole(existing || {id:'custom_'+Date.now().toString(36),icon:'✨',name:'โรลใหม่',color:'#b78cff',cls:'ประชาชน',desc:'',perms:[],creates:[],advanced:false,minClass:'ประชาชน',custom:true});
    document.querySelector('#modalTitle').textContent=existing?'🎭 แก้ไข Role':'🎭 เพิ่ม Role ใหม่';
    document.querySelector('#modalSub').textContent='กำหนดจุดเด่น สีชื่อ สิทธิ์ และเงื่อนไขปลดล็อก';
    const createChecks=Object.entries(createDefs).map(([key,d])=>`<label style="display:flex;gap:6px;align-items:center;font-size:12px"><input type="checkbox" data-role-create="${key}" ${r.creates.includes(key)?'checked':''}> ${d.icon} ${escapeHtml(d.name)}</label>`).join('');
    document.querySelector('#modalBody').innerHTML=`
      <div class="panel-grid">
        <div class="field"><label>ชื่อ Role</label><input id="reName" class="input" maxlength="40" value="${escapeHtml(r.name)}"></div>
        <div class="field"><label>ไอคอน</label><input id="reIcon" class="input" maxlength="8" value="${escapeHtml(r.icon)}"></div>
        <div class="field"><label>สีชื่อ</label><input id="reColor" class="input" type="color" value="${r.color}"></div>
        <div class="field"><label>ฐานะของ Role</label><select id="reClass" class="select">${classOrder.map(x=>`<option ${x===r.cls?'selected':''}>${x}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>คำอธิบาย / จุดเด่น</label><textarea id="reDesc" rows="3">${escapeHtml(r.desc)}</textarea></div>
      <div class="field"><label>สิทธิ์พิเศษ (คั่นด้วย ,)</label><input id="rePerms" class="input" value="${escapeHtml(r.perms.join(', '))}" placeholder="เช่น เปิดร้าน, รับ Contract, สร้างห้อง"></div>
      <div class="field"><label>สิทธิ์สร้างสิ่งต่าง ๆ ในเมือง</label><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:9px;border:1px solid var(--line);border-radius:10px">${createChecks}</div></div>
      <div class="panel-grid">
        <div class="field"><label>ฐานะขั้นต่ำสำหรับปลด</label><select id="reMinClass" class="select">${classOrder.map(x=>`<option ${x===r.minClass?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label>Reputation ขั้นต่ำ</label><input id="reMinRep" class="input" type="number" min="0" value="${r.minRep}"></div>
        <div class="field"><label>สินทรัพย์ขั้นต่ำ (บาท)</label><input id="reMinAssets" class="input" type="number" min="0" value="${r.minAssets}"></div>
        <div class="field"><label>ค่าปลด Role (บาท)</label><input id="reCost" class="input" type="number" min="0" value="${r.unlockCost}"></div>
      </div>
      <label style="display:flex;gap:8px;align-items:center;margin:8px 0 14px"><input id="reAdvanced" type="checkbox" ${r.advanced?'checked':''}> <span class="small">เป็น Advanced Role — ไม่ให้เลือกตอนเริ่มเกม</span></label>
      <div class="row"><span class="tiny muted">ID: ${escapeHtml(r.id)}</span><button id="saveRoleEditor" class="primary" type="button">บันทึก Role</button></div>`;
    document.querySelector('#modal').classList.remove('hidden');
    document.querySelector('#saveRoleEditor').onclick=()=>saveRoleEditor(r.id, !!existing);
  }

  function saveRoleEditor(id,isEdit){
    const name=document.querySelector('#reName').value.trim();
    if (!name){ toast('กรอกชื่อ Role ก่อน'); return; }
    const updated=normalizeRole({
      id,
      icon:document.querySelector('#reIcon').value.trim()||'✨',
      name,
      color:document.querySelector('#reColor').value,
      cls:document.querySelector('#reClass').value,
      desc:document.querySelector('#reDesc').value.trim(),
      perms:document.querySelector('#rePerms').value.split(',').map(x=>x.trim()).filter(Boolean),
      creates:[...document.querySelectorAll('[data-role-create]:checked')].map(x=>x.dataset.roleCreate),
      advanced:document.querySelector('#reAdvanced').checked,
      minClass:document.querySelector('#reMinClass').value,
      minRep:Number(document.querySelector('#reMinRep').value||0),
      minAssets:Number(document.querySelector('#reMinAssets').value||0),
      unlockCost:Number(document.querySelector('#reCost').value||0),
      custom:true
    });
    if (isEdit){
      const idx=roles.findIndex(x=>x.id===id); if (idx>=0) roles[idx]=updated;
    } else {
      roles.push(updated);
      if (!state.owned.includes(updated.id)) state.owned.push(updated.id);
    }
    if (state.active===id) state.className=updated.cls;
    persistRoles(); save(); closeModal(); renderAll(); renderGodRoleAdmin(); toast(isEdit?'แก้ไข Role แล้ว':'สร้าง Role ใหม่แล้ว');
  }

  function deleteRole(id){
    if (!state.isGod || id==='citizen') return;
    const r=roles.find(x=>x.id===id); if (!r) return;
    if (!confirm('ลบ Role “'+r.name+'” ? ผู้เล่นที่ถือโรลนี้จะถูกถอดโรล')) return;
    const idx=roles.findIndex(x=>x.id===id); if (idx>=0) roles.splice(idx,1);
    state.owned=state.owned.filter(x=>x!==id);
    if (state.active===id){ state.active=roles.some(x=>x.id==='citizen')?'citizen':roles[0]?.id; state.className=role(state.active).cls; }
    persistRoles(); save(); renderAll(); renderGodRoleAdmin(); toast('ลบ Role แล้ว');
  }

  ensureAdminUI();
  if (state.isGod) state.owned=[...new Set([...state.owned,...roles.map(r=>r.id)])];
  renderAll();
  renderGodRoleAdmin();
})();
