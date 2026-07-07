ACC_REGISTER_BOSS({
  id: "WB-10001",
  name: "Demon Lord Megalo",
  title: "บอสโลกประจำวัน",
  description: "ตัวอย่างบอสแยกไฟล์จาก boss/10001/boss.js",
  rarity: "WORLD_BOSS",
  element: ["มิติ", "ความมืด"],
  image: "10001.png",
  power: 2400000,
  hp: 90000000,
  defense: 560000,
  speed: 92,
  attackHits: 2,
  shieldHits: 3,
  criticalRate: 0.12,
  scoreMultiplier: 1.15,
  abilities: [
    {
      name: "คลื่นมิติทลายแนวหน้า",
      description: "ทุก 5 เทิร์น บอสเพิ่ม ATK +40%, เพิ่มฮิต +1 และทำดาเมจใส่ผู้เล่นแรงขึ้น 10%",
      condition: { everyTurns: 5 },
      effects: [
        { type: "bossPowerRate", value: 0.40 },
        { type: "bossAttackHits", value: 1 },
        { type: "playerDamageTakenRate", value: 0.10 }
      ]
    },
    {
      name: "เกราะราชันอสูร",
      description: "เมื่อ HP บอสต่ำกว่า 50% บอสเพิ่ม DEF +35% ในเทิร์นที่สกิลทำงาน",
      condition: { everyTurns: 3, hpBelowRate: 0.5 },
      effects: [
        { type: "bossDefenseRate", value: 0.35 }
      ]
    }
  ]
});
