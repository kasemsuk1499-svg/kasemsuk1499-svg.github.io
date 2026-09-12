(()=>{
if(window.__accV058BankCompat)return;window.__accV058BankCompat=1;
const q=s=>document.querySelector(s);
function mapAction(el){
 const d=(el?.dataset?.bankAction||'').toLowerCase();if(['deposit','withdraw','transfer','pay'].includes(d))return d;
 const s=((el?.id||'')+' '+(el?.textContent||'')).toLowerCase();
 if(/deposit|ฝาก/.test(s))return'deposit';if(/withdraw|ถอน/.test(s))return'withdraw';if(/transfer|โอน/.test(s))return'transfer';if(/pay|จ่าย|ชำระ/.test(s))return'pay';return'';
}
function route(action){const btn=q(`[data-v057-bank-act="${action}"]`);if(btn){btn.click();return true}return false}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-bank-action],#bankDeposit,#bankWithdraw,#bankTransfer,#bankPay,#depositBtn,#withdrawBtn,#transferBankBtn,#payBtn');
 if(!el)return;const action=mapAction(el);if(!action)return;
 if(route(action)){e.preventDefault();e.stopImmediatePropagation();}
},true);
function markLegacy(){document.querySelectorAll('[data-bank-action],#bankDeposit,#bankWithdraw,#bankTransfer,#bankPay,#depositBtn,#withdrawBtn,#transferBankBtn,#payBtn').forEach(el=>{if(!el.dataset.v058){el.dataset.v058='1';el.title='เชื่อมกับ ACC Central Bank Stable v0.5.7'}})}
function start(){markLegacy();setInterval(markLegacy,3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();