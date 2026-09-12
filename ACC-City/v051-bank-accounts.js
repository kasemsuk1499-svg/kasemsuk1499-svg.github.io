(() => {
  if (window.__accBankAccountsV051) return;
  window.__accBankAccountsV051 = true;

  const BUILD = 'v0.5.1';
  const DIR_KEY = 'accCityBankDirectoryV1';
  const q = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => '฿' + Math.round(Number(n || 0)).toLocaleString('th-TH');

  function digitsFromUid(uid) {
    let h1 = 2166136261 >>> 0, h2 = 2246822519 >>> 0;
    const str = String(uid || '') + '|ACC-BANK-V1';
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 ^= c; h1 = Math.imul(h1, 16777619) >>> 0;
      h2 ^= c + i; h2 = Math.imul(h2, 3266489917) >>> 0;
    }
    const body = String((BigInt(h1) * 4294967296n + BigInt(h2)) % 10000000000n).padStart(10, '0');
    return body;
  }

  function formatAccount(raw) {
    const d = String(raw || '').replace(/\D/g, '').slice(-10).padStart(10, '0');
    return `ACC-${d.slice(0,4)}-${d.slice(4,8)}-${d.slice(8,10)}`;
  }

  function validAccount(v) { return /^ACC-\d{4}-\d{4}-\d{2}$/.test(String(v || '').trim().toUpperCase()); }

  function ensureAccount() {
    if (typeof state === 'undefined' || !state.uid) return '';
    if (!validAccount(state.bankAccountNo)) {
      state.bankAccountNo = formatAccount(digitsFromUid(state.uid));
      try { save(); } catch {}
    }
    registerDirectory();
    return state.bankAccountNo;
  }

  function registerDirectory() {
    if (typeof state === 'undefined' || !state.uid || !validAccount(state.bankAccountNo)) return;
    let dir = {};
    try { dir = JSON.parse(localStorage.getItem(DIR_KEY) || '{}') || {}; } catch {}
    dir[state.bankAccountNo] = { name: state.name || 'Guest', lastSeen: Date.now() };
    try { localStorage.setItem(DIR_KEY, JSON.stringify(dir)); } catch {}
  }

  function lookupAccount(no) {
    const n = String(no || '').trim().toUpperCase();
    const system = {
      'ACC-0000-0000-01': 'ACC City Hall',
      'ACC-0000-0000-02': 'Moonlight Cafe',
      'ACC-0000-0000-03': 'Central Market',
      'ACC-0000-0000-04': 'ACC Sports District'
    };
    if (system[n]) return { name: system[n], system: true };
    let dir = {};
    try { dir = JSON.parse(localStorage.getItem(DIR_KEY) || '{}') || {}; } catch {}
    return dir[n] || null;
  }

  async function copyAccount() {
    const no = ensureAccount();
    if (!no) return;
    try { await navigator.clipboard.writeText(no); if (typeof toast === 'function') toast('คัดลอกเลขบัญชีแล้ว'); }
    catch { if (typeof toast === 'function') toast(no); }
  }

  function injectAccountUi() {
    const no = ensureAccount();
    if (!no) return;
    const bank = q('#bankViewBody');
    if (bank && !q('#accBankNumberCard')) {
      const firstCard = bank.querySelector('.acc-bank-grid .card');
      if (firstCard) firstCard.insertAdjacentHTML('beforeend', `
        <div id="accBankNumberCard" style="margin-top:12px;padding:10px 12px;border:1px solid #263a56;border-radius:11px;background:#0a1320">
          <div class="tiny muted">เลขบัญชี ACC Bank</div>
          <div class="row wrap" style="margin-top:3px"><b style="font-size:16px;letter-spacing:.05em">${esc(no)}</b><button id="copyAccBankNo" class="ghost" style="padding:6px 9px">คัดลอก</button></div>
          <div class="tiny muted" style="margin-top:4px">ใช้เลขบัญชีนี้สำหรับรับโอน · UID ไม่ใช้เป็นเลขรับเงิน</div>
        </div>`);
      q('#copyAccBankNo')?.addEventListener('click', copyAccount);
    }
    const mb = q('#mBankBody');
    if (mb && !q('#mAccBankNumber')) {
      const card = mb.querySelector('.m-card');
      if (card) card.insertAdjacentHTML('beforeend', `<div id="mAccBankNumber" style="margin-top:9px;padding:8px;border:1px solid #263a56;border-radius:9px"><div class="tiny muted">เลขบัญชี</div><div class="row"><b>${esc(no)}</b><button id="mCopyAccBankNo" class="ghost">คัดลอก</button></div></div>`);
      q('#mCopyAccBankNo')?.addEventListener('click', copyAccount);
    }
  }

  function openTransferByAccount() {
    const own = ensureAccount();
    if (!q('#modal')) return;
    q('#modalTitle').textContent = '↗️ โอนเงินด้วยเลขบัญชี';
    q('#modalSub').textContent = `จากบัญชี ${own} · ACC Central Bank`;
    q('#modalBody').innerHTML = `
      <div class="field"><label>เลขบัญชีผู้รับ</label><input id="accTransferAccount" class="input" autocomplete="off" placeholder="ACC-1234-5678-90" maxlength="15"><div id="accTransferLookup" class="tiny muted" style="margin-top:5px">กรอกเลขบัญชี 10 หลักของผู้รับ</div></div>
      <div class="field"><label>จำนวนเงิน</label><input id="accTransferAmount" class="input" type="number" min="1" step="1" value="1000"></div>
      <div class="field"><label>หมายเหตุ</label><input id="accTransferNote" class="input" maxlength="80" placeholder="ไม่บังคับ"></div>
      <div class="field"><label>โอนจาก</label><select id="accTransferSource" class="select"><option value="bank">Bank ${money(state.bank)}</option><option value="wallet">Wallet ${money(state.wallet)}</option></select></div>
      <button id="accTransferConfirm" class="primary" style="width:100%">ยืนยันการโอน</button>
      <div class="tiny muted" style="margin-top:8px">เลขบัญชีเป็นข้อมูลสำหรับรับเงิน ส่วนการยืนยันสิทธิ์เจ้าของบัญชีจะย้ายไปตรวจบน Server เมื่อเชื่อม Backend จริง</div>`;
    q('#modal').classList.remove('hidden');

    const inp = q('#accTransferAccount'), info = q('#accTransferLookup');
    inp.addEventListener('input', () => {
      let raw = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (raw.startsWith('ACC')) raw = raw.slice(3);
      const d = raw.replace(/\D/g, '').slice(0,10);
      inp.value = d.length ? `ACC-${d.slice(0,4)}${d.length>4?'-'+d.slice(4,8):''}${d.length>8?'-'+d.slice(8,10):''}` : '';
      const n = inp.value;
      if (validAccount(n)) {
        const found = lookupAccount(n);
        info.innerHTML = n === own ? '<span style="color:#ff8e9a">บัญชีของคุณเอง</span>' : found ? `<span style="color:#71e6aa">✓ ${esc(found.name)}</span>` : 'รูปแบบถูกต้อง · บัญชีภายนอกจะตรวจสอบกับ Server เมื่อระบบออนไลน์เต็มรูปแบบ';
      } else info.textContent = 'กรอกเลขบัญชีรูปแบบ ACC-1234-5678-90';
    });

    q('#accTransferConfirm').onclick = () => {
      const account = inp.value.trim().toUpperCase();
      const amount = Math.floor(Number(q('#accTransferAmount').value));
      const source = q('#accTransferSource').value;
      const note = (q('#accTransferNote').value || '').trim();
      if (!validAccount(account)) { if (typeof toast==='function') toast('เลขบัญชีไม่ถูกต้อง'); return; }
      if (account === own) { if (typeof toast==='function') toast('โอนเข้าบัญชีตัวเองไม่ได้'); return; }
      if (!(amount > 0)) { if (typeof toast==='function') toast('จำนวนเงินไม่ถูกต้อง'); return; }
      if (Number(state[source] || 0) < amount) { if (typeof toast==='function') toast(`${source==='bank'?'Bank':'Wallet'} ไม่พอ`); return; }
      state[source] -= amount;
      const target = lookupAccount(account);
      try { addLedgerV3(`โอนเงิน → ${target?.name || account}${note?' · '+note:''}`, -amount); }
      catch { try { state.ledger.unshift({t:`โอนเงิน → ${target?.name || account}${note?' · '+note:''}`,v:-amount}); } catch {} }
      try { save(); renderAll(); } catch {}
      try { closeModal(); } catch { q('#modal')?.classList.add('hidden'); }
      try { floatMoney(`-${money(amount)}`, false); } catch {}
      if (typeof toast==='function') toast(`โอน ${money(amount)} ไป ${target?.name || account} แล้ว`);
    };
  }

  document.addEventListener('click', e => {
    const transfer = e.target.closest('[data-bank-action="transfer"]');
    if (transfer) {
      e.preventDefault(); e.stopImmediatePropagation();
      openTransferByAccount();
      return;
    }
    if (e.target.closest('#copyAccBankNo,#mCopyAccBankNo')) return;
  }, true);

  const observer = new MutationObserver(() => injectAccountUi());
  observer.observe(document.documentElement, { childList:true, subtree:true });

  function start() {
    ensureAccount(); injectAccountUi();
    setInterval(() => { registerDirectory(); injectAccountUi(); }, 8000);
    const badge = q('#acc-build-badge'); if (badge) badge.textContent = `ACC City ${BUILD}`;
    document.title = `ACC City ${BUILD} — Living Community`;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
