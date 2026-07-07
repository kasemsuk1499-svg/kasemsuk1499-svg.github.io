# Anime Card Collection — Split Card Data

โครงสร้างนี้แยกข้อมูลการ์ดออกจาก `index.html` แล้ว

## ไฟล์สำคัญ

- `index.html` = โค้ดเกมหลัก
- `card/card-data.js` = ข้อมูลการ์ดเดิมทั้งหมด
- `card/card-manifest.js` = รายชื่อโฟลเดอร์การ์ดใหม่ที่ต้องโหลด
- `card/card-loader.js` = ตัวโหลดการ์ดใหม่ตาม manifest
- `card/_template/card.js` = ตัวอย่างไฟล์การ์ดใหม่

## เพิ่มการ์ดใหม่แบบ 1 ใบต่อ 1 โฟลเดอร์

1. สร้างโฟลเดอร์ เช่น `card/3001/`
2. สร้างไฟล์ `card/3001/card.js`
3. ใส่ข้อมูลแบบนี้:

```js
ACC_REGISTER_CARD({
  id: 3001,
  name: "ชื่อตัวละครใหม่",
  rarity: "UR",
  element: "ไฟ",
  power: 120000,
  hp: 480000,
  defense: 38000,
  incomePerSec: 1200,
  upgradeDustBase: 1500,
  upgradeDustGrowth: 1.06,
  awakenMax: 12,
  image: "card/3001/3001.png",
  poster: "card/3001/3001.png",
  video: "card/3001/3001.mp4",
  abilities: []
});
```

4. เปิด `card/card-manifest.js` แล้วเพิ่ม ID:

```js
window.ACC_CARD_MANIFEST = [
  3001,
];
```

หมายเหตุ: เว็บที่รันบน GitHub Pages ไม่สามารถสแกนรายชื่อโฟลเดอร์เองได้ จึงต้องมี manifest เพื่อบอกว่ามีการ์ดใหม่โฟลเดอร์ไหนบ้าง

ถ้าใช้ชื่อไฟล์สั้น เช่น `image: "3001.png"` เกมจะไปหาใน `assets/cards/3001.png` ตามระบบเดิม แต่ถ้าวางไฟล์ไว้ในโฟลเดอร์การ์ด ให้ใส่ path เต็ม เช่น `card/3001/3001.png`
