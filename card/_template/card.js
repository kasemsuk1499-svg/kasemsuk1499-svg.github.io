/*
  ตัวอย่างไฟล์การ์ดใหม่
  ตำแหน่งแนะนำ: card/3001/card.js
  จากนั้นเพิ่ม 3001 ใน card/card-manifest.js
*/
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
  icon: "",
  // ถ้าวางรูป/วิดีโอไว้ในโฟลเดอร์เดียวกับไฟล์นี้ ให้ใส่ path เต็มแบบนี้
  image: "card/3001/3001.png",
  poster: "card/3001/3001.png",
  video: "card/3001/3001.mp4",
  abilities: [
    {
      name: "ชื่อสกิล",
      description: "คำอธิบายสกิล",
      activeIn: ["team", "tower", "arena"],
      effects: [
        { type: "attackRate", value: 0.10, targetSide: "ally" }
      ]
    }
  ]
});
