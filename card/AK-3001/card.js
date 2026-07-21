ACC_REGISTER_CARD({
  id: "AK-3001",
  name: "วิล เซอร์ฟอส",
  rarity: "AWAKEN",
  element: "ไร้ธาตุ",
  balanceSchemaVersion: 4,
  awakenSourceId: 3001,
  originalCardId: 3001,
  abilityIdentityId: 3001,
  transformOnly: true,
  power: 17500,
  hp: 250000,
  defense: 20000,
  speed: 109,
  incomePerSec: 330,
  normalAttackTargetCount: 3,
  targetSelection: "default",
  upgradeDustBase: 1450,
  upgradeDustGrowth: 1.0175,
  awakenMax: 20,
  icon: "",
  image: "card/AK-3001/AK-3001.png",
  poster: "card/AK-3001/AK-3001.png",
  video: "card/AK-3001/AK-3001.mp4",
  abilities: [
    {
      name: "พรสวรรค์แห่งดาบ",
      description: "เพิ่มอัตราติดคริ 75% และความเสียหายคริ 200% เพิ่มต้านสถานะ 80% ตลอดเวลา และเพิ่ม ATK 2% ทุกครั้งที่โจมตี",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "criticalRate",
          value: 0.75,
          targetSide: "self"
        },
        {
          type: "criticalDamageRate",
          value: 2,
          targetSide: "self"
        },
        {
          type: "statusResistance",
          value: 0.8,
          targetSide: "self",
          scope: "target"
        },
        {
          type: "powerRateStack",
          value: 0.02,
          targetSide: "self",
          condition: {
            onOwnAttack: true
          },
          maxStacks: 99,
          stackKey: "will-sword-talent-atk"
        }
      ],
      activeCutscene: {
        enabled: false
      }
    },
    {
      name: "วิสเซอร์อบิส",
      description: "หากจัดทีมร่วมกับใครก็ตามที่มีสกิล 'พรสวรรค์แห่งคทา' ก็อปปี้สกิลนั้นของตัวผู้ใช้งานทันที และ ตนเองจะได้รับ ATK/HP/DEF + 20% ต่อเพื่อนร่มทีมที่มีสกิลนั้น",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      attackTargetCount: 1,
      effects: [
        {
          type: "selfPowerRate",
          value: 0.2,
          stackSource: "matchingTeammateCount",
          stackApplyMode: "auto",
          countCardIds: [
            3002,
            3003,
            3004,
            3005,
            3006,
            3007,
            3008,
            3009,
            3010,
            26
          ],
          targetSelection: "all"
        },
        {
          type: "selfHpRate",
          value: 0.2,
          stackSource: "matchingTeammateCount",
          stackApplyMode: "auto",
          countCardIds: [
            3002,
            3003,
            3004,
            3005,
            3006,
            3007,
            3008,
            3009,
            3010,
            26
          ],
          targetSelection: "all"
        },
        {
          type: "selfDefenseRate",
          value: 0.15,
          stackSource: "matchingTeammateCount",
          stackApplyMode: "auto",
          countCardIds: [
            3002,
            3003,
            3004,
            3005,
            3006,
            3007,
            3008,
            3009,
            3010,
            26
          ],
          targetSelection: "all"
        },
        {
          type: "copyAbilities",
          targetSide: "teammates",
          targetSelection: "all",
          successRate: 1,
          abilitySelection: "specific",
          abilityNames: [
            "พรสวรรค์แห่งคทา"
          ],
          recipientSide: "self"
        }
      ]
    },
{
  name: "ความหวัง",
  description: "เมื่อหมดสภาพจากการต่อสู้ จะคืนชีพตัวเองด้วย HP 1% และเป็นอมตะ 10 เทิร์น พร้อมมอบโล่ 10 ฮิตให้พวกพ้องทั้งหมด",
  activeIn: [
    "team",
    "tower",
    "arena",
    "worldBoss"
  ],
  attackTargetCount: 1,

  condition: {
    onDeath: true,
    maxTriggers: 1
  },

  effects: [
    {
      type: "reviveTimedUndying",
      value: 0.01,
      targetSide: "self",
      durationTurns: 10,
      maxTriggers: 1
    },
    {
      type: "shieldHits",
      value: 10,
      targetSide: "teammates",
      targetSelection: "all"
    }
  ]
    }
  ],
  "scCutscene": {
    "kicker": "WIZ AWAKENING",
    "quote": "เพื่อที่จะได้เคียงข้าง...ฉันจำเป็นต้องแข็งแกร่งขึ้น",
    "subtitle": "AWAKEN",
    "video": "Willop.mp4",
    "poster": "",
"accent": "#e0f7ff",
"accent2": "#ffffff",
    "introMs": 4000,
    "maxVideoMs": 90000,
    "revealMs": 4000,
    "objectFit": "cover",
    "objectPosition": "center center",
    "muted": false,
    "volume": 0.5,
    "showCardAfterVideo": true,
    "revealKicker": "HOPE OF WISTORIA",
    "revealTitle": "Wil Serfors"
  }
});
