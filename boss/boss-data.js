// World Boss base data (แยกจากการ์ดคอลเลกชัน)
// ใส่บอสพื้นฐานไว้ตรงนี้ได้ หรือปล่อยว่างแล้วใช้ boss-manifest.js โหลด boss/<id>/boss.js แทน
window.ACC_BOSS_DATA = window.ACC_BOSS_DATA || [];
window.ACC_BOSS_DATA.push({
    id: "WB-BASE-001",
    name: "Abyss Dragon",
    title: "บอสโลกตัวอย่าง",
    description: "บอสพื้นฐานจาก boss/boss-data.js • HP หมดแล้วยังตีต่อเพื่อสะสมคะแนนได้",
    rarity: "WORLD_BOSS",
    element: ["ความมืด", "ไฟ"],
    image: "abyss_dragon.png",
    power: 1800000,
    hp: 65000000,
    defense: 420000,
    speed: 85,
    attackHits: 1,
    shieldHits: 2,
    criticalRate: 0.08,
    scoreMultiplier: 1,
    abilities: [
      {
        name: "เปลวเพลิงห้วงลึก",
        description: "ทุก 4 เทิร์น บอสเพิ่ม ATK +25% และเพิ่มฮิต +1 ในเทิร์นนั้น",
        condition: { everyTurns: 4 },
        effects: [
          { type: "bossPowerRate", value: 0.25 },
          { type: "bossAttackHits", value: 1 }
        ]
      }
    ]
});
