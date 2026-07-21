ACC_REGISTER_CARD({
  id: 3002,
  name: "เอลฟาเรีย",
  rarity: "EX",
  element: "น้ำแข็ง",
  balanceSchemaVersion: 4,
  power: 12000,
  hp: 300000,
  defense: 10000,
  speed: 107,
  incomePerSec: 330,
  normalAttackTargetCount: 2,
  targetSelection: "default",
  upgradeDustBase: 1107,
  upgradeDustGrowth: 1.017,
  awakenMax: 20,
  image: "card/3002/3002.png",
  poster: "card/3002/3002.png",
  video: "card/3002/3002.mp4",
  scCutscene: {
    enabled: true,
    kicker: "The Secluded Ice Princess",
    quote: "จากนี้ไม่ต้องพยายามอยู่คนเดียวแล้วนะ วิล ฉันจะอยู่ข้างนายเอง",
    subtitle: "Albis Vina",
    video: "card/3002/elfa.mp4",
    revealKicker: "Albis Vina",
    revealTitle: "EX เอลฟาเรีย",
    accent: "#8adaf5",
    accent2: "#c1dcd2",
    introMs: 3000,
    maxVideoMs: 48000,
    revealMs: 1900,
    objectFit: "cover",
    objectPosition: "center center",
    muted: false,
    volume: 0.9,
    showCardAfterVideo: true
  },
  abilities: [
    {
      name: "พรสวรรค์แห่งคทา",
      description: "เมื่อเริ่มต่อสู้ตนเองจะได้รับโล่ +10 และ การโจมตีปกติมีโอกาสติดสถานะแช่แข็ง 30 %",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "shieldHits",
          value: 10,
          effectOperation: "increase",
          targetSide: "self",
          targetSelection: "all"
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          condition: {
            onOwnAttack: true
          },
          targetSelection: "hitTargets",
          status: "freeze",
          successRate: 0.3,
          targetCount: 2
        }
      ]
    },
    {
      name: "เอลวัน: อาร์ส ไวส์",
      description: "ทุกๆการโจมตี 4 ครั้ง เอลฟาเรียจะสร้างร่างโคลนน้ำแข็งตัวเอง 1 ร่าง สูงสุด 5 ร่าง และตัวเองได้รับโล่ 1",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "splitClone",
          targetSelection: "all",
          count: 1,
          slotPolicy: "anyAvailable",
          successRate: 1,
          powerRate: 0.5,
          hpRate: 0.5,
          defenseRate: 0.5,
          speedRate: 1,
          normalAttackTargetCount: 3,
          canUseAbilities: false,
          maxSpawnDepth: 1,
          inheritAbilities: false,
          maxActiveClones: 5,
          cloneGroupKey: "elfariaclone",
          cloneAbilities: []
        },
        {
          type: "restoreShieldHits",
          value: 1,
          effectOperation: "increase",
          targetSide: "self",
          targetSelection: "all"
        }
      ],
      condition: {
        afterOwnAttacks: 3
      },
      activeCutscene: {
        enabled: true,
        kicker: "ACTIVE SKILL",
        title: "เอลวัน: อาร์ส ไวส์",
        video: "card/3002/3002at1.mp4",
        accent: "#00ffe1",
        accent2: "#97e1ed",
        durationMs: 1200,
        maxVideoMs: 15000,
        objectFit: "cover",
        objectPosition: "center center",
        muted: false,
        volume: 0.8,
        showHitCount: true
      }
    },
{
  name: "สเตลลาส นาเทีย",
  description: "ทุกการโจมตีครั้งที่ 5 จะโจมตีด้วยหอกน้ำแข็ง ดาเมจ 3200% เจาะเกราะ 60% และแช่แข็ง 100% 1 เป้าหมาย",
  activeIn: [
    "team",
    "tower",
    "arena",
    "worldBoss"
  ],
  effects: [
    {
      type: "nextAttackPowerRate",
      value: 32,
      effectOperation: "increase",
      targetSide: "self"
    },
    {
      type: "defensePenetrationRate",
      value: 0.6,
      effectOperation: "increase",
      targetSide: "enemy",
      targetSelection: "hitTargets"
    },
    {
      type: "applyStatus",
      targetSide: "enemy",
      targetSelection: "hitTargets",
      status: "freeze",
      successRate: 1,
      targetCount: 1
    }
  ],
  attackTargetCount: 1,
  condition: {
    afterOwnAttacks: 4
  },
      activeCutscene: {
        enabled: true,
        kicker: "ACTIVE SKILL",
        title: "สเตลลาส นาเทีย",
        quote: "หอกน้ำแข็ง",
        video: "card/3002/3002at2.mp4",
        accent: "#a4f4fe",
        accent2: "#daeaec",
        durationMs: 1200,
        maxVideoMs: 10000,
        objectFit: "cover",
        objectPosition: "center center",
        muted: false,
        volume: 0.8,
        showHitCount: true
      }
    }
  ]
});
