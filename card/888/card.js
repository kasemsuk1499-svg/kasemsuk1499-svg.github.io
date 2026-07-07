ACC_REGISTER_CARD({
  id: 888,
  name: "เมกุมินเด็กฝึกงาน",
  rarity: "EX",
  element: "ไฟ",
  power: 120000,
  hp: 480000,
  defense: 38000,
  incomePerSec: 1200,
  upgradeDustBase: 1500,
  upgradeDustGrowth: 1.06,
  awakenMax: 12,
  icon: "",
  image: "card/888/888.png",
  poster: "card/888/888.png",
  video: "card/888/888.mp4",

  abilities: [
    {
      name: "เงินเดือนนี้สำหรับ EXPLOSION",
      description: "เมกุมินจะเพิ่มเงินเดือนให้ตัวเอง 20% เมื่อจัดทีมคู่กับ ผู้จัดการอาเรีย",
      activeIn: ["team"],
      effects: [
        {
          type: "selfIncomeRate",
          value: 0.2,
          targetSide: "self"
        }
      ],
      condition: {
        requiredCardIds: [889]
      }
    },
    {
      name: "EXPLOSION นี้เพื่อหัวหน้า",
      description: "เมื่อโจมตีถึงครั้งที่ 5 เมกุมินจะทำการ EXPLOSION ใส่ศัตรู 5 เป้าหมาย ดาเมจ 1000% เจาะเกราะ 40% และมีโอกาสติดเผาไหม้ 30% นาน 2 เทิร์น ",
      activeIn: ["team", "tower", "arena"],
      effects: [
        {
          type: "nextAttackTargetCount",
          value: 5
        },
        {
          type: "nextAttackPowerRate",
          value: 10,
          targetSide: "self"
        },
        {
          type: "defensePenetrationRate",
          value: 0.4
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          targetSelection: "all",
          status: "burn",
          successRate: 0.3,
          targetCount: 5,
          durationTurns: 2,
          damageRate: 0.3
        }
      ],
      condition: {
        afterOwnAttacks: 4,
        repeat: true
      }
    }
  ]
});