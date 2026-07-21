ACC_REGISTER_CARD({
  id: "AK-3002",
  name: "เอลฟาเรีย",
  rarity: "AWAKEN",
  element: "น้ำแข็ง",
  balanceSchemaVersion: 4,
  awakenSourceId: 3002,
  originalCardId: 3002,
  abilityIdentityId: 3002,
  transformOnly: true,
  power: 17000,
  hp: 300000,
  defense: 10000,
  speed: 109,
  incomePerSec: 330,
  normalAttackTargetCount: 2,
  targetSelection: "back",
  upgradeDustBase: 1450,
  upgradeDustGrowth: 1.0175,
  awakenMax: 20,
  image: "card/AK-3002/AK-3002.png",
  poster: "card/AK-3002/AK-3002.png",
  video: "card/AK-3002/AK-3002.mp4",
  scCutscene: {
    enabled: true,
    kicker: "AWAKENING ACTIVE",
    quote: "“ความหนาวเย็นที่แท้จริง…เพิ่งเริ่มต้นเท่านั้น จงตื่นขึ้น—กลาเซียร์ลาส อัลบิส!",
    subtitle: "Awaken form ID 3002",
    video: "card/AK-3002/AK-3002op.mp4",
    revealKicker: "AWAKENING",
    revealTitle: "เอลฟาเรีย",
    accent: "#99fdff",
    accent2: "#7b00ff",
    introMs: 2200,
    maxVideoMs: 60000,
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
      description: "เมื่อเริ่มต่อสู้ตนเองจะได้รับโล่ +10 และ การโจมตีปกติมีโอกาสติดสถานะแช่แข็ง 40 % (ทุกการโจมตีปกติ จะโจมตีจากแถวหลังก่อน และดาเมจทำลายแช่แข็งเพิ่มเป็น 300% ของพลังโจมตีผู้ร่าย)",
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
          successRate: 0.4,
          targetCount: 2,
          freezeBreakPowerRate: 3,
          freezeBreakSuccessRate: 1
        }
      ]
    },
    {
      name: "เอลวัน: อาร์ส ไวส์",
      description: "ทุกๆการโจมตี 3 ครั้ง เอลฟาเรียจะสร้างร่างโคลนน้ำแข็งตัวเอง 1 ร่าง สูงสุด 5 ร่าง และตัวเองได้รับโล่ 1 (ร่างโคลนน้ำแข็งมีสกิล สเตลลาส นาเทีย)",
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
          powerRate: 0.7,
          hpRate: 0.7,
          defenseRate: 0.7,
          speedRate: 0.7,
          normalAttackTargetCount: 1,
          canUseAbilities: true,
          maxSpawnDepth: 1,
          inheritAbilities: false,
          maxActiveClones: 5,
          cloneGroupKey: "elfariacloneAK",
          cloneAbilities: [
            {
              name: "สเตลลาส นาเทีย",
              description: "ทุกการโจมตีครั้งที่ 5 จะโจมตีด้วยหอกน้ำแข็ง ดาเมจ 1500% เจาะเกราะ 40% และแช่แข็งศัตรู 70%  จำนวน 1 เป้าหมาย",
              activeIn: [
                "team",
                "tower",
                "arena",
                "worldBoss"
              ],
              condition: {
                afterOwnAttacks: 4,
                repeat: true
              },
              effects: [
                {
                  type: "nextAttackPowerRate",
                  value: 15,
                  effectOperation: "increase",
                  targetSide: "self",
                  targetSelection: "specific",
                  targetCount: 1
                },
                {
                  type: "defensePenetrationRate",
                  value: 0.4,
                  effectOperation: "increase",
                  targetSide: "enemy",
                  condition: {
                    onOwnAttack: true
                  },
                  targetSelection: "hitTargets",
                  targetCount: 1
                },
                {
                  type: "applyStatus",
                  targetSide: "enemy",
                  condition: {
                    onOwnAttack: true
                  },
                  targetSelection: "hitTargets",
                  status: "freeze",
                  successRate: 0.7,
                  targetCount: 1,
                  freezeBreakPowerRate: 2,
                  freezeBreakSuccessRate: 1
                }
              ]
            }
          ]
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
        afterOwnAttacks: 2
      },
      activeCutscene: {
        enabled: true,
        kicker: "ACTIVE SKILL",
        title: "เอลวัน: อาร์ส ไวส์",
        video: "card/3002/3002at1.mp4",
        accent: "#00ffe1",
        accent2: "#97e1ed",
        durationMs: 1200,
        maxVideoMs: 6000,
        objectFit: "cover",
        objectPosition: "center center",
        muted: false,
        volume: 0.8,
        showHitCount: true
      }
    },
    {
      name: "สเตลลาส นาเทีย",
      description: "ทุกการโจมตีครั้งที่ 5 จะโจมตีด้วยหอกน้ำแข็ง ดาเมจ 3500% เจาะเกราะ 80% และแช่แข็ง 100% 1 เป้าหมาย",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "nextAttackPowerRate",
          value: 35,
          effectOperation: "increase",
          targetSide: "self",
          targetSelection: "specific",
          targetCount: 1
        },
        {
          type: "defensePenetrationRate",
          value: 0.8,
          effectOperation: "increase",
          targetSide: "enemy",
          condition: {
            onOwnAttack: true
          },
          targetSelection: "hitTargets"
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          condition: {
            onOwnAttack: true
          },
          targetSelection: "hitTargets",
          status: "freeze",
          successRate: 1,
          targetCount: 1,
          freezeBreakPowerRate: 3,
          freezeBreakSuccessRate: 1
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
    },
    {
      name: "กลาเซียร์ลาส อัลบิส",
      description: "เมื่อโจมตีครบ 10 ครั้ง จะทำการอัญเชิญ 'กลาเซียร์ลาส อัลบิส' และในการโจมตีที่อัญเชิญ จะทำดาเมจ 700% 5เป้าหมาย จำนวน 5 ฮิต เจาะเกาะ 40% และมีโอกาศติดสถานะ แช่แข็ง 100% (ใช้งานได้ 1 ครั้งต่อการต่อสู้)",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "summonCard",
          targetSelection: "all",
          count: 1,
          slotPolicy: "newSlot",
          successRate: 1,
          powerRate: 1,
          hpRate: 1,
          defenseRate: 1,
          speedRate: 1,
          basePower: 500000,
          baseHp: 3000000,
          baseDefense: 250000,
          baseSpeed: 107,
          attackHits: 1,
          normalAttackTargetCount: 1,
          canUseAbilities: true,
          maxSpawnDepth: 1,
          summonCardId: 24,
          useBaseAbilities: true,
          summonedAbilities: [
            {
              name: "กลาเซียร์ไดฟ์ไดเรค",
              description: "เมื่อโจมตีครบ 3 ครั้ง การโจมตีครั้งถัดไป จะทำดาเมจ 50% 5เป้าหมาย จำนวน 5 ฮิต โอกาส แช่แข็ง 33%",
              activeIn: [
                "team",
                "tower",
                "arena",
                "worldBoss"
              ],
              effects: [
                {
                  type: "skillAttack",
                  targetSide: "enemy",
                  targetSelection: "default",
                  targetCount: 5,
                  damageRate: 0.5
                },
                {
                  type: "nextAttackHits",
                  value: 5,
                  targetSide: "self",
                  targetSelection: "all"
                },
                {
                  type: "applyStatus",
                  targetSide: "enemy",
                  targetSelection: "all",
                  status: "freeze",
                  successRate: 0.33,
                  targetCount: 5,
                  freezeBreakPowerRate: 2,
                  freezeBreakSuccessRate: 1
                }
              ],
              attackTargetCount: 5,
              condition: {
                afterOwnAttacks: 3,
                repeat: true
              }
            }
          ]
        },
        {
          type: "skillAttack",
          targetSide: "enemy",
          targetSelection: "default",
          targetCount: 5,
          damageRate: 7
        },
        {
          type: "nextAttackHits",
          value: 4,
          targetSide: "self",
          targetSelection: "all"
        },
        {
          type: "defensePenetrationRate",
          value: 0.4,
          targetSide: "enemy",
          targetSelection: "hitTargets"
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          targetSelection: "hitTargets",
          status: "freeze",
          successRate: 1,
          targetCount: 5,
          freezeBreakPowerRate: 3,
          freezeBreakSuccessRate: 1
        }
      ],
      attackTargetCount: 5,
      condition: {
        afterOwnAttacks: 9,
        repeat: false
      },
      activeCutscene: {
        enabled: true,
        kicker: "ACTIVE SKILL",
        title: "กลาเซียร์ลาส อัลบิส",
        video: "card/AK-3002/AK-3002op.mp4",
        accent: "#0ed8b6",
        accent2: "#22d3ee",
        durationMs: 800,
        maxVideoMs: 30000,
        objectFit: "cover",
        objectPosition: "center center",
        muted: false,
        volume: 0.8,
        showHitCount: true
      }
    }
  ]
});