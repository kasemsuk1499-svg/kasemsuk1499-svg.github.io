/*
  รายชื่อการ์ดเสริมแบบ 1 ใบต่อ 1 โฟลเดอร์

  วิธีเพิ่มการ์ดใหม่:
  1) สร้างโฟลเดอร์: card/3001/
  2) สร้างไฟล์: card/3001/card.js
  3) ใส่ 3001 ใน ACC_CARD_MANIFEST ด้านล่าง

  หมายเหตุ: GitHub Pages/เว็บสแตติกไม่สามารถไล่อ่านรายชื่อโฟลเดอร์เองได้
  จึงต้องมี manifest นี้เพื่อบอกเกมว่าต้องโหลดโฟลเดอร์ไหนบ้าง
*/
window.ACC_CARD_VERSION = "2026-07-07-split-card-data-v1";
window.ACC_CARD_ROOT = "card";
window.ACC_CARD_MANIFEST = [
  // ตัวอย่าง:
  // 3001,
  // 3002,
  // หรือ { id: 3003, src: "card/3003/card.js" },
];
