ACC_REGISTER_CARD({
  id: 10000,
  name: "มิยะโกะ ซีซี่",
  rarity: "GOD",
  element: [
    "ไฟ",
    "ความมืด",
    "มิติ",
    "แสง"
  ],
  balanceSchemaVersion: 4,
  power: 10200,
  hp: 2000000,
  defense: 3000000,
  speed: 9876,
  incomePerSec: 14031499,
  normalAttackTargetCount: 3,
  upgradeDustBase: 1800,
  upgradeDustGrowth: 1.0175,
  awakenMax: 20,
  icon: "",
  image: "card/10000/10000.png",
  abilities: [
    {
      name: "แวมไพร์ที่อยู่มาหมื่นๆปี",
      description: "ทุกครั้งที่โจมตี จะฟื้นฟูเลือด 50% และตีเลือดไหลอัตรา 100% นาน 2 เทิร์น",
      activeIn: [
        "team",
        "tower",
        "arena"
      ],
      attackTargetCount: 3,
      effects: [
        {
          type: "healHpRate",
          targetSide: "self",
          value: 0.5
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          targetSelection: "random",
          targetCount: 3,
          status: "bleed",
          successRate: 1,
          durationTurns: 2,
          hpLossRate: 0.1
        }
      ],
      condition: {
        onOwnAttack: true
      },
      activeCutscene: {
        enabled: false
      }
    },
    {
      name: "แวมไพร์กลายพันธ์",
      description: "เพิ่มเบสเลือดให้ตนเอง 5000% และ DEF 5000% เมื่อตาย จะคืนชีพเป็นอมตะ 30 เทิร์น",
      activeIn: [
        "team",
        "tower",
        "arena"
      ],
      attackTargetCount: 1,
      effects: [
        {
          type: "selfHpRate",
          value: 50
        },
        {
          type: "selfDefenseRate",
          value: 50
        },
        {
          type: "reviveTimedUndying",
          targetSide: "self",
          value: 1,
          hpRate: 1,
          durationTurns: 30,
          maxTriggers: 1,
          condition: {
            onDeath: true
          }
        }
      ]
    },
    {
      name: "กริดราคะ",
      description: "ทุกครั้งที่ตี จะยั่วยุเป้าหมาย 2 เทิร์น และมีโอกาสติดสถานะเดธ 10%",
      activeIn: [
        "team",
        "tower",
        "arena"
      ],
      attackTargetCount: 1,
      effects: [
        {
          type: "taunt",
          targetSide: "self",
          durationTurns: 2,
          targetSelection: "random",
          targetCount: 1
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          targetSelection: "random",
          targetCount: 1,
          status: "death",
          successRate: 0.1,
          deathAfterAttacks: 2
        }
      ],
      condition: {
        onOwnAttack: true
      },
      activeCutscene: {
        enabled: false
      }
    }
  ]
});
