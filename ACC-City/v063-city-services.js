(()=>{
'use strict';
if(window.__accV063CityServices)return;window.__accV063CityServices=1;
const BUILD='v0.6.3';
const EPOCH=new Date('2026-09-12T00:00:00+07:00').getTime();
const HOUR=3600000,REAL_DAY=86400000;
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'฿'+Math.round(num(v)).toLocaleString('th-TH');
const AREAS={
 'ACC Plaza':{icon:'🏙️',desc:'ศูนย์กลางเมือง ข่าวสาร และการพบปะ',staff:['City Guide','Community Host','Street Vendor']},
 'Central Market':{icon:'🛒',desc:'ซื้อขายสินค้า ใบอนุญาตร้านค้า และงานส่งของ',staff:['Market Clerk','Merchant','Courier']},
 'ACC Central Bank':{icon:'🏦',desc:'ฝาก ถอน เครดิต สินเชื่อ และคำปรึกษาการเงิน',staff:['Teller','Credit Officer','Bank Guard']},
 'Employment Center':{icon:'💼',desc:'หางาน ลงทะเบียนผู้หางาน และสวัสดิการเมือง',staff:['Recruiter','Case Worker','Job Coach']},
 'Sports District':{icon:'🏟️',desc:'ฝึกซ้อม สมัครแข่ง และชมการแข่งขัน',staff:['Coach','Referee','Sports Medic']},
 'Industrial Zone':{icon:'🏭',desc:'โรงงาน โลจิสติกส์ ซ่อมบำรุง และงานกะ',staff:['Supervisor','Technician','Dispatcher']},
 'Event Square':{icon:'🎪',desc:'เทศกาล อีเวนต์ชุมชน และงานอาสาสมัคร',staff:['Event Host','Vendor','Performer']},
 'City Hall':{icon:'🏛️',desc:'ทะเบียนประชาชน ใบอนุญาตธุรกิจ และบริการราชการ',staff:['City Clerk','Permit Officer','Registrar']},
 'Residential District':{icon:'🏠',desc:'เช่าที่พัก พักผ่อน และชำระค่าเช่า',staff:['Property Agent','Caretaker','Neighbor']},
 'ACC General Hospital':{icon:'🏥',desc:'ตรวจสุขภาพ รักษา และพักฟื้น',staff:['Doctor','Nurse','Pharmacist']},
 'Police HQ':{icon:'🚓',desc:'ชำระค่าปรับ แจ้งเหตุ และบริการชุมชน',staff:['Officer','Detective','Dispatcher']},
 'Education Center':{icon:'🎓',desc:'ห้องสมุด หลักสูตร และพัฒนาความรู้',staff:['Librarian','Instructor','Career Advisor']},
 'Transit Hub':{icon:'🚌',desc:'ระบบขนส่ง บัตรรายเดือน และงานส่งด่วน',staff:['Station Staff','Driver','Courier']}
};
const AREA_ORDER=Object.keys(AREAS);
const EVENTS=[
 {name:'🍜 Food Festival',desc:'ร้านอาหารและผู้ผลิตมารวมตัวที่ Event Square',rep:2,civic:3,knowledge:'business'},
 {name:'💼 Career Fair',desc:'บริษัทเปิดบูธรับสมัครและแนะแนวอาชีพ',rep:1,civic:3,knowledge:'hr'},
 {name:'🏃 Sports Expo',desc:'ทดลองกีฬาและพบโค้ชจาก Sports District',rep:2,civic:2,sport:1},
 {name:'🎤 Creator Night',desc:'เวทีครีเอเตอร์ ดนตรี และสื่อของเมือง',rep:2,civic:3,knowledge:'marketing'},
 {name:'🛍️ Market Day',desc:'ตลาดพิเศษและกิจกรรมผู้ประกอบการ',rep:1,civic:2,knowledge:'finance'}
];
let lastSig='';
function S(){return typeof state!=='undefined'?state:null}
function daySerial(){return Math.max(0,Math.floor((Date.now()-EPOCH)/HOUR))}
function monthSerial(){return Math.max(0,Math.floor((Date.now()-EPOCH)/REAL_DAY))}
function roleId(){try{return String(state.active||'citizen')}catch{return'citizen'}}
function currentLocation(){const s=S();return String(s?.location||s?.currentLocation||'ACC Plaza')}
function saveNow(){try{save()}catch{}}
function toastMsg(t){try{toast(t)}catch{}}
function ensure(){
 const s=S();if(!s)return null;
 s.cityV063=(s.cityV063&&typeof s.cityV063==='object')?s.cityV063:{};
 const c=s.cityV063;
 c.health=clamp(num(c.health)||100,0,100);c.fatigue=clamp(num(c.fatigue),0,100);c.civic=Math.max(0,num(c.civic));c.sportSkill=Math.max(0,num(c.sportSkill));
 c.permits=c.permits||{};c.claims=c.claims||{daily:{},monthly:{}};c.claims.daily=c.claims.daily||{};c.claims.monthly=c.claims.monthly||{};
 c.transit=c.transit||{passMonth:-1};c.serviceLog=Array.isArray(c.serviceLog)?c.serviceLog:[];
 c.housing=c.housing||null;c.jobSeeker=!!c.jobSeeker;
 return c;
}
function dayClaims(){const c=ensure();if(!c)return{};const k=String(daySerial());c.claims.daily[k]=c.claims.daily[k]||{};return c.claims.daily[k]}
function monthClaims(){const c=ensure();if(!c)return{};const k=String(monthSerial());c.claims.monthly[k]=c.claims.monthly[k]||{};return c.claims.monthly[k]}
function claimed(id,scope='day'){return !!(scope==='month'?monthClaims()[id]:scope==='once'?ensure()?.permits?.[id]:dayClaims()[id])}
function mark(id,scope='day'){const c=ensure();if(!c)return;if(scope==='month')monthClaims()[id]=true;else if(scope==='once')c.permits[id]=true;else dayClaims()[id]=true}
function log(label,detail=''){const c=ensure();if(!c)return;c.serviceLog.unshift({ts:Date.now(),label,detail,area:currentLocation()});c.serviceLog=c.serviceLog.slice(0,40)}
function debit(amount,label,type='city_service'){amount=Math.max(0,Math.floor(num(amount)));if(!amount)return true;try{if(window.ACCMoney?.debit)return !!window.ACCMoney.debit(amount,label,{type,meta:{area:currentLocation()}})}catch{}const s=S();if(!s||num(s.wallet)<amount){toastMsg('Wallet ไม่พอ');return false}s.wallet-=amount;saveNow();return true}
function credit(amount,label,type='city_service'){amount=Math.max(0,Math.floor(num(amount)));if(!amount)return true;try{if(window.ACCMoney?.credit){window.ACCMoney.credit(amount,label,{type,meta:{area:currentLocation()}});return true}}catch{}const s=S();if(!s)return false;s.wallet=num(s.wallet)+amount;saveNow();return true}
function addRep(v){const s=S();if(!s)return;s.rep=Math.max(0,num(s.rep)+num(v))}
function addCivic(v){const c=ensure();if(c)c.civic=Math.max(0,num(c.civic)+num(v))}
function addFatigue(v){const c=ensure();if(!c)return;c.fatigue=clamp(c.fatigue+num(v),0,100);if(c.fatigue>85)c.health=clamp(c.health-Math.max(1,Math.ceil((c.fatigue-85)/8)),0,100)}
function reduceFatigue(v){const c=ensure();if(c)c.fatigue=clamp(c.fatigue-num(v),0,100)}
function knowledge(key,gain){const s=S();if(!s)return;s.companyV060=s.companyV060||{};s.companyV060.knowledge=s.companyV060.knowledge||{};s.companyV060.knowledge[key]=clamp(num(s.companyV060.knowledge[key])+gain,0,100)}
function roleBonus(base,roles){return Math.round(base*(roles.includes(roleId())?1.15:1))}
function liveEvent(){return EVENTS[daySerial()%EVENTS.length]}
function areaStatus(area){const seed=([...area].reduce((a,c)=>a+c.charCodeAt(0),0)+daySerial()*17)%100;return seed<22?'เงียบ':seed<72?'ปกติ':'คึกคัก'}
function transitFree(){return num(ensure()?.transit?.passMonth)===monthSerial()}
function travel(to){const s=S(),c=ensure();if(!s||!c||!AREAS[to])return;if(to===currentLocation())return toastMsg('คุณอยู่ที่นี่แล้ว');const fare=transitFree()?0:25;if(fare&&!debit(fare,`ค่าโดยสารเมือง → ${to}`,'transit'))return;s.location=to;s.currentLocation=to;log('เดินทาง',`${to}${fare?' · '+money(fare):' · Transit Pass'}`);saveNow();lastSig='';render(true);toastMsg(`เดินทางถึง ${to}${fare?' · '+money(fare):' · ใช้ Transit Pass'}`)}
function modal(title,body){q('#acc63Modal')?.remove();const d=document.createElement('div');d.id='acc63Modal';d.className='acc63-modal';d.innerHTML=`<div class="acc63-dialog"><div class="row"><b style="font-size:17px">${esc(title)}</b><button class="ghost" data-acc63-close>✕</button></div>${body}</div>`;document.body.appendChild(d);return d}
function serviceResult(label,msg){log(label,msg);saveNow();lastSig='';render(true);toastMsg(msg)}
function dailyWork(id,label,base,roles,fatigue=10,rep=0,civic=0){if(claimed(id))return toastMsg('ทำบริการนี้ในวัน ACC นี้แล้ว');const pay=roleBonus(base,roles);credit(pay,`ค่าตอบแทน · ${label}`,'city_job');addFatigue(fatigue);addRep(rep);addCivic(civic);mark(id);serviceResult(label,`ได้รับ ${money(pay)}${roles.includes(roleId())?' · Role Bonus':''}`)}
function action(id){const s=S(),c=ensure();if(!s||!c)return;
 switch(id){
  case'briefing':if(claimed(id))return toastMsg('รับ City Briefing วันนี้แล้ว');mark(id);addCivic(1);addRep(1);return serviceResult('City Briefing','รับข่าวเมืองแล้ว · Civic +1 · REP +1');
  case'plaza_courier':return dailyWork(id,'งานส่งเอกสารเมือง',180,['worker','freelance','logistics','volunteer'],8,0,1);
  case'chat':return openView('chat');
  case'vendor_permit':if(c.permits.vendor)return toastMsg('มี Vendor Permit แล้ว');if(!debit(750,'ค่าธรรมเนียม Vendor Permit'))return;c.permits.vendor=true;return serviceResult('Vendor Permit','ออก Vendor Permit สำเร็จ');
  case'market_delivery':return dailyWork(id,'สัญญาส่งของตลาด',260,['merchant','logistics','worker','service'],10,1,0);
  case'market_pulse':{const p=95+((daySerial()*13)%17);return toastMsg(`Market Pulse วันนี้ ${p} จุด · ${p>=104?'ความต้องการสูง':'ตลาดปกติ'}`)}
  case'bank':return openView('economy');
  case'credit_report':{if(!debit(50,'ค่ารายงานเครดิต'))return;const score=Math.round(num(s.creditScore)||720);log('Credit Report',`Score ${score}`);saveNow();return toastMsg(`Credit Score ของคุณ: ${score}`)}
  case'finance_advice':if(claimed(id))return toastMsg('รับคำปรึกษาวันนี้แล้ว');mark(id);knowledge('finance',1);addCivic(1);return serviceResult('คำปรึกษาการเงิน','Finance Knowledge +1 · Civic +1');
  case'job_register':if(c.jobSeeker)return toastMsg('ลงทะเบียนผู้หางานแล้ว');c.jobSeeker=true;addCivic(1);return serviceResult('ทะเบียนผู้หางาน','ลงทะเบียน Employment Center สำเร็จ');
  case'emergency_shift':return dailyWork(id,'กะฉุกเฉินของเมือง',320,['worker','service','logistics','volunteer'],12,1,1);
  case'welfare':{if(claimed(id,'month'))return toastMsg('รับสวัสดิการเดือน ACC นี้แล้ว');const assets=num(s.wallet)+num(s.bank);if(assets>=1500)return toastMsg('สวัสดิการฉุกเฉินสำหรับผู้มีสินทรัพย์ต่ำกว่า ฿1,500');credit(500,'สวัสดิการฉุกเฉินเมือง','welfare');mark(id,'month');addCivic(1);return serviceResult('สวัสดิการเมือง','ได้รับสวัสดิการ ฿500')}
  case'jobs':return openView('jobs');
  case'sports':return openView('sports');
  case'sport_practice':if(claimed(id))return toastMsg('ฝึกซ้อมวันนี้แล้ว');if(!debit(50,'ค่าฝึกซ้อม Sports District','sport_training'))return;mark(id);c.sportSkill++;addFatigue(12);addRep(1);return serviceResult('ฝึกกีฬา',`Sport Skill ${c.sportSkill} · REP +1`);
  case'spectate':if(claimed(id))return toastMsg('เข้าชมการแข่งขันวันนี้แล้ว');if(!debit(30,'บัตรชมกีฬา','sport_ticket'))return;mark(id);addCivic(1);return serviceResult('ชมการแข่งขัน','Civic +1');
  case'safety':if(c.permits.industrial)return toastMsg('มี Industrial Safety Certificate แล้ว');if(!debit(250,'อบรมความปลอดภัยอุตสาหกรรม'))return;c.permits.industrial=true;knowledge('operations',1);return serviceResult('Safety Certificate','ได้รับใบรับรอง · Operations +1');
  case'maintenance':if(!c.permits.industrial)return toastMsg('ต้องอบรม Safety Certificate ก่อน');return dailyWork(id,'งานซ่อมบำรุงโรงงาน',420,['maker','craft','logistics','worker'],15,1,0);
  case'company':return openView('company');
  case'event_join':{if(claimed(id))return toastMsg('เข้าร่วมอีเวนต์วันนี้แล้ว');const ev=liveEvent();if(!debit(100,`บัตร ${ev.name}`,'event_ticket'))return;mark(id);addRep(ev.rep);addCivic(ev.civic);if(ev.knowledge)knowledge(ev.knowledge,1);if(ev.sport)c.sportSkill+=ev.sport;return serviceResult(ev.name,`REP +${ev.rep} · Civic +${ev.civic}${ev.knowledge?' · Knowledge +1':''}`)}
  case'event_volunteer':return dailyWork(id,'อาสาสมัคร Event Square',280,['volunteer','event_host','community_host','creator'],10,1,2);
  case'leaderboard':return openView('leaderboard');
  case'citizen_card':if(c.permits.citizen)return toastMsg('มีบัตรประชาชน ACC แล้ว');if(!debit(100,'ค่าธรรมเนียมบัตรประชาชน'))return;c.permits.citizen=true;return serviceResult('ACC Citizen Card','ออกบัตรประชาชนเรียบร้อย');
  case'business_permit':if(c.permits.business)return toastMsg('มี Business Permit แล้ว');if(!c.permits.citizen)return toastMsg('ต้องมี ACC Citizen Card ก่อน');if(!debit(1500,'ค่าธรรมเนียม Business Permit'))return;c.permits.business=true;knowledge('law',1);return serviceResult('Business Permit','ออกใบอนุญาตธุรกิจแล้ว · Law +1');
  case'civic_record':return toastMsg(`Civic Points: ${Math.round(c.civic)} · ใบอนุญาต ${Object.values(c.permits).filter(Boolean).length} รายการ`);
  case'housing':return housingModal();
  case'pay_rent':return payRent();
  case'rest_home':return restHome();
  case'checkup':if(claimed(id))return toastMsg('ตรวจสุขภาพวันนี้แล้ว');if(!debit(120,'ค่าตรวจสุขภาพ','health'))return;mark(id);c.health=clamp(c.health+10,0,100);reduceFatigue(10);return serviceResult('ตรวจสุขภาพ',`Health ${Math.round(c.health)} · Fatigue ${Math.round(c.fatigue)}`);
  case'treatment':{if(c.health>=100)return toastMsg('สุขภาพเต็มแล้ว');const cost=Math.max(150,Math.round((100-c.health)*20));if(!debit(cost,'ค่ารักษาพยาบาล','health'))return;c.health=100;return serviceResult('รักษาพยาบาล',`Health ฟื้นเป็น 100 · ${money(cost)}`)}
  case'clinic_rest':if(claimed(id))return toastMsg('พักฟื้นคลินิกวันนี้แล้ว');if(!debit(300,'ค่าพักฟื้นคลินิก','health'))return;mark(id);reduceFatigue(60);c.health=clamp(c.health+5,0,100);return serviceResult('พักฟื้นคลินิก',`Fatigue เหลือ ${Math.round(c.fatigue)}`);
  case'pay_fine':{const heat=Math.round(num(s.crimeV057?.heat));if(heat<=0)return toastMsg('ไม่มีค่าปรับหรือ Heat ค้างอยู่');const cost=Math.max(100,heat*25);if(!debit(cost,'ชำระค่าปรับ Police HQ','fine'))return;s.crimeV057=s.crimeV057||{};s.crimeV057.heat=0;return serviceResult('ชำระค่าปรับ',`เคลียร์ Heat แล้ว · ${money(cost)}`)}
  case'community_service':if(claimed(id))return toastMsg('ทำ Community Service วันนี้แล้ว');mark(id);s.crimeV057=s.crimeV057||{};s.crimeV057.heat=Math.max(0,num(s.crimeV057.heat)-25);addFatigue(12);addCivic(2);return serviceResult('Community Service','Heat -25 · Civic +2');
  case'report_incident':if(claimed(id))return toastMsg('แจ้งเหตุวันนี้แล้ว');mark(id);addCivic(1);addRep(1);return serviceResult('แจ้งเหตุ','Civic +1 · REP +1');
  case'library':{if(claimed(id))return toastMsg('ใช้ห้องสมุดวันนี้แล้ว');const keys=['business','finance','operations','marketing','hr','technology','law'];const key=keys[daySerial()%keys.length];mark(id);knowledge(key,1);reduceFatigue(3);return serviceResult('ห้องสมุดเมือง',`${key} Knowledge +1`)}
  case'course':return courseModal();
  case'career':return openView('jobs');
  case'buy_pass':if(transitFree())return toastMsg('มี Transit Pass ของเดือน ACC นี้แล้ว');if(!debit(300,'ACC Transit Pass รายเดือน','transit_pass'))return;c.transit.passMonth=monthSerial();return serviceResult('Transit Pass','เดินทางฟรีจนจบเดือน ACC นี้');
  case'express_delivery':return dailyWork(id,'งานส่งด่วน Transit Hub',240,['logistics','worker','freelance'],9,0,1);
 }
}
function housingModal(){const c=ensure();const current=c?.housing;const body=`<div class="tiny muted" style="margin-top:6px">${current?`ปัจจุบัน: ${esc(current.name)} · ค่าเช่า ${money(current.rent)}/เดือน ACC`:'เลือกที่พักเพื่อปลดล็อกการพักฟื้นที่บ้าน'}</div><div class="acc63-housing">${[
 ['basic','ห้องเช่าพื้นฐาน',1500,800,45],['standard','อพาร์ตเมนต์',5000,1800,60],['premium','คอนโด',15000,4500,80]
 ].map(([id,name,deposit,rent,rest])=>`<button class="acc63-choice" data-acc63-rent="${id}" data-name="${name}" data-deposit="${deposit}" data-rent="${rent}" data-rest="${rest}"><b>🏠 ${name}</b><small>แรกเข้า ${money(deposit+rent)} · ค่าเช่า ${money(rent)}/เดือน · Rest -${rest} Fatigue</small></button>`).join('')}</div>`;modal('เลือกที่พัก',body)}
function rentHousing(btn){const c=ensure();if(!c)return;const deposit=num(btn.dataset.deposit),rent=num(btn.dataset.rent),rest=num(btn.dataset.rest),cost=deposit+rent;if(!debit(cost,`ย้ายเข้า ${btn.dataset.name}`,'housing'))return;c.housing={id:btn.dataset.acc63Rent,name:btn.dataset.name,rent,rest,deposit,paidMonth:monthSerial()};q('#acc63Modal')?.remove();serviceResult('เช่าที่พัก',`${btn.dataset.name} · จ่ายแรกเข้า ${money(cost)}`)}
function payRent(){const c=ensure();if(!c?.housing)return toastMsg('ยังไม่มีที่พัก');if(num(c.housing.paidMonth)>=monthSerial())return toastMsg('จ่ายค่าเช่าเดือน ACC นี้แล้ว');if(!debit(c.housing.rent,`ค่าเช่า ${c.housing.name}`,'rent'))return;c.housing.paidMonth=monthSerial();serviceResult('ชำระค่าเช่า',`จ่าย ${money(c.housing.rent)} แล้ว`)}
function restHome(){const c=ensure();if(!c?.housing){if(claimed('public_shelter'))return toastMsg('ใช้ศูนย์พักพิงวันนี้แล้ว');mark('public_shelter');reduceFatigue(15);return serviceResult('ศูนย์พักพิง','พักฟรี · Fatigue -15')}if(num(c.housing.paidMonth)<monthSerial())return toastMsg('ค่าเช่าค้างอยู่ กรุณาชำระก่อนพัก');if(claimed('home_rest'))return toastMsg('พักที่บ้านวันนี้แล้ว');mark('home_rest');reduceFatigue(c.housing.rest);serviceResult('พักที่บ้าน',`Fatigue -${c.housing.rest}`)}
function courseModal(){const keys=[['business','ธุรกิจ'],['finance','การเงิน'],['operations','ปฏิบัติการ'],['marketing','การตลาด'],['hr','HR'],['technology','เทคโนโลยี'],['law','กฎหมาย']];modal('หลักสูตรระยะสั้น',`<div class="tiny muted" style="margin-top:6px">ค่าเรียน ฿600 / วิชา · ความรู้ +3</div><div class="acc63-housing">${keys.map(([k,n])=>`<button class="acc63-choice" data-acc63-course="${k}"><b>🎓 ${n}</b><small>อบรมระยะสั้น +3 Knowledge</small></button>`).join('')}</div>`)}
function takeCourse(key){if(!debit(600,'ค่าเรียน Education Center','education'))return;knowledge(key,3);q('#acc63Modal')?.remove();serviceResult('หลักสูตรระยะสั้น',`${key} Knowledge +3`)}
function openView(v){try{if(typeof setView==='function'){setView(v);return}}catch{}const b=q(`.desktop [data-view="${CSS.escape(v)}"],.sidebar [data-view="${CSS.escape(v)}"]`);if(b){b.click();return}const t=q('#view-'+CSS.escape(v));if(t){qa('.desktop .view').forEach(x=>x.classList.toggle('active',x===t));return}toastMsg('ไม่พบหน้าระบบนี้')}
function card(id,icon,title,desc,meta='',disabled=false,button='ใช้บริการ'){return`<div class="acc63-service"><div class="acc63-service-icon">${icon}</div><div class="acc63-service-main"><b>${esc(title)}</b><small>${esc(desc)}</small>${meta?`<span>${esc(meta)}</span>`:''}</div><button type="button" data-acc63-action="${id}" ${disabled?'disabled':''}>${esc(button)}</button></div>`}
function services(area){const c=ensure(),s=S();const d=dayClaims();switch(area){
 case'ACC Plaza':return[
  card('briefing','📰','City Briefing','รับข่าวสำคัญของเมืองประจำวัน','Civic +1 · REP +1',!!d.briefing,d.briefing?'รับแล้ว':'รับ Briefing'),
  card('plaza_courier','📄','งานส่งเอกสารเมือง','ส่งเอกสารระหว่างหน่วยงานใน Plaza',`${money(roleBonus(180,['worker','freelance','logistics','volunteer']))} · Fatigue +8`,!!d.plaza_courier,d.plaza_courier?'เสร็จแล้ว':'รับงาน'),
  card('chat','💬','Community Chat','พูดคุยกับคนในเมืองและเพื่อน','Realtime',false,'เปิดแชท')];
 case'Central Market':return[
  card('vendor_permit','🪪','Vendor Permit','ใบอนุญาตสำหรับผู้ขายในตลาด','ค่าธรรมเนียม ฿750',!!c.permits.vendor,c.permits.vendor?'มีแล้ว':'ทำใบอนุญาต'),
  card('market_delivery','📦','Market Delivery','งานส่งสินค้าของตลาด',`${money(roleBonus(260,['merchant','logistics','worker','service']))} · Fatigue +10`,!!d.market_delivery,d.market_delivery?'เสร็จแล้ว':'รับงาน'),
  card('market_pulse','📊','Market Pulse','ดูภาวะความต้องการของตลาดวันนี้','ข้อมูลฟรี',false,'ดูตลาด')];
 case'ACC Central Bank':return[
  card('bank','🏦','บริการธนาคาร','ฝาก ถอน โอน จ่าย และสินเชื่อ','ACC Central Bank',false,'เปิดธนาคาร'),
  card('credit_report','💳','Credit Report','ตรวจคะแนนเครดิตปัจจุบัน','ค่าบริการ ฿50',false,'ตรวจเครดิต'),
  card('finance_advice','🧠','คำปรึกษาการเงิน','คำแนะนำพื้นฐานจากเจ้าหน้าที่','Finance +1 · Civic +1',!!d.finance_advice,d.finance_advice?'รับแล้ว':'รับคำปรึกษา')];
 case'Employment Center':return[
  card('job_register','📝','ทะเบียนผู้หางาน','ลงทะเบียนเพื่อใช้บริการ Employment Center','ฟรี',c.jobSeeker,c.jobSeeker?'ลงทะเบียนแล้ว':'ลงทะเบียน'),
  card('emergency_shift','🧹','กะฉุกเฉินเมือง','งานชั่วคราวสำหรับผู้หางาน',`${money(roleBonus(320,['worker','service','logistics','volunteer']))} · Fatigue +12`,!!d.emergency_shift,d.emergency_shift?'เสร็จแล้ว':'รับกะ'),
  card('welfare','🤝','สวัสดิการฉุกเฉิน','ช่วยเหลือผู้มีสินทรัพย์ต่ำกว่า ฿1,500','฿500 / เดือน ACC',claimed('welfare','month'),claimed('welfare','month')?'รับแล้ว':'ตรวจสิทธิ์'),
  card('jobs','💼','Job Center','ดูงานปกติและกะงานทั้งหมด','ระบบงานหลัก',false,'เปิดงาน')];
 case'Sports District':return[
  card('sports','🏟️','สนามแข่งขัน','วิ่ง จักรยาน ม้า และกีฬาอื่น ๆ','Prize & Ranking',false,'เปิดกีฬา'),
  card('sport_practice','🏋️','Training Session','ฝึกเพิ่ม Sport Skill','฿50 · Fatigue +12 · REP +1',!!d.sport_practice,d.sport_practice?'ฝึกแล้ว':'ฝึก'),
  card('spectate','🎟️','Spectator Pass','ชมการแข่งขันในเขตกีฬา','฿30 · Civic +1',!!d.spectate,d.spectate?'เข้าชมแล้ว':'ซื้อบัตร')];
 case'Industrial Zone':return[
  card('safety','🦺','Safety Certificate','อบรมความปลอดภัยก่อนรับงานโรงงาน','฿250 · Operations +1',!!c.permits.industrial,c.permits.industrial?'มีแล้ว':'อบรม'),
  card('maintenance','🔧','Maintenance Contract','ซ่อมบำรุงเครื่องจักรและสายการผลิต',`${money(roleBonus(420,['maker','craft','logistics','worker']))} · Fatigue +15`,!!d.maintenance||!c.permits.industrial,!c.permits.industrial?'ต้องมี Safety':d.maintenance?'เสร็จแล้ว':'รับงาน'),
  card('company','🏢','โรงงาน & บริษัท','บริหารกิจการ การผลิต และพนักงาน','Company System',false,'เปิดบริษัท')];
 case'Event Square':{const ev=liveEvent();return[
  card('event_join','🎪',ev.name,ev.desc,`ค่าเข้า ฿100 · REP +${ev.rep} · Civic +${ev.civic}`,!!d.event_join,d.event_join?'เข้าร่วมแล้ว':'เข้าร่วม'),
  card('event_volunteer','🙋','Event Volunteer','ช่วยดูแลงานและผู้เข้าร่วม',`${money(roleBonus(280,['volunteer','event_host','community_host','creator']))} · Civic +2`,!!d.event_volunteer,d.event_volunteer?'เสร็จแล้ว':'อาสา'),
  card('leaderboard','🏆','City Rankings','ดูอันดับกิจกรรมและชื่อเสียงของเมือง','Leaderboard',false,'ดูอันดับ')]}
 case'City Hall':return[
  card('citizen_card','🪪','ACC Citizen Card','บัตรประชาชนสำหรับบริการราชการ','฿100',!!c.permits.citizen,c.permits.citizen?'มีแล้ว':'ออกบัตร'),
  card('business_permit','📜','Business Permit','ใบอนุญาตประกอบธุรกิจของเมือง','฿1,500 · ต้องมี Citizen Card',!!c.permits.business||!c.permits.citizen,c.permits.business?'มีแล้ว':!c.permits.citizen?'ต้องมีบัตร':'ขอใบอนุญาต'),
  card('civic_record','🏛️','Civic Record','ดูคะแนนพลเมืองและใบอนุญาตที่ถือ','ข้อมูลฟรี',false,'ดูข้อมูล')];
 case'Residential District':return[
  card('housing','🏠','Housing Office','เช่าห้อง อพาร์ตเมนต์ หรือคอนโด',c.housing?`${c.housing.name} · ${money(c.housing.rent)}/เดือน`:'ยังไม่มีที่พัก',false,c.housing?'เปลี่ยนที่พัก':'เช่าที่พัก'),
  card('pay_rent','🧾','ชำระค่าเช่า','ชำระทุกเดือน ACC',c.housing?`${money(c.housing.rent)} · ${num(c.housing.paidMonth)>=monthSerial()?'จ่ายแล้ว':'ค้างชำระ'}`:'ต้องมีที่พัก',!c.housing||num(c.housing.paidMonth)>=monthSerial(),!c.housing?'ยังไม่มีบ้าน':num(c.housing.paidMonth)>=monthSerial()?'จ่ายแล้ว':'จ่ายค่าเช่า'),
  card('rest_home','🛌','พักผ่อน','ลด Fatigue ที่บ้านหรือศูนย์พักพิง',c.housing?`Rest -${c.housing.rest} Fatigue`:'ศูนย์พักพิง -15 Fatigue',!!d.home_rest||!!d.public_shelter,(d.home_rest||d.public_shelter)?'พักแล้ว':'พัก')];
 case'ACC General Hospital':return[
  card('checkup','🩺','ตรวจสุขภาพ','ตรวจเบื้องต้นและลดความเหนื่อย','฿120 · Health +10 · Fatigue -10',!!d.checkup,d.checkup?'ตรวจแล้ว':'ตรวจ'),
  card('treatment','🚑','รักษาพยาบาล','รักษา Health ให้กลับเต็ม',c.health>=100?'Health เต็ม':`ค่าใช้จ่ายประมาณ ${money(Math.max(150,(100-c.health)*20))}`,c.health>=100,c.health>=100?'ไม่จำเป็น':'รักษา'),
  card('clinic_rest','🛏️','พักฟื้นคลินิก','พักฟื้นอย่างรวดเร็ว','฿300 · Fatigue -60',!!d.clinic_rest,d.clinic_rest?'พักแล้ว':'พักฟื้น')];
 case'Police HQ':{const heat=Math.round(num(s?.crimeV057?.heat));return[
  card('pay_fine','💸','ชำระค่าปรับ','เคลียร์ Heat และคดีค้าง',heat?`${money(Math.max(100,heat*25))} · Heat ${heat}`:'ไม่มี Heat',heat<=0,heat?'ชำระ':'ไม่มีค่าปรับ'),
  card('community_service','🧹','Community Service','ลด Heat โดยทำงานบริการสังคม','Heat -25 · Civic +2 · Fatigue +12',!!d.community_service,d.community_service?'ทำแล้ว':'เริ่มงาน'),
  card('report_incident','📞','แจ้งเหตุ','ช่วยเจ้าหน้าที่รายงานเหตุในพื้นที่','Civic +1 · REP +1',!!d.report_incident,d.report_incident?'แจ้งแล้ว':'แจ้งเหตุ')]}
 case'Education Center':return[
  card('library','📚','City Library','ศึกษาฟรีวันละหนึ่งครั้ง','Knowledge +1',!!d.library,d.library?'ศึกษาแล้ว':'อ่านหนังสือ'),
  card('course','🎓','Short Course','เลือกเรียนความรู้ที่ต้องใช้กับอาชีพ','฿600 · Knowledge +3',false,'เลือกวิชา'),
  card('career','🧭','Career Counseling','เชื่อมต่อไปยังงานและเส้นทางอาชีพ','ฟรี',false,'ดูงาน')];
 case'Transit Hub':return[
  card('buy_pass','🚌','Monthly Transit Pass','เดินทางทุกพื้นที่ฟรีตลอดเดือน ACC','฿300 / เดือน',transitFree(),transitFree()?'ใช้งานอยู่':'ซื้อ Pass'),
  card('express_delivery','⚡','Express Delivery','งานส่งด่วนระหว่างเขต',`${money(roleBonus(240,['logistics','worker','freelance']))} · Fatigue +9`,!!d.express_delivery,d.express_delivery?'เสร็จแล้ว':'รับงาน'),
  card('civic_record','🗺️','Transit Information','ค่าโดยสารปกติ ฿25 / เที่ยว',transitFree()?'เดือนนี้เดินทางฟรี':'ซื้อ Pass เพื่อประหยัด',false,'ดูสถานะ')];
 default:return[]}}
function syncHeader(){const area=AREAS[currentLocation()]||AREAS['ACC Plaza'];qa('#acc62CityDesktop .acc62-loc,#acc62CityMobile .acc62-loc').forEach(el=>{const html=`<div class="ico">${area.icon}</div><div><b>${esc(currentLocation())}</b><small>${esc(area.desc)}</small></div>`;if(el.innerHTML!==html)el.innerHTML=html})}
function renderPanel(root){const areaName=currentLocation(),area=AREAS[areaName]||AREAS['ACC Plaza'],c=ensure();if(!c||!root)return;const list=services(areaName);root.innerHTML=`<div class="acc63-head"><div><h3>${area.icon} บริการพื้นที่ · ${esc(areaName)}</h3><small>${esc(area.desc)} · สถานะพื้นที่: ${areaStatus(areaName)}</small></div><span class="acc63-open">● OPEN</span></div><div class="acc63-vitals"><span>❤️ Health <b>${Math.round(c.health)}</b></span><span>⚡ Fatigue <b>${Math.round(c.fatigue)}</b></span><span>🏛️ Civic <b>${Math.round(c.civic)}</b></span><span>🚌 ${transitFree()?'PASS ACTIVE':'Fare ฿25'}</span></div><div class="acc63-staff">${area.staff.map(n=>`<span>👤 ${esc(n)}</span>`).join('')}</div><div class="acc63-services">${list.join('')}</div><div class="acc63-transit"><div><b>🚌 City Transit</b><small>เดินทางไปบริการอื่น ๆ ของเมือง${transitFree()?' · Transit Pass ใช้งานอยู่':' · ฿25 / เที่ยว'}</small></div><select data-acc63-destination>${AREA_ORDER.map(a=>`<option value="${esc(a)}" ${a===areaName?'selected':''}>${AREAS[a].icon} ${esc(a)}</option>`).join('')}</select><button class="primary" data-acc63-travel>เดินทาง</button></div><div class="acc63-log"><b>กิจกรรมล่าสุด</b><span>${c.serviceLog[0]?`${esc(c.serviceLog[0].label)} · ${esc(c.serviceLog[0].detail||c.serviceLog[0].area)}`:'ยังไม่มีกิจกรรมบริการเมือง'}</span></div>`}
function addCss(){if(q('#acc-v063-css'))return;const st=document.createElement('style');st.id='acc-v063-css';st.textContent=`
#acc62CityDesktop .acc62-actions,#acc62CityMobile .acc62-actions{display:none!important}#acc62CityDesktop .acc62-grid>.acc62-panel:last-child,#acc62CityMobile .acc62-grid>.acc62-panel:last-child{display:none!important}.acc63-wrap{border:1px solid #2c4566;border-radius:17px;background:linear-gradient(150deg,#101c2c,#0a141f);padding:14px;margin:0 0 13px}.acc63-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.acc63-head h3{margin:0;font-size:16px}.acc63-head small{display:block;color:#8195ae;margin-top:3px}.acc63-open{font-size:9px;color:#62dfa1}.acc63-vitals{display:flex;gap:7px;overflow:auto;margin:10px 0}.acc63-vitals span,.acc63-staff span{white-space:nowrap;border:1px solid #233852;border-radius:999px;background:#0b1622;padding:5px 8px;font-size:9px;color:#9bb0c9}.acc63-vitals b{color:#eef6ff}.acc63-staff{display:flex;gap:6px;overflow:auto;margin-bottom:10px}.acc63-services{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.acc63-service{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:8px;align-items:center;border:1px solid #20344e;border-radius:12px;background:#0b1521;padding:9px}.acc63-service-icon{width:38px;height:38px;border-radius:11px;background:#172841;display:grid;place-items:center;font-size:20px}.acc63-service-main{min-width:0}.acc63-service-main b{display:block;font-size:11px}.acc63-service-main small{display:block;color:#7f93ad;font-size:9px;margin-top:2px;line-height:1.35}.acc63-service-main span{display:block;color:#9fc0e7;font-size:9px;margin-top:4px}.acc63-service button{min-height:36px;font-size:9px;white-space:nowrap}.acc63-transit{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,.7fr) auto;gap:8px;align-items:center;border-top:1px solid #20334b;margin-top:11px;padding-top:11px}.acc63-transit small{display:block;color:#7f93ad;font-size:9px;margin-top:2px}.acc63-transit select{min-width:0;background:#09131f;color:#eaf3ff;border:1px solid #29405d;border-radius:9px;padding:9px}.acc63-log{display:flex;justify-content:space-between;gap:10px;margin-top:9px;padding-top:9px;border-top:1px solid #1d2d43;font-size:9px;color:#8296ae}.acc63-log b{color:#b7cae2}.acc63-modal{position:fixed;inset:0;z-index:520;background:rgba(2,6,11,.76);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(7px)}.acc63-dialog{width:min(600px,100%);max-height:88vh;overflow:auto;border:1px solid #304867;border-radius:18px;background:#0d1622;padding:15px}.acc63-housing{display:grid;gap:8px;margin-top:10px}.acc63-choice{text-align:left;padding:11px;border:1px solid #263c58;border-radius:11px;background:#101b2a;color:#edf5ff}.acc63-choice b,.acc63-choice small{display:block}.acc63-choice small{color:#8296ae;margin-top:4px}
@media(max-width:900px){.acc63-services{grid-template-columns:1fr}.acc63-transit{grid-template-columns:1fr auto}.acc63-transit>div{grid-column:1/-1}}
@media(max-width:820px){.acc63-wrap{padding:11px;border-radius:14px}.acc63-service{grid-template-columns:38px minmax(0,1fr)}.acc63-service button{grid-column:1/-1;width:100%;min-height:44px}.acc63-transit{grid-template-columns:1fr}.acc63-transit>div{grid-column:auto}.acc63-transit button{min-height:44px}.acc63-dialog{align-self:flex-end;border-radius:18px 18px 0 0}.acc63-modal{align-items:flex-end;padding:0}.acc63-log{flex-direction:column;gap:3px}}
`;document.head.appendChild(st)}
function ensureUi(){addCss();const d=q('#acc62CityDesktop');if(d&&!q('#acc63AreaServicesDesktop')){const x=document.createElement('div');x.id='acc63AreaServicesDesktop';x.className='acc63-wrap';d.insertAdjacentElement('afterend',x)}const m=q('#acc62CityMobile');if(m&&!q('#acc63AreaServicesMobile')){const x=document.createElement('div');x.id='acc63AreaServicesMobile';x.className='acc63-wrap';m.insertAdjacentElement('afterend',x)}}
function render(force=false){const s=S(),c=ensure();if(!s||!c)return;ensureUi();syncHeader();const sig=JSON.stringify([currentLocation(),s.wallet,s.bank,s.rep,s.creditScore,s.crimeV057?.heat,c.health,c.fatigue,c.civic,c.sportSkill,c.permits,c.housing,c.transit,daySerial(),monthSerial(),s.companyV060?.knowledge]);if(!force&&sig===lastSig)return;lastSig=sig;renderPanel(q('#acc63AreaServicesDesktop'));renderPanel(q('#acc63AreaServicesMobile'));const b=q('#acc-build-badge');if(b)b.textContent=`ACC City ${BUILD}`}
document.addEventListener('click',e=>{if(e.target.closest('[data-acc63-close]')){q('#acc63Modal')?.remove();return}const a=e.target.closest('[data-acc63-action]');if(a){action(a.dataset.acc63Action);return}const r=e.target.closest('[data-acc63-rent]');if(r){rentHousing(r);return}const co=e.target.closest('[data-acc63-course]');if(co){takeCourse(co.dataset.acc63Course);return}const t=e.target.closest('[data-acc63-travel]');if(t){const root=t.closest('.acc63-wrap');const sel=root?.querySelector('[data-acc63-destination]');if(sel)travel(sel.value);return}});
function start(){render(true);setTimeout(()=>render(true),1200);setTimeout(()=>render(true),3500);setInterval(()=>{ensureUi();syncHeader();render(false)},4000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
