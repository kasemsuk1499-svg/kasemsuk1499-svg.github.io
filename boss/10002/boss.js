ACC_REGISTER_BOSS({
  id: "WB-10002",
  name: "Celestial Leviathan",
  title: "บอสโลกธาตุน้ำแข็ง",
  description: "ตัวอย่างบอสอีกตัว ใช้สุ่มประจำวันร่วมกับบอสอื่นใน manifest",
  rarity: "WORLD_BOSS",
  element: ["น้ำ", "น้ำแข็ง"],
  image: "10002.png",
  power: 2100000,
  hp: 78000000,
  defense: 610000,
  speed: 76,
  attackHits: 1,
  shieldHits: 4,
  criticalRate: 0.06,
  scoreMultiplier: 1.05,
  abilities: [
    {
      name: "กระแสน้ำแข็งกลืนสนาม",
      description: "ทุก 4 เทิร์น บอสเพิ่ม DEF +30% และลดคะแนนที่ได้ในเทิร์นนั้น 10%",
      condition: { everyTurns: 4 },
      effects: [
        { type: "bossDefenseRate", value: 0.30 },
        { type: "scoreRate", value: -0.10 }
      ]
    },
    {
      name: "คลื่นยักษ์",
      description: "ทุก 6 เทิร์น บอสเพิ่ม ATK +30% และเพิ่มฮิต +2",
      condition: { everyTurns: 6 },
      effects: [
        { type: "bossPowerRate", value: 0.30 },
        { type: "bossAttackHits", value: 2 }
      ]
    }
  ]
});
