ACC_REGISTER_CARD({
  id: 3001,
  name: "วิล เซอร์ฟอส",
  rarity: "EX",
  element: "ไร้ธาตุ",
  balanceSchemaVersion: 4,
  power: 50000,
  hp: 200000,
  defense: 15000,
  speed: 107,
  incomePerSec: 264,
  normalAttackTargetCount: 1,
  normalAttackHits: 1,
  upgradeDustBase: 1107,
  upgradeDustGrowth: 1.017,
  awakenMax: 20,
  icon: "",
  image: "card/3001/3001.png",
  poster: "card/3001/3001.png",
  video: "card/3001/3001.mp4",
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
      name: "วิสความกล้า",
      description: "เมื่อการ์ดใบนี้ตายลง จะคืนชีพเป็นอมตะ 5 เทิร์น และจะเปลี่ยนโจมตีปกติเป็น 5 เป้าหมาย 9 ฮิต หลังคืนชีพแล้ว หากมี เอลฟาเรีย หรือ จูเรียส ในทีม ทุกครั้งที่โจมตีจะมีโอกาสแช่แข็งศัตรู 50%",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "reviveTimedUndying",
          value: 1,
          targetSide: "self",
          durationTurns: 5,
          maxTriggers: 1,
          reviveAttackTargetCount: 5,
          reviveAttackHits: 9,
          condition: {
            onDeath: true,
            maxTriggers: 1
          }
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          condition: {
            onOwnAttack: true,
            sourceRevived: true,
            anyTeammateCardNames: [
              "เอลฟาเรีย",
              "จูเรียส"
            ]
          },
          targetSelection: "random",
          targetCount: 5,
          status: "freeze",
          successRate: 0.5,
          durationTurns: 1
        }
      ],
      activeCutscene: {
        enabled: false
      }
    }
  ],
  "scCutscene": {
    "kicker": "จะรีบไปอยู่ข้างเธอเอลฟี่...",
    "quote": "ไม่ว่าจะต้องทำอะไร... ฉันจะไม่ยอมแพ้แล้วไปหาเธอ!",
    "subtitle": "WIZ Active call!",
    "video": "card/3001/Willop.mp4",
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
    "revealTitle": "MYSTICAL · Wil Serfors"
  }
});
