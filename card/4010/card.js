ACC_REGISTER_CARD({
  id: 4010,
  name: "อุจิวะ อิทาจิ",
  rarity: "EX",
  element: [
    "ความมืด",
    "ไฟ"
  ],
  balanceSchemaVersion: 4,
  power: 24000,
  hp: 150000,
  defense: 12000,
  speed: 106,
  incomePerSec: 330,
  normalAttackTargetCount: 2,
  targetSelection: "default",
  upgradeDustBase: 1107,
  upgradeDustGrowth: 1.017,
  awakenMax: 20,
  image: "card/4010/4010.png",
  scCutscene: {
    enabled: true,
    kicker: "THE ETERNAL NIGHT DESCENDS",
    quote: "ต่อให้ต้องแบกรับความเกลียดชังทั้งหมด... ฉันก็จะปกป้องสิ่งสำคัญ",
    subtitle: "ความจริงที่ถูกซ่อนไว้ กำลังลืมตาขึ้นอีกครั้ง",
    video: "card/4010/4010op.mp4",
    revealKicker: "THE TRUTH BEHIND THE SHADOW",
    revealTitle: "อุจิวะ อิทาจิ — ผู้แบกรับความมืด",
    revealText: "ผู้ยอมกลายเป็นคนทรยศ เพื่อปกป้องหมู่บ้านและน้องชายเพียงคนเดียว",
    accent: "#8a0000",
    accent2: "#350303",
    introMs: 2200,
    maxVideoMs: 14000,
    revealMs: 1900,
    objectFit: "cover",
    objectPosition: "center center",
    muted: false,
    volume: 0.9,
    showCardAfterVideo: true
  },
 abilities: [
  {
    name: "ผู้แบกรับความมืด",
    description: "เมื่อเริ่มการต่อสู้ อิทาจิได้รับอัตราหลบหลีก 30% เมื่อได้รับความเสียหายถึงตาย จะคืนชีพในร่างอมตะที่คงอยู่ได้ 10 ฮิต พร้อมได้รับอัตราหลบหลีกเพิ่มอีก 30% การโจมตีครั้งถัดไปสร้างความเสียหาย 1500% และทำให้เป้าหมายติดสตัน 100% เป็นเวลา 10 เทิร์น",
    activeIn: [
      "team",
      "tower",
      "arena",
      "worldBoss"
    ],
    effects: [
      {
        type: "dodgeRate",
        value: 0.3,
        targetSide: "self",
        targetSelection: "all"
      },
      {
        type: "reviveHitLife",
        value: 0.03,
        targetSide: "self",
        surviveHits: 10,
        condition: {
          onDeath: true
        },
        targetSelection: "all"
      },
      {
        type: "dodgeRate",
        value: 0.3,
        targetSide: "self",
        condition: {
          onDeath: true
        },
        targetSelection: "all"
      },
      {
        type: "nextAttackPowerRate",
        value: 15,
        targetSide: "self",
        condition: {
          onDeath: true
        },
        targetSelection: "all"
      },
      {
        type: "applyStatus",
        targetSide: "enemy",
        targetSelection: "hitTargets",
        status: "stun",
        successRate: 1,
        targetCount: 1,
        durationTurns: 10,
        condition: {
          afterReviveNextAttack: true
        }
      }
    ],
    attackTargetCount: 1
  },
  {
    name: "เทวีสุริยา: อามาเทราสึ",
    description: "ทุกครั้งที่อิทาจิโจมตีครบ 5 ครั้ง จะปลดปล่อยเพลิงทมิฬโจมตีศัตรู 3 เป้าหมาย สร้างความเสียหาย 300% และเจาะเกราะ 20% มีโอกาส 50% ทำให้ติดเผาไหม้, 30% ทำให้ติดเลือดไหล และ 10% ทำให้ติดเดธ เป็นเวลา 2 เทิร์น",
    activeIn: [
      "team",
      "tower",
      "arena",
      "worldBoss"
    ],
    effects: [
      {
        type: "nextAttackPowerRate",
        value: 3,
        targetSide: "self",
        targetSelection: "all"
      },
      {
        type: "defensePenetrationRate",
        value: 0.2,
        targetSide: "enemy",
        targetSelection: "hitTargets"
      },
      {
        type: "applyStatus",
        targetSide: "enemy",
        targetSelection: "hitTargets",
        status: "burn",
        successRate: 0.5,
        targetCount: 3,
        durationTurns: 2,
        damageRate: 0.2
      },
      {
        type: "applyStatus",
        targetSide: "enemy",
        targetSelection: "hitTargets",
        status: "bleed",
        successRate: 0.3,
        targetCount: 3,
        durationTurns: 2,
        hpLossRate: 0.1
      },
      {
        type: "applyStatus",
        targetSide: "enemy",
        targetSelection: "hitTargets",
        status: "death",
        successRate: 0.1,
        targetCount: 3,
        durationTurns: 2,
        deathAfterAttacks: 2
      }
    ],
    attackTargetCount: 3,
    condition: {
      afterOwnAttacks: 4
    }
  }
]
});