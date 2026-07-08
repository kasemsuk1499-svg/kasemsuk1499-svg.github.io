/*
  Anime Card Collection — ข้อมูลการ์ดหลัก
  แยกออกจาก index.html เพื่อให้ไฟล์หลักไม่ยาวเกินไป
  วิธีแก้ข้อมูลการ์ดเดิม: แก้ใน ACC_CARD_DATA ด้านล่างได้เลย
*/
window.ACC_CARD_DATA = [
{
  "id": 2010,
  "name": "ไอริส",
  "rarity": "SC",
  "element": "แสง",
  "power": 850000,
  "hp": 3400000,
  "defense": 272000,
  "incomePerSec": 19000,
  "upgradeDustBase": 10000,
  "upgradeDustGrowth": 1.092,
  "awakenMax": 4,
  "icon": "",
  "image": "2010.png",
  "poster": "2010.png",
  "video": "2010.mp4",
  "overlay": "",
  "scCutscene": {
    "kicker": "Royal Sacred Sword",
    "quote": "ในนามแห่งราชวงศ์เบลเซิร์ก... ฉันจะไม่ยอมให้ใครทำร้ายพวกพ้อง!",
    "subtitle": "Sacred Explode",
    "video": "IRISop.mp4",
    "poster": "",
    "accent": "#fde68a",
    "accent2": "#f8fafc",
    "introMs": 4000,
    "maxVideoMs": 60000,
    "revealMs": 4000,
    "objectFit": "cover",
    "objectPosition": "center center",
    "muted": false,
    "volume": 0.5,
    "showCardAfterVideo": true,
    "revealKicker": "ROYAL SACRED SWORD",
    "revealTitle": "MYSTICAL · IRIS"
  },
  "abilities": [
    {
      "name": "โลหิตแห่งราชวงศ์เบลเซิร์ก",
      "description": "เพิ่ม ATK ของตัวเอง 75% เพิ่มอัตราคริติคอล 50% และได้รับค่าต้านสถานะ 50%",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "selfPowerRate",
          "value": 0.75
        },
        {
          "type": "criticalRate",
          "value": 0.5,
          "targetSide": "self"
        },
        {
          "type": "statusResistance",
          "value": 50,
          "targetSide": "self"
        }
      ]
    },
    {
      "name": "องค์หญิงและอัศวินประจำพระองค์",
      "description": "เมื่อจัดทีมร่วมกับดาร์กเนส ไอริสจะได้รับคริติคอลเพิ่มอีก 50% ลดความเสียหายที่ได้รับ 50% และลดคอสสกิลถาวร 2 คอส ส่วนดาร์กเนสจะได้รับ HP +100%, DEF +200%, อัตราบล็อก +50% และค่าต้านสถานะ 150%",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "condition": {
        "requiredCardIds": [
          2004
        ]
      },
      "effects": [
        {
          "type": "criticalRate",
          "value": 0.5,
          "targetSide": "self"
        },
        {
          "type": "damageTakenRate",
          "value": -0.5,
          "targetSide": "self"
        },
        {
          "type": "activeSkillCostPermanent",
          "value": -2,
          "targetSide": "self"
        },
        {
          "type": "cardHpRate",
          "value": 1,
          "targetSide": "ally",
          "targetCardIds": [
            2004
          ]
        },
        {
          "type": "cardDefenseRate",
          "value": 2,
          "targetSide": "ally",
          "targetCardIds": [
            2004
          ]
        },
        {
          "type": "blockRate",
          "value": 0.5,
          "targetSide": "ally",
          "targetCardIds": [
            2004
          ]
        },
        {
          "type": "statusResistance",
          "value": 150,
          "targetSide": "ally",
          "targetSelection": "specific",
          "targetCardIds": [
            2004
          ]
        }
      ]
    },
    {
      "name": "คำสาบานของลาลาทิน่า",
      "description": "เมื่อจัดทีมร่วมกับดาร์กเนส ทุกครั้งที่ไอริสโจมตีครบ 3 ครั้ง จะฟื้นฟู HP ของไอริส 15% ฟื้นฟู HP ของดาร์กเนส 20% ฟื้นโล่ให้ดาร์กเนส 2 ชั้น และเพิ่ม ATK ของไอริส 10% สูงสุด 10 สแต็ก",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "condition": {
        "requiredCardIds": [
          2004
        ],
        "afterOwnAttacks": 2,
        "repeat": true
      },
      "effects": [
        {
          "type": "healHpRate",
          "value": 0.15,
          "targetSide": "self"
        },
        {
          "type": "healHpRate",
          "value": 0.2,
          "targetSide": "ally",
          "targetCardIds": [
            2004
          ]
        },
        {
          "type": "restoreShieldHits",
          "value": 2,
          "targetSide": "ally",
          "targetCardIds": [
            2004
          ]
        },
        {
          "type": "powerRateStack",
          "value": 0.1,
          "targetSide": "self",
          "maxStacks": 10,
          "stackKey": "IRIS_DARKNESS_OATH"
        }
      ]
    },
    {
      "name": "เซเคร็ดเอ็กซ์โพลด",
      "description": "เมื่อจัดทีมร่วมกับดาร์กเนส ทุกการโจมตีครั้งที่ 8 การโจมตีครั้งนั้นจะได้รับ ATK +300% เพิ่ม 5 ฮิต มีอัตราคริติคอลเพิ่ม 100% และลด DEF ของฝ่ายตรงข้าม 10% สูงสุด 5 สแต็ก",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "condition": {
        "requiredCardIds": [
          2004
        ],
        "afterOwnAttacks": 7,
        "repeat": true
      },
      "effects": [
        {
          "type": "nextAttackPowerRate",
          "value": 3,
          "targetSide": "self"
        },
        {
          "type": "nextAttackHits",
          "value": 5,
          "targetSide": "self"
        },
        {
          "type": "nextAttackCriticalRate",
          "value": 1,
          "targetSide": "self"
        },
        {
          "type": "defenseRateStack",
          "value": -0.1,
          "targetSide": "enemy",
          "maxStacks": 5,
          "stackKey": "IRIS_SACRED_EXPLODE"
        }
      ]
    }
  ]
},
{
  "id": 2009,
  "name": "เซซิเลีย",
  "rarity": "LR",
  "element": "น้ำ",
  "power": 243000,
  "hp": 1215000,
  "defense": 97200,
  "incomePerSec": 6500,
  "upgradeDustBase": 2800,
  "upgradeDustGrowth": 1.078,
  "awakenMax": 4,
  "icon": "",
  "image": "2009.png",
  "abilities": [
    {
      "name": "พรแห่งเทพธิดาอวา",
      "description": "หากไม่ได้จัดทีมร่วมกับอควา จะลดคอส Active Skill ของเพื่อนร่วมทีม 2 คอสอย่างถาวร และทุกครั้งที่การ์ดใบนี้โจมตีครบ 3 ครั้ง จะฟื้นฟู HP ให้ฝ่ายเรา 15%",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "condition": {
        "withoutCardIds": [
          2002
        ]
      },
      "effects": [
        {
          "type": "activeSkillCostPermanent",
          "value": -2,
          "targetSide": "ally",
          "excludeSelf": true
        },
        {
          "type": "healHpRate",
          "value": 0.15,
          "targetSide": "ally",
          "condition": {
            "afterOwnAttacks": 2,
            "repeat": true
          }
        }
      ]
    },
    {
      "name": "พลังของสาวกแห่งเทพธิดาอควา",
      "description": "หากจัดทีมร่วมกับอควา จะยกเลิกเงื่อนไขสกิลของอควา และทำให้ Active Skill ที่มีตัวนับพร้อมใช้ในการโจมตีครั้งแรก",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "condition": {
        "requiredCardIds": [
          2002
        ]
      },
      "effects": [
        {
          "type": "ignoreAbilityConditions",
          "targetSide": "ally",
          "targetSelection": "specific",
          "targetCardIds": [
            2002
          ],
          "targetMatch": "all",
          "triggerImmediately": true
        }
      ]
    }
  ]
},
{
  "id": 2004,
  "name": "ดาร์กเนส",
  "rarity": "EX",
  "element": [
    "แสง",
    "ดิน"
  ],
  "power": 1968300,
  "hp": 9841500,
  "defense": 787320,
  "incomePerSec": 45000,
  "upgradeDustBase": 20000,
  "upgradeDustGrowth": 1.102,
  "awakenMax": 3,
  "icon": "",
  "image": "2004.png",
  "poster": "2004.png",
  "video": "2004.mp4",
  "abilities": [
    {
      "name": "ครูเซเดอร์ สาย...",
      "description": "ตัวเอง ATK-100% แต่ได้ DEF+1000%",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "selfPowerRate",
          "value": -1
        },
        {
          "type": "selfDefenseRate",
          "value": 10
        }
      ]
    },
    {
      "name": "ข้าจะปกป้องทุกคนเอง",
      "description": "เมื่อจัดทีมร่วมกับ ซาโต้ คาสึมะ หรือ เมกุมิน หรือ อควา จะลดความเสียหายที่ได้รับลงอีก 50 %",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "damageTakenRate",
          "value": -0.5,
          "targetSide": "ally"
        }
      ],
      "condition": {
        "anyCardIds": [
          2003,
          2001,
          2002
        ]
      }
    },
    {
      "name": "ขั้นสุดแห่งสาย...",
      "description": "เมื่อการ์ดใบนี้ อเวกตันและเลเวลตัน จะได้ พลังป้องกัน 5000% และเลือด เพิ่มอีก 2000% เฉพาะตัวเอง",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "selfDefenseRate",
          "value": 50
        },
        {
          "type": "selfHpRate",
          "value": 20
        }
      ],
      "condition": {
        "sourceMinLevel": 300,
        "sourceMinAwaken": 3
      }
    }
  ],
   "scCutscene": {
      "kicker": "ครูเซสเดอร์ผู้เพรียบพร้อม",
      "quote": "ฉันจะปกป้องทุกคนเอง ฮิฮิ",
      "subtitle": "ด้วยเกียรติของอัศวิน อุฮิ้",
      "video": "DARKop.mp4",
      "poster": "",
            "accent": "#facc15",
            "accent2": "#fef3c7",
      "introMs": 4000,
      "maxVideoMs": 60000,
      "revealMs": 4000,
      "objectFit": "cover",
      "objectPosition": "center center",
      "muted": false,
      "volume": 0.5,
      "showCardAfterVideo": true,
      "revealKicker": "ฉันรู้สึกซาบซึ้งใจ",
      "revealTitle": "EX · ดาร์กเนส"
    }
},
{
  "id": 2001,
  "name": "ซาโต้ คาสึมะ",
  "rarity": "EX",
  "element": [
    "น้ำ",
    "ความมืด"
  ],
  "power": 1968300,
  "hp": 9841500,
  "defense": 787320,
  "incomePerSec": 45000,
  "upgradeDustBase": 20000,
  "upgradeDustGrowth": 1.102,
  "awakenMax": 3,
  "icon": "",
  "image": "2001.png",
  "poster": "2001.png",
  "video": "2001.mp4",
  "abilities": [
    {
      "name": "ปาร์ตี้ไร้เทียมทาน",
      "description": "เมื่อจัดทีมกับ ดาร์กเนส อควา และ เมกุมิน จะให้ได้รับบัพ คริติคอล +100% ตลอดเวลา และลดคอสการใช้สกิลของคนในทีม 19 คอส",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "criticalRate",
          "value": 1,
          "targetSide": "ally"
        },
        {
          "type": "activeSkillCostPermanent",
          "value": -19,
          "targetSide": "ally" , "excludeSelf": true
        }
      ],
      "condition": {
        "requiredCardIds": [
          2002,
          2003,
          2004
        ]
      }
    },
    {
      "name": "ครีเอทวอร์เทอร์",
      "description": "ทุกการโจมตี จะเพิ่มฟื้มฟูเลือดให้ตัวเองและ คนในทีม 5% และจะลด พลังป้องกันฝ่ายตรงข้ามลง 5% สูงสุด 10 สแตก",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "healingRate",
          "value": 0.05,
          "targetSide": "ally"
        },
        {
          "type": "enemyDefenseRateStack",
          "value": -0.05,
          "maxStacks": 10,
          "stackKey": "CREATWT"
        }
      ],
      "condition": {
        "onOwnAttack": true
      }
    },
    {
      "name": "เดรนครัส",
      "description": "ทุกครั้งที่โจมตีจะลดเลือดฝั่งตรงข้าม 3 %",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "enemyHpRateStack",
          "value": -0.03,
          "maxStacks": 99,
          "stackKey": "sharedStack"
        }
      ],
      "condition": {
        "onOwnAttack": true
      }
    },
    {
      "name": "สตีล",
      "description": "คาซึมะจะทำการขโมยสกิล ทุกๆการโจมตี 15 ครั้ง แบบสุ่ม โอกาสสำเร็จ 45 %",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "stealAbilities",
          "targetSide": "enemy",
          "targetSelection": "random",
          "targetCount": 1,
          "successRate": 0.45,
          "abilitySelection": "random",
          "abilityCount": 1,
          "recipientSide": "self"
        }
      ],
      "condition": {
        "afterOwnAttacks": 14 , "repeat": true
      }
    }
  ],
   "scCutscene": {
      "kicker": "ชายผู้ถูกตั้งความหวังในการปราบมาร",
      "quote": "ชื่อของฉันคือ ซาโต้ คาสึมะ อย่าคิดมีเรื่องกับฉันจะดีกว่า ",
      "subtitle": "ครีเอทวอร์เทอร์",
      "video": "SATO.mp4",
      "poster": "",
          "accent": "#22c55e",
           "accent2": "#84cc16",
      "introMs": 4000,
      "maxVideoMs": 60000,
      "revealMs": 4000,
      "objectFit": "cover",
      "objectPosition": "center center",
      "muted": false,
      "volume": 0.5,
      "showCardAfterVideo": true,
      "revealKicker": "SATO",
      "revealTitle": "EX · ซาโต้ คาสึมะ"
    }
},
{
  "id": 2008,
  "name": "ยุนยุน",
  "rarity": "LR",
  "element": "ไฟ",
  "power": 243000,
  "hp": 1215000,
  "defense": 97200,
  "incomePerSec": 6500,
  "upgradeDustBase": 2800,
  "upgradeDustGrowth": 1.078,
  "awakenMax": 4,
  "icon": "",
  "image": "2008.png",
"abilities": [
  {
    "name": "ฉันไม่แพ้เธอแน่",
    "description": "เมื่อจัดทีมร่วมกับตัวละครชื่อ 'เมกุมิน' ทุกครั้งที่ตัวละครนี้โจมตี จะเพิ่ม ATK ให้ทีม 5% สูงสุด 10 แสต็ก",
    "activeIn": [
      "team",
      "tower",
      "arena"
    ],
    "condition": {
      "requiredCardIds": [
        2003
      ]
    },
    "effects": [
      {
        "type": "teamPowerRateStack",
        "value": 0.05,
        "maxStacks": 10,
        "stackKey": "yunyun_megumin_team_atk",
        "condition": {
          "onOwnAttack": true
        }
      }
    ]
  },
  {
    "name": "ไฟร์เยอร์เจลเวลิน",
    "description": "ทุกครั้งที่ตัวละครนี้โจมตี จะทำให้ศัตรูได้รับความเสียหายเพิ่มขึ้น 5% สูงสุด 10 แสต็ก",
    "activeIn": [
      "team",
      "tower",
      "arena"
    ],
    "effects": [
      {
        "type": "damageTakenRate",
        "value": 0.05,
        "targetSide": "enemy",
        "maxStacks": 10,
        "stackKey": "fire_javelin_damage_taken",
        "condition": {
          "onOwnAttack": true
        }
      }
    ]
  }
]
},
{
  "id": 2007,
  "name": "วิส",
  "rarity": "LR",
  "element": "ความมืด",
  "power": 243000,
  "hp": 1215000,
  "defense": 97200,
  "incomePerSec": 6500,
  "upgradeDustBase": 2800,
  "upgradeDustGrowth": 1.078,
  "awakenMax": 4,
  "icon": "",
  "image": "2007.png",
  "abilities": [
    {
      "name": "เดรนครัส",
      "description": "ทุกครั้งที่โจมตี จะดูดพลัง 1 สแต็ก ลด HP สูงสุดและ DEF ของฝ่ายตรงข้าม 5% พร้อมเพิ่ม ATK และ HP สูงสุดให้ทีมเรา 5% สะสมได้สูงสุด 8 สแต็ก",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "condition": {
        "onOwnAttack": true
      },
      "effects": [
        {
          "type": "enemyHpRateStack",
          "value": -0.05,
          "maxStacks": 8,
          "stackKey": "drainCurse"
        },
        {
          "type": "enemyDefenseRateStack",
          "value": -0.05,
          "maxStacks": 8,
          "stackKey": "drainCurse"
        },
        {
          "type": "teamPowerRateStack",
          "value": 0.05,
          "maxStacks": 8,
          "stackKey": "drainCurse"
        },
        {
          "type": "teamHpRateStack",
          "value": 0.05,
          "maxStacks": 8,
          "stackKey": "drainCurse"
        }
      ]
    },
    {
      "name": "อย่าทำฉันเลยนะคะ",
      "description": "หากจัดทีมร่วมกับการ์ด 'อควา' Card ID 2002 ความสามารถทั้งหมดของการ์ดใบนี้และอควาจะไม่ทำงาน",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "condition": {
        "requiredCardIds": [
          2002
        ]
      },
      "effects": [
        {
          "type": "nullifyCardAbilities",
          "targetSide": "ally",
          "targetSelection": "specific",
          "targetCardIds": [
            2002
          ],
          "excludeSelf": true
        },
        {
          "type": "nullifyCardAbilities",
          "targetSide": "self",
          "targetSelection": "specific"
        }
      ]
    }
  ]
},
{
  "id": 2006,
  "name": "ลูน่า",
  "rarity": "UR",
  "element": "ไร้ธาตุ",
  "power": 97200,
  "hp": 486000,
  "defense": 38880,
  "incomePerSec": 2760,
  "upgradeDustBase": 750,
  "upgradeDustGrowth": 1.064,
  "awakenMax": 5,
  "icon": "",
  "image": "2006.png",
  "abilities": [
    {
      "name": "ค่าตอบแทนจากเควสค่ะ",
      "description": "เพิ่มเงินเดือนให้กับทีม 50% และเพิ่มค่าฐานเงินเดือนคงที่ให้ทีม 5,000 (ระบบคำนวณเป็นรายวัน)",
      "activeIn": [
        "team"
      ],
      "effects": [
        {
          "type": "teamIncomeRate",
          "value": 0.5
        },
        {
          "type": "teamIncomeFlat",
          "value": 5000
        }
      ]
    },
    {
      "name": "ทางกิลต้องเรียกร้อง่าเสียหาเพิ่มค่ะ",
      "description": "เมื่อจัดทีมกับตัวละครชื่อ 'อควา' จะลดค่าฐานเงินเดือนคงที่ 30,000,000 (ระบบคำนวณเป็นรายวัน)",
      "activeIn": [
        "team"
      ],
      "effects": [
        {
          "type": "teamIncomeFlat",
          "value": -30000000
        }
      ],
      "condition": {
        "requiredCardIds": [
          2002
        ]
      }
    }
  ]
},
{
  "id": 2005,
  "name": "คริส",
  "rarity": "UR",
  "element": "ลม",
  "power": 97200,
  "hp": 486000,
  "defense": 38880,
  "incomePerSec": 2760,
  "upgradeDustBase": 750,
  "upgradeDustGrowth": 1.064,
  "awakenMax": 5,
  "icon": "",
  "image": "2005.png",
  "abilities": [
    {
      "name": "สตีล",
      "description": "เมื่อโจมตีครบ 5 ครั้ง จะทำการขโมยสกิล ของฝ่ายตรงข้าม 1 สกิล แบบสุ่ม ทำงานได้เพียงครั้งเดียว",
      "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "stealAbilities",
          "targetSide": "enemy",
          "targetSelection": "random",
          "targetCount": 1,
          "successRate": 1,
          "abilitySelection": "random",
          "abilityCount": 1,
          "recipientSide": "self"
        }
      ],
      "condition": {
        "afterOwnAttacks": 4, "repeat": false
      }
    }
  ]
}, 
 {
    "id": 2002,
    "name": "Aqua",
    "rarity": "SC",
    "element": "น้ำ",
    "power": 707000,
    "hp": 3536000,
    "defense": 283000,
    "incomePerSec": 17500,
    "upgradeDustBase": 10000,
    "upgradeDustGrowth": 1.092,
    "awakenMax": 3,
    "icon": "",
    "image": "2002.png",
    "poster": "2002.png",
    "video": "2002.mp4",
    "overlay": "",
    "scCutscene": {
      "kicker": "Gods Requiem!!!",
      "quote": "จงรับคำอวยพรจากพระเจ้าซ้ะเถอะ.. GOD REQUIEMMM!!!",
      "subtitle": "Water God Blessing",
      "video": "Aqauop.mp4",
      "poster": "",
             "accent": "#38bdf8",
             "accent2": "#67e8f9",
      "introMs": 4000,
      "maxVideoMs": 60000,
      "revealMs": 4000,
      "objectFit": "cover",
      "objectPosition": "center center",
      "muted": false,
      "volume": 0.5,
      "showCardAfterVideo": true,
      "revealKicker": "Gods Requiem",
      "revealTitle": "MYSTICAL · AQUA"
    },
      "abilities": [
      {
        "name": "God Requiem",
        "description": "เมื่อการ์ดใบนี้ ตีครบ 20 ครั้ง จะการโจมตีครั้งถัดไปจะได้รับ ; HPbase +20% และทำดาเมจ ลกเกราะฝ่ายตรงข้าม 20% ",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "afterOwnAttacks": 20, "repeat": true },
        "effects": [
          { "type": "increaseMaxHpBaseRate", "value": 0.2 },
          { "type": "enemyDefenseRate", "value": -0.2 }
        ]
      },
      {
        "name": "Water Secreat",
        "description": "เมื่อการ์ดใบนี้จับทีมคู่กับตัวละคร 'kasuma;megumin;darkness' ตัวใดตัวนึง ได้รับ ; ทุกครั้งที่ตี 3 ครั้ง จะฟื้นฟู HP+15% และลดคอสการใช้สกิลของเพื่อนร่วมทีม 1",
        "activeIn": ["team", "tower", "arena"],
        "condition": {"anyCardIds":[2001,2003,2004]},
        "effects": [
          { "type": "healHpRate", "value": 0.15, "condition": { "afterOwnAttacks": 2, "repeat": true } },
          { "type": "activeSkillCostCycle", "value": -1, "targetSide": "ally", "condition": { "afterOwnAttacks": 2, "repeat": true } }
        ]
      }
    ]
  }, 
  {
    "id": 2003,
    "name": "Megumin",
    "rarity": "SC",
    "element": "ไฟ",
    "power": 707000,
    "hp": 3536000,
    "defense": 283000,
    "incomePerSec": 17500,
    "upgradeDustBase": 10000,
    "upgradeDustGrowth": 1.092,
    "awakenMax": 3,
    "icon": "",
    "image": "2003.png",
    "poster": "2003.png",
    "video": "2003.mp4",
    "overlay": "",
    "scCutscene": {
      "kicker": "EXPLOSION!!!",
      "quote": "นามของข้ามีนามว่าเมกุมิน...จอมเวทระเบิดกัมปนาท!!!",
      "subtitle": "The KOMA Mage",
      "video": "Meguminop.mp4",
      "poster": "",
      "accent": "#ef4444",
             "accent2": "#f97316",
      "introMs": 4000,
      "maxVideoMs": 60000,
      "revealMs": 4000,
      "objectFit": "cover",
      "objectPosition": "center center",
      "muted": false,
      "volume": 0.5,
      "showCardAfterVideo": true,
      "revealKicker": "EXPLOSION!!!",
      "revealTitle": "MYSTICAL · MEGUMIN"
    },
      "ability": {
        "name": "EXPLOSION",
        "description": "เมื่อการ์ดใบนี้ ตีครบ 20 ครั้ง จะการโจมตีครั้งถัดไปจะได้รับ ; ลบเกราะฝ่ายตรงข้ามทั้งหมด และ ATK+1000%/HP-99% และสร้างความเสียหายเพิ่ม +40% ของพลังโจมตีทั้งทีม ใช้งานได้ครั้งเดียว ",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "afterOwnAttacks": 20, "repeat": false },
        "effects": [
          { "type": "shieldHits", "value": -999, "targetSide": "enemy" },
          { "type": "nextAttackPowerRate", "value": 10.0, "targetSide": "self" },
          { "type": "selfHpRate", "value": -0.99 },
          { "type": "damageTakenRate", "value": 0.40, "targetSide": "enemy" }
      ]
    }
  }, 
  {
    "id": 0,
    "name": "DEV.",
    "rarity": "SC",
    "element": "ความมืด",
    "power": 729000,
    "hp": 3645000,
    "defense": 292000,
    "incomePerSec": 18000,
    "upgradeDustBase": 10000,
    "upgradeDustGrowth": 1.092,
    "awakenMax": 3,
    "icon": "",
    "image": "0.png",
    "poster": "0.png",
    "video": "0.mp4",
    "overlay": "overlay.mp4",
    "scCutscene": {
        "kicker": "SYSTEM OVERRIDE",
        "quote": "ไร้เมตตา เมื่อพระเจ้าลงสนาม",
        "subtitle": "Developer Authority",
        "video": "DEVop.mp4",
        "poster": "",
        "accent": "#a78bfa",
        "accent2": "#22d3ee",
        "introMs": 3000,
        "maxVideoMs": 14000,
        "revealMs": 3000,
        "objectFit": "cover",
        "objectPosition": "center center",
        "muted": false,
        "volume": 0.5,
        "showCardAfterVideo": true,
        "revealKicker": "SYSTEM ACCESS GRANTED",
        "revealTitle": "MYSTICAL · DEV."
    },
    "ability": [
        {
            "name": "ROOT ACCESS",
            "description": "ต้านสถานะของตนเอง +100%; ศัตรูทั้งหมดถูกลดต้านสถานะ 300%, ลดการฟื้น HP/โล่ 50%, ได้รับดาเมจเพิ่ม 50% และคอสสกิลแอคทีฟเพิ่มถาวร 2 หน่วย",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "statusResistance",
                    "value": 100,
                    "targetSide": "self"
                },
                {
                    "type": "statusResistance",
                    "value": -300,
                    "targetSide": "enemy",
                    "targetSelection": "all",
                    "scope": "field"
                },
                {
                    "type": "healingRate",
                    "value": -0.5,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "shieldRecoveryRate",
                    "value": -0.5,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "damageTakenRate",
                    "value": 0.5,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "activeSkillCostPermanent",
                    "value": 2,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                }
            ]
        },
        {
            "name": "GLOBAL NERF",
            "description": "ลด ATK, คริติคอล, หลบหลีก และบล็อคเรทของศัตรูทั้งหมด 50%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "enemyPowerRate",
                    "value": -0.5
                },
                {
                    "type": "criticalRate",
                    "value": -0.5,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "dodgeRate",
                    "value": -0.5,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "blockRate",
                    "value": -0.5,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                }
            ]
        },
        {
            "name": "MAINTENANCE MODE",
            "description": "ทุกครั้งที่โจมตีครบ 9 ครั้ง จะทำลายโล่ศัตรูทั้งหมด 9 ฮิต เพิ่มคอสสกิลรอบปัจจุบัน 3 หน่วย และทำให้ความสามารถของศัตรูทุกใบไร้ผลในการทำงานครั้งถัดไป",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {
                "afterOwnAttacks": 8,
                "repeat": true
            },
            "effects": [
                {
                    "type": "shieldHits",
                    "value": -9,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "activeSkillCostCycle",
                    "value": 3,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "nullifyCardAbilities",
                    "targetSide": "enemy",
                    "targetSelection": "all",
                    "durationTriggers": 1
                }
            ]
        },
        {
            "name": "SYSTEM RESET: DELETE ALL",
            "description": "เมื่อโจมตีครบ 18 ครั้ง จะลบโล่ศัตรูทั้งหมด ลดต้านสถานะ 900% ห้ามฟื้น HP และโล่ พร้อมทำให้ความสามารถของศัตรูทุกใบไร้ผล 2 ครั้ง ทำงานครั้งเดียวต่อไฟต์",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {
                "afterOwnAttacks": 17,
                "repeat": false
            },
            "effects": [
                {
                    "type": "shieldHits",
                    "value": -999,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "statusResistance",
                    "value": -900,
                    "targetSide": "enemy",
                    "targetSelection": "all",
                    "scope": "field"
                },
                {
                    "type": "healingRate",
                    "value": -1,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "shieldRecoveryRate",
                    "value": -1,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "nullifyCardAbilities",
                    "targetSide": "enemy",
                    "targetSelection": "all",
                    "durationTriggers": 2
                }
            ]
        }
    ]
},
  {
    "id": 999,
    "name": "CREATOR",
    "rarity": "SC",
    "element": "สายฟ้า",
    "power": 729000,
    "hp": 3645000,
    "defense": 292000,
    "incomePerSec": 18000,
    "upgradeDustBase": 10000,
    "upgradeDustGrowth": 1.092,
    "awakenMax": 3,
    "icon": "",
    "image": "999.png",
    "video": "999.mp4",
    "poster": "999.png",
    "scCutscene": {
        "kicker": "THE FIRST STROKE",
        "quote": "ลองชิมสายฟ้าของผู้คิดค้นหน่อยไหมม..",
        "subtitle": "Creative Overdrive",
        "video": "CREATORop.mp4",
        "poster": "",
        "accent": "#f472b6",
        "accent2": "#facc15",
        "introMs": 3000,
        "maxVideoMs": 14000,
        "revealMs": 3000,
        "objectFit": "cover",
        "objectPosition": "center center",
        "muted": false,
        "volume": 0.5,
        "showCardAfterVideo": true,
        "revealKicker": "ORIGIN SIGNATURE",
        "revealTitle": "MYSTICAL · CREATOR"
    },
    "ability": [
        {
            "name": "บัญญัติที่ 1: พลังแห่งเลข 9",
            "description": "ATK +900%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "selfPowerRate",
                    "value": 9
                }
            ]
        },
        {
            "name": "บัญญัติที่ 2: ชีพจร 999",
            "description": "HP +900%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "selfHpRate",
                    "value": 9
                }
            ]
        },
        {
            "name": "บัญญัติที่ 3: เกราะนพชั้น",
            "description": "DEF +900% และได้รับโล่ 9 ฮิต",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "selfDefenseRate",
                    "value": 9
                },
                {
                    "type": "shieldHits",
                    "value": 9,
                    "targetSide": "self"
                }
            ]
        },
        {
            "name": "บัญญัติที่ 4: เนตรสายฟ้า 9",
            "description": "อัตราคริติคอล +9%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "criticalRate",
                    "value": 0.09,
                    "targetSide": "self"
                }
            ]
        },
        {
            "name": "บัญญัติที่ 5: ก้าวย่างเก้าสายฟ้า",
            "description": "อัตราหลบหลีก +90%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "dodgeRate",
                    "value": 0.9,
                    "targetSide": "self"
                }
            ]
        },
        {
            "name": "บัญญัติที่ 6: สิทธิ์ของผู้สร้าง",
            "description": "ต้านสถานะ +90%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "statusResistance",
                    "value": 90,
                    "targetSide": "self"
                }
            ]
        },
        {
            "name": "บัญญัติที่ 7: พรแห่งผู้สร้าง",
            "description": "ATK ของทั้งทีม +90%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "teamPowerRate",
                    "value": 0.9
                }
            ]
        },
        {
            "name": "บัญญัติที่ 8: วงจรฟื้นคืนลำดับเก้า",
            "description": "ทุกการโจมตีครั้งที่ 9 ฟื้นฟู HP 9,000,000 และฟื้นโล่ 9 ฮิต",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "healHpFlat",
                    "value": 9000000,
                    "targetSide": "self",
                    "condition": {
                        "afterOwnAttacks": 8,
                        "repeat": true
                    }
                },
                {
                    "type": "restoreShieldHits",
                    "value": 9,
                    "targetSide": "self",
                    "condition": {
                        "afterOwnAttacks": 8,
                        "repeat": true
                    }
                }
            ]
        },
        {
            "name": "บัญญัติที่ 9: CREATOR CODE 9999",
            "description": "เมื่อโจมตีครบ 9 ครั้ง การโจมตีครั้งถัดไปจะทำลายโล่ศัตรู 9 ฮิต สร้างดาเมจเพิ่มขึ้น 9999% โจมตีเพิ่ม 9 ฮิต และติดคริติคอล 100%",
            "activeIn": [
                "team",
                "tower",
                "arena"
            ],
            "condition": {
                "afterOwnAttacks": 9,
                "repeat": true
            },
            "effects": [
                {
                    "type": "shieldHits",
                    "value": -9,
                    "targetSide": "enemy",
                    "targetSelection": "all"
                },
                {
                    "type": "nextAttackPowerRate",
                    "value": 99.99,
                    "targetSide": "self"
                },
                {
                    "type": "nextAttackHits",
                    "value": 9,
                    "targetSide": "self"
                },
                {
                    "type": "nextAttackCriticalRate",
                    "value": 1,
                    "targetSide": "self"
                }
            ]
        }
    ]
},
  {
    "id": 1000,
    "name": "Great Magician",
    "rarity": "SC",
    "element": "ไร้ธาตุ",
    "power": 729000,
    "hp": 3645000,
    "defense": 292000,
    "incomePerSec": 18000,
    "upgradeDustBase": 10000,
    "upgradeDustGrowth": 1.092,
    "awakenMax": 3,
    "icon": "",
    "image": "1000.png",
    "video": "1000.mp4",
    "poster": "1000.png",
    "scCutscene": {
        "kicker": "ARCANA · ZERO",
        "quote": "เวทมนตร์ที่แท้จริง ไม่เคยยอมจำนนต่อความเป็นไปไม่ได้",
        "subtitle": "Grand Arcana",
        "video": "GMop.mp4",
        "poster": "",
        "accent": "#8b5cf6",
        "accent2": "#67e8f9",
        "introMs": 3000,
        "maxVideoMs": 14000,
        "revealMs": 3000,
        "objectFit": "cover",
        "objectPosition": "center center",
        "muted": false,
        "volume": 0.5,
        "showCardAfterVideo": true,
        "revealKicker": "THE GRAND ARCANA",
        "revealTitle": "MYSTICAL · GREAT MAGICIAN"
    },
    "ability": [
        {
            "name": "คลังมหาเวทไร้ขอบเขต",
            "description": "เงินเดือนของตนเอง +500% เงินเดือนทั้งทีม +200% และเพิ่มค่าฐานเงินเดือนคงที่ให้ทีม 5,000 (ระบบคำนวณเป็นรายวัน)",
            "activeIn": [
                "team"
            ],
            "condition": {},
            "effects": [
                {
                    "type": "selfIncomeRate",
                    "value": 5
                },
                {
                    "type": "teamIncomeRate",
                    "value": 2
                },
                {
                    "type": "teamIncomeFlat",
                    "value": 5000
                }
            ]
        },
        {
            "name": "มหาเวทบิดเบือนความน่าจะเป็น",
            "description": "เมื่ออเวกตันและเลเวลตัน จะเพิ่มน้ำหนักเรทกาชาระดับ LR +50%, EX +100% และ SC +150%",
            "activeIn": [
                "team"
            ],
            "condition": {
                "sourceMinAwaken": 3,
                "sourceMinLevel": 250
            },
            "effects": [
                {
                    "type": "gachaRarityRate",
                    "value": 0.5,
                    "targetRarities": [
                        "LR"
                    ]
                },
                {
                    "type": "gachaRarityRate",
                    "value": 1,
                    "targetRarities": [
                        "EX"
                    ]
                },
                {
                    "type": "gachaRarityRate",
                    "value": 1.5,
                    "targetRarities": [
                        "SC"
                    ]
                }
            ]
        }
    ]
},
  {
    "id": 2000,
    "name": "MAMON",
    "rarity": "SC",
    "element": "น้ำแข็ง",
    "power": 729000,
        "hp": 3645000,
        "defense": 292000,
    "incomePerSec": 18000,
    "upgradeDustBase": 10000,
    "upgradeDustGrowth": 1.092,
    "awakenMax": 3,
    "icon": "",
    "image": "2000.png",
    "video": "2000.mp4",
    "poster": "2000.png",
    "scCutscene": {
      "kicker": "ABYSSAL FORTUNE",
      "quote": "ปราสาทน้ำแข็งของข้าไม่มีสิ่งใดเทียมเท่า",
      "subtitle": "Fortune of the Deep",
      "video": "MAMONop.mp4",
      "poster": "",
      "accent": "#0ea5e9",
      "accent2": "#a7f3d0",
      "introMs": 3000,
      "maxVideoMs": 14000,
      "revealMs": 3000,
      "objectFit": "cover",
      "objectPosition": "center center",
      "muted": false,
      "volume": 0.5,
      "showCardAfterVideo": true,
      "revealKicker": "FORTUNE ANSWERS",
      "revealTitle": "MYSTICAL · MAMON"
    },
    "ability": [
  {
    "name": "กางอาณาเขต: จักรวรรดิเหมันต์นิรันดร์",
    "description": "เมื่อโจมตีครบ 5 ครั้ง จะกางอาณาเขตน้ำแข็งจนจบการต่อสู้ ทำให้ตนเองได้รับ ATK/HP +500%; พันธมิตรทั้งหมดได้รับ HP +200% และบล็อคเรท +30%; ศัตรูทั้งหมดถูกลดอัตราหลบหลีกและบล็อคเรท 40% พร้อมเพิ่มคอสสกิลแอคทีฟ 2 หน่วย หลังจากกางอาณาเขตแล้วจึงสามารถใช้ความสามารถอื่นได้",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "afterOwnAttacks": 5,
      "repeat": false
    },
    "effects": [
      {
        "type": "activateDomain",
        "domainId": "mamonIceDomain",
        "duration": "battle"
      },
      {
        "type": "selfPowerRate",
        "value": 5,
        "targetSide": "self"
      },
      {
        "type": "selfHpRate",
        "value": 5,
        "targetSide": "self"
      },
      {
        "type": "cardHpRate",
        "value": 2,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "blockRate",
        "value": 0.3,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "dodgeRate",
        "value": -0.4,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "blockRate",
        "value": -0.4,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "activeSkillCostPermanent",
        "value": 2,
        "targetSide": "enemy",
        "targetSelection": "all"
      }
    ]
  },
  {
    "name": "ชีพจรแห่งบัลลังก์น้ำแข็ง",
    "description": "ขณะอาณาเขตน้ำแข็งทำงาน ทุกครั้งที่โจมตีในอาณาเขตครบ 4 ครั้ง จะฟื้นฟู HP ให้ตนเอง 6,000,000 และพันธมิตรทุกคนคนละ 3,000,000 พร้อมเพิ่มโล่ให้ตนเอง 2 ฮิตและพันธมิตรคนละ 1 ฮิต",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "domainActive": "mamonIceDomain",
      "afterDomainAttacks": 3,
      "repeat": true
    },
    "effects": [
      {
        "type": "healHpFlat",
        "value": 6000000,
        "targetSide": "self"
      },
      {
        "type": "healHpFlat",
        "value": 3000000,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "restoreShieldHits",
        "value": 2,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 1,
        "targetSide": "ally",
        "targetSelection": "all"
      }
    ]
  },
  {
    "name": "โซ่ตรวนศูนย์สัมบูรณ์",
    "description": "ขณะอาณาเขตน้ำแข็งทำงาน ทุกครั้งที่โจมตีในอาณาเขตครบ 8 ครั้ง จะลดต้านสถานะของศัตรูทั้งหมด 200% เพิ่มคอสสกิลแอคทีฟอีก 1 หน่วย และสุ่มทำให้ความสามารถทั้งหมดของศัตรู 1 ใบไร้ผลในการทำงานครั้งถัดไป",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "domainActive": "mamonIceDomain",
      "afterDomainAttacks": 7,
      "repeat": true
    },
    "effects": [
      {
        "type": "statusResistance",
        "value": -2,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "activeSkillCost",
        "value": 1,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "nullifyCardAbilities",
        "targetSide": "enemy",
        "targetSelection": "random",
        "durationTriggers": 1
      }
    ]
  },
  {
    "name": "วันสิ้นโลกเยือกแข็ง: Absolute Calamity",
    "description": "ขณะอาณาเขตน้ำแข็งทำงาน ทุกครั้งที่โจมตีในอาณาเขตครบ 12 ครั้ง จะทำลายโล่ศัตรูทั้งหมด ทำให้ความสามารถของศัตรูทุกใบไร้ผลในการทำงานครั้งถัดไป และทำให้การโจมตีครั้งถัดไปสร้างดาเมจเพิ่มขึ้น 15000% โจมตีเพิ่ม 6 ฮิต พร้อมติดคริติคอล 100%",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "domainActive": "mamonIceDomain",
      "afterDomainAttacks": 11,
      "repeat": true
    },
    "effects": [
      {
        "type": "shieldHits",
        "value": -999,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "nullifyCardAbilities",
        "targetSide": "enemy",
        "targetSelection": "all",
        "durationTriggers": 1
      },
      {
        "type": "nextAttackPowerRate",
        "value": 150,
        "targetSide": "self"
      },
      {
        "type": "nextAttackHits",
        "value": 6,
        "targetSide": "self"
      },
      {
        "type": "nextAttackCriticalRate",
        "value": 1,
        "targetSide": "self"
      }
    ]
  }
]
  },
  {
    "id": 1041,
    "name": "Satoru Gojo+Yuji Itadori",
    "rarity": "EX",
    "element": [
      "น้ำ",
      "เหล็ก"
    ],
    "power": 2160000,
        "hp": 10800000,
        "defense": 864000,
    "incomePerSec": 49400,
    "upgradeDustBase": 20000,
    "upgradeDustGrowth": 1.102,
    "awakenMax": 3,
    "icon": "",
    "image": "1041.png",
    "video": "1041.mp4",
    "poster": "1041.png"
  },
  {
    "id": 1042,
    "name": "Sukuna+Dabura Karaba",
    "rarity": "EX",
    "element": [
      "ความมืด",
      "มิติ"
    ],
    "power": 2160000,
        "hp": 10800000,
        "defense": 864000,
    "incomePerSec": 49400,
    "upgradeDustBase": 20000,
    "upgradeDustGrowth": 1.102,
    "awakenMax": 3,
    "icon": "",
    "image": "1042.png",
    "video": "1042.mp4",
    "poster": "1042.png"
  },
  {
    "id": 1043,
    "name": "Yuka Okkotsu+Tsurugi Okkotsu",
    "rarity": "EX",
    "element": [
      "ไฟ",
      "ลม"
    ],
    "power": 2163000,
        "hp": 10814000,
        "defense": 865000,
    "incomePerSec": 49400,
    "upgradeDustBase": 20000,
    "upgradeDustGrowth": 1.102,
    "awakenMax": 3,
    "icon": "",
    "image": "1043.png",
    "video": "1043.mp4",
    "poster": "1043.png"
  },
  {
    "id": 38,
    "name": "EX Frieren",
    "rarity": "EX",
    "element": "มิติ",
    "power": 2187000,
        "hp": 10935000,
        "defense": 875000,
    "incomePerSec": 50000,
    "upgradeDustBase": 20000,
    "upgradeDustGrowth": 1.102,
    "awakenMax": 3,
    "icon": "",
    "image": "38.png",
    "video": "38.mp4",
    "poster": "38.png",
"ability": {
  "name": "วิเคราะห์เวทพันปี: ถอดสมการแห่งมิติ",
  "description": "ต้านสถานะ +300% และลดคอสสกิลแอคทีฟของทั้งทีม 1 หน่วย ทุกครั้งที่โจมตีครบ 6 ครั้ง จะเร่งเงื่อนไขนับการโจมตีของสกิลฝ่ายเรา 3 ครั้ง พร้อมเพิ่มคอสสกิลศัตรูทั้งหมด 1 หน่วย และลดต้านสถานะ 100% เมื่อโจมตีครบ 12 ครั้ง จะยกเลิกเงื่อนไขของสกิลพันธมิตรแบบสุ่ม 1 สกิล ทำให้สกิลนั้นทำงานทันทีหนึ่งครั้ง และผนึกสกิลศัตรูแบบสุ่ม 1 สกิลในการทำงานครั้งถัดไป",
  "activeIn": ["team", "tower", "arena"],
  "condition": {},
  "effects": [
    {
      "type": "statusResistance",
      "value": 300,
      "targetSide": "self"
    },
    {
      "type": "activeSkillCost",
      "value": -1,
      "targetSide": "self"
    },
    {
      "type": "activeSkillCost",
      "value": -1,
      "targetSide": "ally",
      "targetSelection": "all",
      "excludeSelf": true
    },
    {
      "type": "abilityConditionProgress",
      "value": 3,
      "targetSide": "self",
      "targetSelection": "all",
      "condition": {
        "afterOwnAttacks": 6,
        "repeat": true
      }
    },
    {
      "type": "abilityConditionProgress",
      "value": 3,
      "targetSide": "ally",
      "targetSelection": "all",
      "excludeSelf": true,
      "condition": {
        "afterOwnAttacks": 6,
        "repeat": true
      }
    },
    {
      "type": "activeSkillCost",
      "value": 1,
      "targetSide": "enemy",
      "targetSelection": "all",
      "condition": {
        "afterOwnAttacks": 6,
        "repeat": true
      }
    },
    {
      "type": "statusResistance",
      "value": -100,
      "targetSide": "enemy",
      "targetSelection": "all",
      "condition": {
        "afterOwnAttacks": 6,
        "repeat": true
      }
    },
    {
      "type": "ignoreAbilityCondition",
      "targetSide": "ally",
      "targetSelection": "random",
      "targetSkillSelection": "random",
      "triggerImmediately": true,
      "uses": 1,
      "condition": {
        "afterOwnAttacks": 12,
        "repeat": true
      }
    },
    {
      "type": "nullifyCardAbilities",
      "targetSide": "enemy",
      "targetSelection": "random",
      "targetSkillSelection": "random",
      "durationTriggers": 1,
      "condition": {
        "afterOwnAttacks": 12,
        "repeat": true
      }
    }
  ]
}
  },
  {
    "id": 39,
    "name": "EX Fern",
    "rarity": "EX",
    "element": "ความมืด",
    "power": 2187000,
        "hp": 10935000,
        "defense": 875000,
    "incomePerSec": 50000,
    "upgradeDustBase": 20000,
    "upgradeDustGrowth": 1.102,
    "awakenMax": 3,
    "icon": "",
    "image": "39.png",
    "video": "39.mp4",
    "poster": "39.png",
"ability": {
  "name": "โซลทราค: กระหน่ำเวทปราบอสูร",
  "description": "ทุกครั้งที่โจมตีครบ 6 ครั้ง จะเจาะต้านสถานะของศัตรูทั้งหมด 500% จากนั้นลด ATK 150%, อัตราคริติคอล 50%, อัตราหลบหลีก 50%, บล็อคเรท 50% และเพิ่มคอสสกิลแอคทีฟ 2 หน่วย ทำงานซ้ำได้",
  "activeIn": ["team", "tower", "arena"],
  "condition": {
    "afterOwnAttacks": 6,
    "repeat": true
  },
  "effects": [
    {
  "type": "statusResistance",
  "value": -5,
  "targetSide": "enemy",
  "targetSelection": "all"
    },
    {
      "type": "powerRate",
      "value": -1.5,
      "targetSide": "enemy",
      "targetSelection": "all"
    },
    {
      "type": "criticalRate",
      "value": -0.5,
      "targetSide": "enemy",
      "targetSelection": "all"
    },
    {
      "type": "dodgeRate",
      "value": -0.5,
      "targetSide": "enemy",
      "targetSelection": "all"
    },
    {
      "type": "blockRate",
      "value": -0.5,
      "targetSide": "enemy",
      "targetSelection": "all"
    },
    {
      "type": "activeSkillCost",
      "value": 2,
      "targetSide": "enemy",
      "targetSelection": "all"
    }
  ]
}
  },
  {
    "id": 40,
    "name": "EX Stark",
    "rarity": "EX",
    "element": "ไฟ",
    "power": 2187000,
        "hp": 10935000,
        "defense": 875000,
    "incomePerSec": 50000,
    "upgradeDustBase": 20000,
    "upgradeDustGrowth": 1.102,
    "awakenMax": 3,
    "icon": "",
    "image": "40.png",
    "video": "40.mp4",
    "poster": "40.png",
"activeSkill": {
  "name": "สายฟ้าฟาด: ความกล้าของนักรบ",
  "description": "ชาร์จจากการโจมตี 8 ครั้ง เมื่อใช้งานจะทำลายโล่ของเป้าหมายทั้งหมด และทำให้การโจมตีครั้งถัดไปสร้างดาเมจเพิ่มขึ้น 8000% โจมตีเพิ่ม 3 ฮิต ติดคริติคอล 100% พร้อมเพิ่มบล็อคเรทให้ตัวเอง 100% จนจบการโจมตี",
  "activeIn": ["team", "tower", "arena"],
  "chargeAttacks": 8,
  "effects": [
    {
      "type": "shieldHits",
      "value": -999,
      "targetSide": "enemy",
      "targetSelection": "specific"
    },
    {
      "type": "nextAttackPowerRate",
      "value": 80,
      "targetSide": "self"
    },
    {
      "type": "nextAttackHits",
      "value": 3,
      "targetSide": "self"
    },
    {
      "type": "nextAttackCriticalRate",
      "value": 1,
      "targetSide": "self"
    },
    {
      "type": "blockRate",
      "value": 1,
      "targetSide": "self",
      "durationAttacks": 1
    }
  ]
}
  },
  {
    "id": 41,
    "name": "EX Himmel",
    "rarity": "EX",
    "element": "แสง",
    "power": 2187000,
        "hp": 10935000,
        "defense": 875000,
    "incomePerSec": 50000,
    "upgradeDustBase": 20000,
    "upgradeDustGrowth": 1.102,
    "awakenMax": 3,
    "icon": "",
    "image": "41.png",
    "video": "41.mp4",
    "poster": "41.png",
"ability": {
  "name": "ผู้กล้าที่ถูกจดจำชั่วนิรันดร์",
  "description": "ATK/HP ของตนเอง +300% และต้านสถานะ +200%; พันธมิตรทั้งหมดได้รับ ATK +100%, อัตราคริติคอล +30% และบล็อคเรท +25% เมื่อโจมตีครบ 10 ครั้ง การโจมตีครั้งถัดไปจะทำลายโล่ศัตรู 5 ฮิต สร้างดาเมจเพิ่มขึ้น 5000% และติดคริติคอล 100% พร้อมเพิ่มโล่ให้ทั้งทีมคนละ 2 ฮิต",
  "activeIn": ["team", "tower", "arena"],
  "condition": {},
  "effects": [
    {
      "type": "selfPowerRate",
      "value": 3
    },
    {
      "type": "selfHpRate",
      "value": 3
    },
    {
      "type": "statusResistance",
      "value": 2,
      "targetSide": "self"
    },
    {
      "type": "powerRate",
      "value": 1,
      "targetSide": "ally",
      "targetSelection": "all"
    },
    {
      "type": "criticalRate",
      "value": 0.3,
      "targetSide": "ally",
      "targetSelection": "all"
    },
    {
      "type": "blockRate",
      "value": 0.25,
      "targetSide": "ally",
      "targetSelection": "all"
    },
    {
      "type": "shieldHits",
      "value": -5,
      "targetSide": "enemy",
      "targetSelection": "all",
      "condition": {
        "afterOwnAttacks": 10,
        "repeat": true
      }
    },
    {
      "type": "nextAttackPowerRate",
      "value": 50,
      "targetSide": "self",
      "condition": {
        "afterOwnAttacks": 10,
        "repeat": true
      }
    },
    {
      "type": "nextAttackCriticalRate",
      "value": 1,
      "targetSide": "self",
      "condition": {
        "afterOwnAttacks": 10,
        "repeat": true
      }
    },
    {
      "type": "restoreShieldHits",
      "value": 2,
      "targetSide": "self",
      "condition": {
        "afterOwnAttacks": 10,
        "repeat": true
      }
    },
    {
      "type": "restoreShieldHits",
      "value": 2,
      "targetSide": "ally",
      "targetSelection": "all",
      "condition": {
        "afterOwnAttacks": 10,
        "repeat": true
      }
    }
  ]
}
  },
  {
    "id": 44,
    "name": "Hana Kurusu",
    "rarity": "LR",
    "element": "น้ำ",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "44.png",
    "ability": {
      "name": "เมตตาจากสวรรค์",
      "description": "จะลบเงื่อนไขของสกิลฝ่ายเราทั้งหมดเมื่อจัดทีมไม่เกิน3คน ;(ทำงานตลอดเวลา)สกิลของการ์ดที่ชื่อ'Sukuna'ทุกฝ่ายไร้ผล ATK/HP-90%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {},
      "effects": [
        { "type": "nullifyCardAbilities", "targetSide": "ally", "targetCardIds": [1002, 1035, 1042] },
        { "type": "nullifyCardAbilities", "targetSide": "enemy", "targetCardIds": [1002, 1035, 1042] },
        { "type": "ignoreAbilityConditions", "targetSide": "ally", "condition": { "maxTeamSize": 3 } },
        { "type": "cardPowerRate", "value": -0.90, "targetSide": "enemy", "targetCardIds": [1002, 1035, 1042] },
        { "type": "cardHpRate", "value": -0.90, "targetSide": "enemy", "targetCardIds": [1002, 1035, 1042] },
        { "type": "cardPowerRate", "value": -0.90, "targetSide": "ally", "targetCardIds": [1002, 1035, 1042] },
        { "type": "cardHpRate", "value": -0.90, "targetSide": "ally", "targetCardIds": [1002, 1035, 1042] }
      ]
    }
  },
  {
    "id": 45,
    "name": "Riko Amanai",
    "rarity": "UR",
    "element": "ไร้ธาตุ",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "45.png",
    "ability": {
      "name": "เทพแห่งดวงดาว",
      "description": "เมื่ออเวกตันและเลเวล 150 จะได้รับ ; อัตราคริติคอล +20% เรทกาชา EX/SC +25% รายได้+30%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 4, "sourceMinLevel": 150 },
      "effects": [
        { "type": "criticalRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.25 },
        { "type": "gachaRarityRate", "value": 0.30, "targetRarities": ["EX", "SC"] }
      ]
    }
  },
  {
    "id": 1,
    "name": "SABER.Artoria",
    "rarity": "SC",
    "element": "แสง",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1.png",
"ability": [
  {
    "name": "แก่นมังกรแห่งราชาอัศวิน",
    "description": "ATK +500%, HP +400%, อัตราคริติคอล +50%, บล็อคเรท +50% และต้านสถานะ +300%; พันธมิตรทั้งหมดได้รับ ATK +150% และบล็อคเรท +30%",
    "activeIn": ["team", "tower", "arena"],
    "condition": {},
    "effects": [
      {
        "type": "selfPowerRate",
        "value": 5
      },
      {
        "type": "selfHpRate",
        "value": 4
      },
      {
        "type": "criticalRate",
        "value": 0.5,
        "targetSide": "self"
      },
      {
        "type": "blockRate",
        "value": 0.5,
        "targetSide": "self"
      },
      {
        "type": "statusResistance",
        "value": 3,
        "targetSide": "self"
      },
      {
        "type": "powerRate",
        "value": 1.5,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "blockRate",
        "value": 0.3,
        "targetSide": "ally",
        "targetSelection": "all"
      }
    ]
  },
  {
    "name": "Excalibur: ดาบแห่งชัยชนะตามคำสัญญา",
    "description": "เมื่อโจมตีครบ 15 ครั้ง จะปลดปล่อยแสงแห่งเอ็กซ์คาลิเบอร์ ทำลายโล่ศัตรูทั้งหมด และทำให้การโจมตีครั้งถัดไปสร้างดาเมจเพิ่มขึ้น 20000%, โจมตีเพิ่ม 7 ฮิต และติดคริติคอล 100% พร้อมเพิ่มโล่ให้ทั้งทีมคนละ 3 ฮิต ทำงานครั้งเดียวต่อไฟต์",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "afterOwnAttacks": 15,
      "repeat": false
    },
    "effects": [
      {
        "type": "shieldHits",
        "value": -999,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "nextAttackPowerRate",
        "value": 200,
        "targetSide": "self"
      },
      {
        "type": "nextAttackHits",
        "value": 7,
        "targetSide": "self"
      },
      {
        "type": "nextAttackCriticalRate",
        "value": 1,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 3,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 3,
        "targetSide": "ally",
        "targetSelection": "all"
      }
    ]
  }
]
  },
  {
    "id": 2,
    "name": "Sung Jinwoo",
    "rarity": "SC",
    "element": "มิติ",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "2.png",
"ability": [
  {
    "name": "อาณาเขตราชาแห่งเงา",
    "description": "ATK/HP ของตนเอง +500% และต้านสถานะ +500%; พันธมิตรทั้งหมดได้รับ ATK/HP +300%, อัตราคริติคอล +40%, อัตราหลบหลีก +25%, ต้านสถานะ +20% และโล่คนละ 3 ฮิต",
    "activeIn": ["team", "tower", "arena"],
    "condition": {},
    "effects": [
      {
        "type": "selfPowerRate",
        "value": 5
      },
      {
        "type": "selfHpRate",
        "value": 5
      },
      {
        "type": "statusResistance",
        "value": 5,
        "targetSide": "self"
      },
      {
        "type": "powerRate",
        "value": 3,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "hpRate",
        "value": 3,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "criticalRate",
        "value": 0.4,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "dodgeRate",
        "value": 0.25,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "statusResistance",
        "value": 0.2,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "restoreShieldHits",
        "value": 3,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 3,
        "targetSide": "ally",
        "targetSelection": "all"
      }
    ]
  },
  {
    "name": "อำนาจผู้ปกครอง: จงคุกเข่า",
    "description": "ทุกครั้งที่โจมตีครบ 8 ครั้ง จะใช้อำนาจผู้ปกครองทำลายโล่ศัตรูทั้งหมด และทำให้การโจมตีครั้งถัดไปสร้างดาเมจเพิ่มขึ้น 10000%, โจมตีเพิ่ม 8 ฮิต และติดคริติคอล 100%; พร้อมฟื้นฟู HP ให้ทั้งทีมคนละ 8,000,000 เพิ่มโล่คนละ 2 ฮิต และเพิ่ม ATK ให้พันธมิตร +50% ต่อสแต็ก สูงสุด 5 สแต็ก",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "afterOwnAttacks": 8,
      "repeat": true
    },
    "effects": [
      {
        "type": "shieldHits",
        "value": -999,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "nextAttackPowerRate",
        "value": 100,
        "targetSide": "self"
      },
      {
        "type": "nextAttackHits",
        "value": 8,
        "targetSide": "self"
      },
      {
        "type": "nextAttackCriticalRate",
        "value": 1,
        "targetSide": "self"
      },
      {
        "type": "healHpFlat",
        "value": 8000000,
        "targetSide": "self"
      },
      {
        "type": "healHpFlat",
        "value": 8000000,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "restoreShieldHits",
        "value": 2,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 2,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "increaseAttackRateStack",
        "value": 0.5,
        "targetSide": "ally",
        "targetSelection": "all",
        "maxStacks": 5
      }
    ]
  }
]
  },
  {
    "id": 3,
    "name": "Frieren",
    "rarity": "SC",
    "element": "ดิน",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "3.png",
"ability": [
  {
    "name": "มหาจอมเวทผู้ซ่อนมานานับพันปี",
    "description": "ATK/HP +500%, อัตราคริติคอล +50%, บล็อคเรท +50% และต้านสถานะ +500% พร้อมสร้างโล่ให้ทั้งทีมคนละ 3 ฮิต",
    "activeIn": ["team", "tower", "arena"],
    "condition": {},
    "effects": [
      {
        "type": "selfPowerRate",
        "value": 5
      },
      {
        "type": "selfHpRate",
        "value": 5
      },
      {
        "type": "criticalRate",
        "value": 0.5,
        "targetSide": "self"
      },
      {
        "type": "blockRate",
        "value": 0.5,
        "targetSide": "self"
      },
      {
        "type": "statusResistance",
        "value": 5,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 3,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 3,
        "targetSide": "ally",
        "targetSelection": "all"
      }
    ]
  },
  {
    "name": "โซลทราค: สุสานมหาพิภพ",
    "description": "เมื่อโจมตีครบ 8 ครั้ง จะทำลายโล่ศัตรูทั้งหมด และทำให้การโจมตีครั้งถัดไปสร้างดาเมจเพิ่มขึ้น 10000%, โจมตีเพิ่ม 8 ฮิต และติดคริติคอล 100% พร้อมฟื้นฟู HP ให้ทั้งทีมคนละ 8,000,000 และเพิ่มโล่คนละ 2 ฮิต",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "afterOwnAttacks": 8,
      "repeat": true
    },
    "effects": [
      {
        "type": "shieldHits",
        "value": -999,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "nextAttackPowerRate",
        "value": 100,
        "targetSide": "self"
      },
      {
        "type": "nextAttackHits",
        "value": 8,
        "targetSide": "self"
      },
      {
        "type": "nextAttackCriticalRate",
        "value": 1,
        "targetSide": "self"
      },
      {
        "type": "healHpFlat",
        "value": 8000000,
        "targetSide": "self"
      },
      {
        "type": "healHpFlat",
        "value": 8000000,
        "targetSide": "ally",
        "targetSelection": "all"
      },
      {
        "type": "restoreShieldHits",
        "value": 2,
        "targetSide": "self"
      },
      {
        "type": "restoreShieldHits",
        "value": 2,
        "targetSide": "ally",
        "targetSelection": "all"
      }
    ]
  }
]
  },
  {
    "id": 4,
    "name": "DEKU",
    "rarity": "SC",
    "element": "แสง",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "4.png",
    "ability": [
    {
      "name": "ผู้สืบทอดวันฟอร์ออลคนที่ 9",
      "description": "ATK +500%, HP +300%, อัตราคริติคอล +50%, อัตราหลบหลีก +30% และต้านสถานะ +300%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {},
      "effects": [
        {
          "type": "selfPowerRate",
          "value": 5
        },
        {
          "type": "selfHpRate",
          "value": 3
        },
        {
          "type": "criticalRate",
          "value": 0.5,
          "targetSide": "self"
        },
        {
          "type": "dodgeRate",
          "value": 0.3,
          "targetSide": "self"
        },
        {
          "type": "statusResistance",
          "value": 3,
          "targetSide": "self"
        }
      ]
    },
    {
      "name": "Danger Sense และ Float",
      "description": "รับรู้การโจมตีล่วงหน้า เพิ่มอัตราหลบหลีกอีก 20% และบล็อคเรท 30%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {},
      "effects": [
        {
          "type": "dodgeRate",
          "value": 0.2,
          "targetSide": "self"
        },
        {
          "type": "blockRate",
          "value": 0.3,
          "targetSide": "self"
        }
      ]
    },
    {
      "name": "Blackwhip: Internal Reinforcement",
      "description": "ทุกครั้งที่โจมตีครบ 4 ครั้ง จะใช้แบล็กวิปเสริมร่างกาย ฟื้นฟู HP 5,000,000 และเพิ่มโล่ให้ตัวเอง 2 ฮิต พร้อมเพิ่มโล่ให้พันธมิตรทุกคนคนละ 1 ฮิต",
      "activeIn": ["team", "tower", "arena"],
      "condition": {},
      "effects": [
        {
          "type": "healHpFlat",
          "value": 5000000,
          "targetSide": "self",
          "condition": {
            "afterOwnAttacks": 3,
            "repeat": true
          }
        },
        {
          "type": "restoreShieldHits",
          "value": 2,
          "targetSide": "self",
          "condition": {
            "afterOwnAttacks": 3,
            "repeat": true
          }
        },
        {
          "type": "restoreShieldHits",
          "value": 1,
          "targetSide": "ally",
          "targetSelection": "all",
          "condition": {
            "afterOwnAttacks": 3,
            "repeat": true
          }
        }
      ]
    },
    {
      "name": "Fa Jin × Gearshift",
      "description": "เมื่อโจมตีครบ 5 ครั้ง การโจมตีครั้งถัดไปจะสร้างดาเมจเพิ่มขึ้น 3000%, โจมตีเพิ่ม 4 ฮิต และติดคริติคอล 100%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "afterOwnAttacks": 5,
        "repeat": true
      },
      "effects": [
        {
          "type": "nextAttackPowerRate",
          "value": 30,
          "targetSide": "self"
        },
        {
          "type": "nextAttackHits",
          "value": 4,
          "targetSide": "self"
        },
        {
          "type": "nextAttackCriticalRate",
          "value": 1,
          "targetSide": "self"
        }
      ]
    },
    {
      "name": "Overdrive: Detroit Smash Quintuple",
      "description": "เมื่อโจมตีครบ 10 ครั้ง การโจมตีครั้งถัดไปจะสร้างดาเมจเพิ่มขึ้น 5000%, โจมตีเพิ่ม 5 ฮิต, ติดคริติคอล 100% และทำลายโล่ศัตรูทุกตัว 5 ฮิต",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "afterOwnAttacks": 10,
        "repeat": true
      },
      "effects": [
        {
          "type": "nextAttackPowerRate",
          "value": 50,
          "targetSide": "self"
        },
        {
          "type": "nextAttackHits",
          "value": 5,
          "targetSide": "self"
        },
        {
          "type": "nextAttackCriticalRate",
          "value": 1,
          "targetSide": "self"
        },
        {
          "type": "shieldHits",
          "value": -5,
          "targetSide": "enemy",
          "targetSelection": "all"
        }
      ]
    },
    {
      "name": "Plus Ultra: One For All Final Smash",
      "description": "เมื่อโจมตีครบ 25 ครั้ง จะทำลายโล่ศัตรูทั้งหมด และทำให้การโจมตีครั้งถัดไปสร้างดาเมจเพิ่มขึ้น 20000%, โจมตีเพิ่ม 7 ฮิต และติดคริติคอล 100% พร้อมฟื้นฟู HP ให้ทั้งทีมคนละ 10,000,000 และเพิ่มโล่คนละ 3 ฮิต ทำงานครั้งเดียวต่อไฟต์",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "afterOwnAttacks": 25,
        "repeat": false
      },
      "effects": [
        {
          "type": "shieldHits",
          "value": -999,
          "targetSide": "enemy",
          "targetSelection": "all"
        },
        {
          "type": "nextAttackPowerRate",
          "value": 200,
          "targetSide": "self"
        },
        {
          "type": "nextAttackHits",
          "value": 7,
          "targetSide": "self"
        },
        {
          "type": "nextAttackCriticalRate",
          "value": 1,
          "targetSide": "self"
        },
        {
          "type": "healHpFlat",
          "value": 10000000,
          "targetSide": "self"
        },
        {
          "type": "healHpFlat",
          "value": 10000000,
          "targetSide": "ally",
          "targetSelection": "all"
        },
        {
          "type": "restoreShieldHits",
          "value": 3,
          "targetSide": "self"
        },
        {
          "type": "restoreShieldHits",
          "value": 3,
          "targetSide": "ally",
          "targetSelection": "all"
        }
      ]
    }
  ]
  },
  {
    "id": 5,
    "name": "Kirito",
    "rarity": "SC",
    "element": "ลม",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "5.png",
"ability": [
  {
    "name": "นักดาบดำ",
    "description": "ATK +150% อัตราคริติคอล +25% และอัตราหลบหลีก +30%",
    "activeIn": ["team", "tower", "arena"],
    "condition": {},
    "effects": [
      {
        "type": "selfPowerRate",
        "value": 1.5
      },
      {
        "type": "criticalRate",
        "value": 0.25,
        "targetSide": "self"
      },
      {
        "type": "dodgeRate",
        "value": 0.3,
        "targetSide": "self"
      }
    ]
  },
  {
    "name": "Battle Healing",
    "description": "ทุกครั้งที่โจมตีครบ 5 ครั้ง จะฟื้นฟู HP 3,000,000 และฟื้นฟูโล่ให้ตัวเอง 1 ฮิต",
    "activeIn": ["team", "tower", "arena"],
    "condition": {},
    "effects": [
      {
        "type": "healHpFlat",
        "value": 3000000,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 4,
          "repeat": true
        }
      },
      {
        "type": "restoreShieldHits",
        "value": 1,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 4,
          "repeat": true
        }
      }
    ]
  },
  {
    "name": "สกิลดาบคู่",
    "description": "เมื่อโจมตีครบ 8 ครั้ง การโจมตีครั้งถัดไปจะโจมตีเพิ่ม 4 ฮิต สร้างดาเมจเพิ่มขึ้น 500% และติดคริติคอล 100%",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "afterOwnAttacks": 8,
      "repeat": true
    },
    "effects": [
      {
        "type": "nextAttackHits",
        "value": 4,
        "targetSide": "self"
      },
      {
        "type": "nextAttackPowerRate",
        "value": 5,
        "targetSide": "self"
      },
      {
        "type": "nextAttackCriticalRate",
        "value": 1,
        "targetSide": "self"
      }
    ]
  },
  {
    "name": "Starburst Stream",
    "description": "เมื่อโจมตีครบ 16 ครั้ง จะปล่อยคอมโบต่อเนื่อง สร้างดาเมจเพิ่มขึ้น 1600% ลดอัตราหลบหลีกของศัตรูทั้งหมด 100% และฟื้นฟู HP 5,000,000 ทำงานซ้ำได้",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "afterOwnAttacks": 15,
      "repeat": true
    },
    "effects": [
      {
        "type": "nextAttackPowerRate",
        "value": 16,
        "targetSide": "self"
      },
      {
        "type": "nextAttackCriticalRate",
        "value": 1,
        "targetSide": "self"
      },
      {
        "type": "dodgeRate",
        "value": -1,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "healHpFlat",
        "value": 5000000,
        "targetSide": "self"
      }
    ]
  }
]  },
  {
    "id": 6,
    "name": "Monkey D. Luffy",
    "rarity": "SC",
    "element": "พืช",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "6.png",
"ability": [
  {
    "name": "นักรบแห่งการปลดปล่อย",
    "description": "เมื่ออเวกตันและเลเวลถึง 220 จะเข้าสู่ร่างนิกะ ได้รับ ATK/HP +300% อัตราหลบหลีก +40% และต้านสถานะ +200%",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "sourceMinAwaken": 4,
      "sourceMinLevel": 220
    },
    "effects": [
      {
        "type": "selfPowerRate",
        "value": 3
      },
      {
        "type": "selfHpRate",
        "value": 3
      },
      {
        "type": "dodgeRate",
        "value": 0.4,
        "targetSide": "self"
      },
      {
        "type": "statusResistance",
        "value": 2,
        "targetSide": "self"
      }
    ]
  },
  {
    "name": "กลองแห่งการปลดปล่อย",
    "description": "ทุกครั้งที่โจมตีครบ 5 ครั้ง จะฟื้นฟู HP ให้ตัวเอง 5,000,000 ฟื้นฟู HP ให้พันธมิตรทุกคนคนละ 2,000,000 และเพิ่มโล่ให้ทั้งทีมคนละ 1 ฮิต",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "sourceMinAwaken": 4,
      "sourceMinLevel": 220
    },
    "effects": [
      {
        "type": "healHpFlat",
        "value": 5000000,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 4,
          "repeat": true
        }
      },
      {
        "type": "healHpFlat",
        "value": 2000000,
        "targetSide": "ally",
        "targetSelection": "all",
        "condition": {
          "afterOwnAttacks": 4,
          "repeat": true
        }
      },
      {
        "type": "restoreShieldHits",
        "value": 1,
        "targetSide": "ally",
        "targetSelection": "all",
        "condition": {
          "afterOwnAttacks": 4,
          "repeat": true
        }
      },
      {
        "type": "restoreShieldHits",
        "value": 1,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 4,
          "repeat": true
        }
      }
    ]
  },
  {
    "name": "พลังที่ไร้ขีดจำกัดของจินตนาการ",
    "description": "เมื่อโจมตีครบ 10 ครั้ง การโจมตีครั้งถัดไปจะสร้างดาเมจเพิ่มขึ้น 2000% ติดคริติคอล 100% และฟื้นฟู HP ให้ตัวเองตามจังหวะการต่อสู้ 3,000,000",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "sourceMinAwaken": 4,
      "sourceMinLevel": 220,
      "afterOwnAttacks": 10,
      "repeat": true
    },
    "effects": [
      {
        "type": "nextAttackPowerRate",
        "value": 20,
        "targetSide": "self"
      },
      {
        "type": "nextAttackCriticalRate",
        "value": 1,
        "targetSide": "self"
      },
      {
        "type": "healHpFlat",
        "value": 3000000,
        "targetSide": "self"
      }
    ]
  },
  {
    "name": "หัวเราะเข้าไว้ ลูฟี่!",
    "description": "ทุกครั้งที่โจมตีครบ 20 ครั้ง จะฟื้นฟู HP ให้ทั้งทีมคนละ 5,000,000 และเพิ่มโล่ให้ทั้งทีมคนละ 2 ฮิต ทำงานซ้ำได้",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "sourceMinAwaken": 4,
      "sourceMinLevel": 220
    },
    "effects": [
      {
        "type": "healHpFlat",
        "value": 5000000,
        "targetSide": "ally",
        "targetSelection": "all",
        "condition": {
          "afterOwnAttacks": 19,
          "repeat": true
        }
      },
      {
        "type": "healHpFlat",
        "value": 5000000,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 19,
          "repeat": true
        }
      },
      {
        "type": "restoreShieldHits",
        "value": 2,
        "targetSide": "ally",
        "targetSelection": "all",
        "condition": {
          "afterOwnAttacks": 19,
          "repeat": true
        }
      },
      {
        "type": "restoreShieldHits",
        "value": 2,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 19,
          "repeat": true
        }
      }
    ]
  }
]
  },
  {
    "id": 7,
    "name": "Satoru Gojo",
    "rarity": "LR",
    "element": "สายฟ้า",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "7.png",
    "ability": {
      "name": "มุราซากิ",
      "description": "เมื่อโจมตีครบ 50 ครั้ง จะตีเป็นดาเมจ +5000% และเพิ่มโล่ให้ทีม คนละ +4 ทำงานครั้งเดียวต่อไฟต์",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"afterOwnAttacks":50 , "repeat": false },
      "effects": [
        { "type": "nextAttackPowerRate", "value": 50, "targetSide":"self" },
        { "type": "restoreShieldHits", "value": 4, "targetSide":"ally","targetSelection" : "all" },
{
  "type": "restoreShieldHits",
  "value": 4,
  "targetSide": "self"
}
      ]
    }
  },
  {
    "id": 8,
    "name": "CID",
    "rarity": "SC",
    "element": "ความมืด",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "8.png",
"ability": [
  {
    "name": "ไอแอม...อะตอมมิค",
    "description": "เมื่อตีครบ 100 ครั้ง จะทำลายโล่ศัตรูทั้งหมด สร้างดาเมจเพิ่มขึ้น 100000% และเข้าเป้า 100%",
    "activeIn": ["team", "tower", "arena"],
    "condition": {
      "afterOwnAttacks": 99,
      "repeat": true
    },
    "effects": [
      {
        "type": "shieldHits",
        "value": -999,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "nextAttackPowerRate",
        "value": 1000,
        "targetSide": "self"
      },
      {
        "type": "dodgeRate",
        "value": -1,
        "targetSide": "enemy",
        "targetSelection": "all"
      },
      {
        "type": "dodgeRate",
        "value": 1,
        "targetSide": "enemy",
        "targetSelection": "all",
        "condition": {
          "afterOwnAttacks": 100,
          "repeat": true
        }
      }
    ]
  },
  {
    "name": "ควบคุมเวทดั่งใจนึก",
    "description": "ไม่รับผลเอฟเฟคการ์ดใดๆ",
    "activeIn": ["team", "tower", "arena"],
    "condition": {},
    "effects": [
      {
        "type": "statusResistance",
        "value": 500,
        "targetSide": "self"
      }
    ]
  }
]  },
  {
    "id": 9,
    "name": "Kamado Tanjirou",
    "rarity": "LR",
    "element": "น้ำ",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "9.png",
    "ability": [ {
      "name": "ปราณวารี",
      "description": "เมื่ออเวกตันและเลเวล 150 จะได้รับ ; ทุกครั้งที่ตี 4 ครั้ง ฟื้นฟู 3000000 ให้ตัวเอง ",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 4, "sourceMinLevel": 150 },
      "effects": [
        { "type": "healHpFlat", "value": 3000000, "targetSide": "self", "condition": {"afterOwnAttacks":3, "repeat": true} }
      ]
    },
    {
      "name": "ปราณวารีกระบวนท่าที่1 ผ่าวารี",
      "description": " เมื่อตีครบ 4 ครั้ง จะ เพิ่มดาเมจในการตีครั้งถัดไป +1000% แบบติดคริ 100% ",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"afterOwnAttacks": 4, "repeat": true},
      "effects": [
        { "type": "nextAttackPowerRate", "value": 10, "targetSide": "self" },
        { "type": "nextAttackCriticalRate", "value": 1, "targetSide": "self" }
      ]
    }
   ]
  },
  {
    "id": 10,
    "name": "Uzumaki Naruto",
    "rarity": "LR",
    "element": "ดิน",
    "power": 242000,
        "hp": 1210000,
        "defense": 96800,
    "incomePerSec": 6470,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "10.png",
    "ability": {
  "name": "โหมดเซียน",
  "description": "เมื่ออเวกตันและเลเวลถึง 150 จะได้รับ ATK/HP +500% และทั้งทีมได้รับบล็อคเรท +30%",
  "activeIn": ["team", "tower", "arena"],
  "condition": {
    "sourceMinAwaken": 4,
    "sourceMinLevel": 150
  },
  "effects": [
    {
      "type": "selfPowerRate",
      "value": 5
    },
    {
      "type": "selfHpRate",
      "value": 5
    },
    {
      "type": "blockRate",
      "value": 0.3,
      "targetSide": "ally",
      "targetSelection": "all"
    }
  ]
}
  },
  {
    "id": 1038,
    "name": "Marulu Val Vol Yelvori",
    "rarity": "LR",
    "element": "น้ำแข็ง",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1038.png",
    "ability": {
      "name": "ตั้งมั่นสานสัมพันธ์",
      "description": "ทีมเรา ATK-40% HP+90% และ เมื่ออเวกตันและเลเวล 150 โจมตี +5ฮิต",
      "activeIn": ["team", "tower", "arena"],
      "condition": {},
      "effects": [
         { "type": "teamPowerRate", "value": -0.40 },
        { "type": "teamHpRate", "value": 0.90 },
        { "type": "attackHits", "value": 5, "condition": { "sourceMinAwaken": 4, "sourceMinLevel": 150} }
      ]
    }
  },
  {
    "id": 1039,
    "name": "Yuka Okkotsu",
    "rarity": "LR",
    "element": "ลม",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1039.png",
    "ability": {
      "name": "มโหฬากาฬ",
      "description": "หากการ์ดใบนี้ ตีครบ 40 ครั้ง จะอัญเชินมหโหฬาการ ; ATK/HP+30% และทุกครั้งที่ตี6ครั้งจะได้รับโล่ +2",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "afterOwnAttacks": 39, "repeat": false },
      "effects": [
         { "type": "teamPowerRate", "value": 0.30 },
        { "type": "teamHpRate", "value": 0.30 },
        { "type": "restoreShieldHits", "value": 2, "persistentAfterActivation": true , "condition": { "afterOwnAttacks": 5, "repeat": true } }
      ]
    }
  },
  {
    "id": 1040,
    "name": "Tsurugi Okkotsu",
    "rarity": "LR",
    "element": "ไฟ",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1040.png",
    "abilities": [
      {
        "name": "สายสัมพันธ์มนุษย์และมนุษย์ต่างดาว",
        "description": "หากการ์ดใบนี้จัดทีมร่วมกับ 'Yuka Okkotsu'และ'Marulu Val Vol Yelvori'จะได้รับ; รายได้+50% และ ATK/HP+30%",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "requiredCardIds": [1039, 1038] },
        "effects": [
          { "type": "teamIncomeRate", "value": 0.50 },
          { "type": "teamPowerRate", "value": 0.3 },
          { "type": "teamHpRate", "value": 0.3 }
        ]
      },
      {
        "name": "บัญญัติสวรรค์",
        "description": "ATK/HP+150%",
        "activeIn": ["team", "tower", "arena"],
        "condition": {},
        "effects": [
          { "type": "selfHpRate", "value": 1.5 },
          { "type": "selfPowerRate", "value": 1.5 }
        ]
      }
    ]
  },
  {
    "id": 1033,
    "name": "Kinji Hakari",
    "rarity": "SC",
    "element": "มิติ",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1033.png",
    "ability": {
      "name": "พนันลั่นลาง",
      "description": "เมื่อเลเวล 220 และอเวก +4 หากทั้งทีมมีเฉพาะธาตุมิติ: การโจมตีครั้งที่ 7 จะเปิดอาณาเขต เพิ่ม HP สูงสุดและ HP ปัจจุบัน +777% จาก HP เบส จากนั้นทุก ๆ 7 การโจมตีจะฟื้นโล่ 7 ฮิตและฟื้น HP 7%",
      "activeIn": ["tower", "arena"],
      "condition": { "sourceMinLevel": 220, "sourceMinAwaken": 4, "teamElementsOnly": ["มิติ"], "afterOwnAttacks": 6, "repeat": false },
      "effects": [
        { "type": "increaseMaxHpBaseRate", "value": 7.77, "targetSide": "self" },
        { "type": "restoreShieldHits", "value": 7, "targetSide": "self", "persistentAfterActivation": true, "condition": { "afterOwnAttacks": 6, "repeat": true } },
        { "type": "healHpRate", "value": 0.07, "targetSide": "self", "persistentAfterActivation": true, "condition": { "afterOwnAttacks": 6, "repeat": true } }
      ]
    }
  },
  {
    "id": 1034,
    "name": "Hajime Kashimo",
    "rarity": "LR",
    "element": "สายฟ้า",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1034.png",
    "ability": {
      "name": "พยัคสายฟ้าทะลุทะลวง",
      "description": "หากการ์ดใบนี้ ตีครบ 12 ครั้ง ครั้งต่อไปจะตี+10ฮิต ATK+10000000",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "afterOwnAttacks": 12, "repeat": true },
      "effects": [
        { "type": "nextAttackHits", "value": 10 },
        { "type": "nextAttackPowerFlat", "value": 10000000 }
      ]
    }
  },
  {
    "id": 1023,
    "name": "Yuji Itadori",
    "rarity": "SC",
    "element": "ความมืด",
    "power": 250000,
        "hp": 1251000,
        "defense": 100000,
    "incomePerSec": 6700,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1023.png",
    "abilities": [
      {
        "name": "ผู้ใช้คุณไสยในตำนาน",
        "description": "หากอเวกตันและเลเวล 150 จะได้รับความสามารถ ; โจมตี+16ครั้ง HP+1000% เมื่อตีครบ 3 ครั้งจะได้โล่เพิ่ม +2",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "sourceMinAwaken": 4, "sourceMinLevel": 150 },
        "effects": [
         { "type": "teamHpRate", "value": 10.0 },
         { "type": "attackHits", "value": 16 },
         { "type": "restoreShieldHits", "value": 2, "condition": { "afterOwnAttacks": 2, "repeat": true } }
        ]
      },
      {
        "name": "ตัดสะบั้นV2",
        "description": "เมื่อการ์ดใบนี้มีการโจมตีมา 36 ครั้ง การโจมตีครั้งต่อไปจะ+ATK 4000% แบบเจาะโล่",
        "activeIn": ["team", "tower", "arena"],
        "condition": {},
        "effects": [
          { "type": "nextAttackPowerRate", "value": 40.0, "condition": { "afterOwnAttacks": 36, "repeat": true } },
          { "type": "nextAttackHits", "value": 99, "condition": { "afterOwnAttacks": 16, "repeat": true } }
        ]
      }
    ]
  },
  {
    "id": 1021,
    "name": "Hiromi Higuruma",
    "rarity": "LR",
    "element": "เหล็ก",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1021.png",
    "ability": {
      "name": "หลักฐานมัดตัว",
      "description": "หากการ์ดใบนี้ตีครบ 30 ครั้งจะเปิดอาณาเขต; ศัตรู ATK-100% เป็นเวลา 10 เทิร์น และความสามารถการ์ดทั้งหมดของศัตรูไร้ผล",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "afterOwnAttacks": 29, "repeat": false },
      "effects": [
        { "type": "enemyPowerRate", "value": -1 },
        { "type": "enemyPowerRate", "value": 1 , "condition": {
        "afterOwnAttacks": 10
      }
  },
        { "type": "nullifyCardAbilities","targetSide": "enemy" }
      ]
    }
  },
  {
    "id": 1022,
    "name": "Fumihiko Takaba",
    "rarity": "LR",
    "element": "ไร้ธาตุ",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1022.png",
    "ability": {
      "name": "ไม่ว่าอะไรก็จะเป็นเรื่องตลกไปหมด5555",
      "description": "หากอเวกตันและเลเวลตัน จะได้รับความสามารถ; เพิ่มอัตราคริติคอล +100% และอัตราหลบหลีก +100% เป็นเวลา 10เทิร์น และเพิ่มเรทกาชา SC/EX 50%",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "sourceMinAwaken": 4, "sourceMinLevel": 220 },
      "effects": [
        { "type": "criticalRate",
          "targetSide": "self", "value": 1 },
        {
          "type": "dodgeRate",
          "value": 1,
          "targetSide": "self"
        },
    {
      "type": "criticalRate",
      "value": -1,
      "targetSide": "self",
      "condition": {
        "afterOwnAttacks": 10
      }
    },
    {
      "type": "dodgeRate",
      "value": -1,
      "targetSide": "self",
      "condition": {
        "afterOwnAttacks": 10
      }
    },
        { "type": "gachaRarityRate", "value": 0.5, "targetRarities": ["EX", "SC"],"condition": { "mode": "team" } }
      ]
    }
  },
  {
    "id": 1001,
    "name": "Satoru Gojo",
    "rarity": "SC",
    "element": "แสง",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1001.png",
    "abilities": [
      {
        "name": "ดวงตาเรียวคุกันและไร้ขีดจำกัดล่าง",
        "description": "เพื่มรายได้กับทีม +30% อัตราหลบหลีก 100% เป็นเวลา 10 เทิร์น ;เมื่ออเวกตัน จะได้รับ ATK+200% HP+200% และโล่ +5 ;หากเลเวลตันและอเวกตัน เมื่อตีครบ 3 ครั้งจะได้โล่เพิ่ม +1",
        "activeIn": ["team", "tower", "arena"],
        "condition": {},
        "effects": [
                  { "type": "teamIncomeRate", "value": 0.3, "condition": { "mode": "team" } },
                  { "type": "dodgeRate", "value": 1,"targetSide": "self"},
                  { "type": "dodgeRate", "value": -1,"targetSide": "self", "condition": { "afterOwnAttacks": 10, "repeat": false } },                   
         { "type": "selfPowerRate", "value": 2.0, "condition": { "sourceMinAwaken": 4 } },
         { "type": "selfHpRate", "value": 2.0, "condition": { "sourceMinAwaken": 4 } },
         { "type": "shieldHits", "value": 5, "condition": { "sourceMinAwaken": 4 } },
         { "type": "restoreShieldHits", "value": 1, "condition": { "sourceMinAwaken": 4, "sourceMinLevel": 220, "afterOwnAttacks": 2, "repeat": true } }
        ]
      },
      {
        "name": "ไสยเวทย้อนกลับ",
        "description": "ทุกครั้งที่การ์ดใบนี้โจมตี จะฟื้นฟู HP ของตัวเอง 10% และลดคอส Active Skill ของตัวเอง 1 สำหรับรอบปัจจุบัน เมื่อ Active ทำงานจะเริ่มรอบใหม่จากคอสฐาน และการโจมตีครั้งนั้นยังลดคอสรอบใหม่ 1 ตามปกติ",
        "activeIn": ["team", "tower", "arena"],
        "condition": {},
        "effects": [
         { "type": "activeSkillCostCycle", "value": -1, "targetSide": "self", "condition": { "onOwnAttack": true } },
         { "type": "healHpRate", "value": 0.1, "targetSide": "self", "condition": { "onOwnAttack": true } } 
                ]
      },
      {
        "name": "มุราซากิ",
        "description": "เมื่อการ์ดใบนี้มีการโจมตีมา 30 ครั้ง การโจมตีครั้งต่อไปจะ+ATK 5000% ใช้งานได้ครั้งเดียว",
        "activeIn": ["team", "tower", "arena"],
        "condition": {},
        "effects": [
          { "type": "nextAttackPowerRate", "value": 50.0, "condition": { "afterOwnAttacks": 50, "repeat": false } }
        ]
      }
    ]
  },
  {
    "id": 1002,
    "name": "Sukuna",
    "rarity": "SC",
    "element": "แสง",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1002.png",
    "abilities": [
      {
        "name": "ราชาคำสาป",
        "description": "การ์ดใบนี้อยู่เดี่ยวได้ หรือจัดทีมร่วมกับ 'Uraume' เท่านั้น หากมีสมาชิกคนอื่น สกิลจะไม่ทำงาน",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "allowedTeammateCardIds": [1032] },
        "effects": [
           { "type": "teamPowerRate", "value": 2.0 },
         { "type": "teamHpRate", "value": 2.0 },
         { "type": "shieldHits", "value": 5 },
         { "type": "attackHits", "value": 5 },
         { "type": "restoreShieldHits", "value": 1, "condition": { "afterOwnAttacks": 3, "repeat": true } }
        ]
      },
      {
        "name": "ไสยเวทย้อนกลับ",
        "description": "ทุกครั้งที่การ์ดใบนี้โจมตี จะฟื้นฟู HP ของตัวเอง 10% และลดคอส Active Skill ของตัวเอง 1 สำหรับรอบปัจจุบัน เมื่อ Active ทำงานจะเริ่มรอบใหม่จากคอสฐาน และการโจมตีครั้งนั้นยังลดคอสรอบใหม่ 1 ตามปกติ",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "allowedTeammateCardIds": [1032] },
        "effects": [
         { "type": "activeSkillCostCycle", "value": -1, "targetSide": "self", "condition": { "onOwnAttack": true } },
         { "type": "healHpRate", "value": 0.1, "targetSide": "self", "condition": { "onOwnAttack": true } }
        ]
      },
      {
        "name": "ผ่าโลก",
        "description": "เมื่อการ์ดใบนี้มีการโจมตีมา 30 ครั้ง การโจมตีครั้งต่อไปจะ+ATK 2000% จำนวน 88 ฮิต ใช้ได้ครั้งเดียวต่อการต่อสู้",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "allowedTeammateCardIds": [1032] },
        "effects": [
          { "type": "nextAttackPowerRate", "value": 20.0, "condition": { "afterOwnAttacks": 30, "repeat": false } },
          { "type": "nextAttackHits", "value": 82, "condition": { "afterOwnAttacks": 30, "repeat": false } }
        ]
      }
    ]
  },
  {
    "id": 1003,
    "name": "Zenin Toji",
    "rarity": "LR",
    "element": "ความมืด",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1003.png",
    "abilities": [
      {
        "name": "นักล่าพ่อมด",
        "description": "เมื่ออเวกตันและเลเวล 150 การ์ดใบนี้ได้รับความสามารถ ; ลดพลังโจมตีและป้องกันลง 40% ของฝ่ายตรงข้าม และเพิ่มอัตตราคริติคอล 40% และเพิ่มโจมตีเข้าเป้า 50%",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "sourceMinLevel": 150, "sourceMinAwaken": 4 },
        "effects": [
          { "type": "criticalRate", "value": 0.4 ,"targetSide": "self" },
          { "type": "dodgeRate", "value": -0.5 ,"targetSide": "enemy" },
          { "type": "enemyDefenseRate", "value": -0.4 },
          { "type": "enemyPowerRate", "value": -0.4 }
        ]
      },
      {
        "name": "บัญญัติสวรรค์",
        "description": "ATK/HP+150% และต้านสถานะเพิ่ม 50%",
        "activeIn": ["team", "tower", "arena"],
        "condition": {},
        "effects": [
          { "type": "selfHpRate", "value": 1.5 },
          { "type": "selfPowerRate", "value": 1.5 },
        {
          "type": "statusResistance",
          "value": 0.5,
          "targetSide": "self",
          "targetSelection": "specific",
          "scope": "target"
        }
        ]
      }
    ]
  },
  {
    "id": 1004,
    "name": "Maki",
    "rarity": "LR",
    "element": "ไร้ธาตุ",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1004.png",
    "abilities": [
      {
        "name": "ผู้มีพรสวรรค์",
        "description": "เมื่ออเวกตันและเลเวล 150 การ์ดใบนี้ได้รับความสามารถ ; ATK/HP+220% และ เพิ่มอัตตราคริติคอล 25% และอัตราหลบหลีก 20%",
        "activeIn": ["team", "tower", "arena"],
        "condition": { "sourceMinLevel": 150, "sourceMinAwaken": 4 },
        "effects": [
          { "type": "criticalRate", "value": 0.25, "targetSide": "self" },
          { "type": "dodgeRate", "value": 0.20, "targetSide": "self" },
          { "type": "selfHpRate", "value": 2.2 },
          { "type": "selfPowerRate", "value": 2.2 }
        ]
      },
      {
        "name": "ความต่างชั้นและความแค้น",
        "description": "หากฝ่ายตรงข้ามมีตัวละครติดชื่อ'Zenin'การ์ดใบนี้จะทำลาย HP-100% และATK-90% ตัวละคร'Zenin'ของฝ่ายตรงข้ามทันที แต่จะไม่มีผลกับบัญญัติสวรรค์",
        "activeIn": ["team", "tower", "arena"],
        "condition": {  },
        "effects": [
          { "type": "cardPowerRate", "value": -0.9, "targetSide": "enemy", "targetCardIds": [1015,1016,1031] },          
                    { "type": "cardHpRate", "value": -1, "targetSide": "enemy", "targetCardIds": [1015,1016,1031] }
        ]
      },
      {
        "name": "บัญญัติสวรรค์",
        "description": "ATK/HP+150% และต้านสถานะเพิ่ม 50%",
        "activeIn": ["team", "tower", "arena"],
        "condition": {},
        "effects": [
          { "type": "selfHpRate", "value": 1.5 },
          { "type": "selfPowerRate", "value": 1.5 },
        {
          "type": "statusResistance",
          "value": 0.5,
          "targetSide": "self",
          "targetSelection": "specific",
          "scope": "target"
        }
        ]
      }
    ]
  },
  {
    "id": 1005,
    "name": "Okkotsu Yuta",
    "rarity": "SC",
    "element": "ไร้ธาตุ",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1005.png",
        "abilities": [
  {
    "name": "ริกะจัง",
    "description": "เมื่อจัดทีมไม่เกิน 4 ตัวละคร การ์ดใบนี้จะได้รับ ATK และ HP เพิ่มขึ้น 90% และทุกครั้งที่โจมตีครบ 3 ครั้ง จะฟื้นฟู HP ของตัวเอง 5%",
    "activeIn": [
      "team",
      "tower",
      "arena"
    ],
    "condition": {
      "maxTeamSize": 4
    },
    "effects": [
      {
        "type": "healHpRate",
        "value": 0.05,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 2,
          "repeat": true
        }
      },
      {
        "type": "selfHpRate",
        "value": 0.90
      },
      {
        "type": "selfPowerRate",
        "value": 0.90
      }
    ]
  },
     {
    "name": "อาคมก็อปปี้",
    "description": "เมื่อโจมตีครบ 10 ครั้ง ยูตะจะสุ่มคัดลอกสกิล 1 สกิลจากการ์ดทั้งสนาม สามารถถือสกิลคัดลอกได้เพียง 1 สกิล สกิลจะคงอยู่โดยไม่จำกัดเวลาและหายทันทีหลังเปิดใช้ จากนั้นจึงเริ่มสะสมการโจมตี 10 ครั้งใหม่",
    "activeIn": [
      "tower",
      "arena"
    ],
    "condition": {
      "maxTeamSize": 4
    },
    "effects": [
      {
        "type": "copyAbilities",
        "targetSide": "both",
        "condition": {
          "afterOwnAttacks": 9,
          "repeat": true
        },
        "targetSelection": "random",
        "targetCount": 1,
        "successRate": 1,
        "abilitySelection": "random",
        "abilityCount": 1,
        "recipientSide": "self",
        "copiedAbilityMaxUses": 1,
        "copiedAbilityExpireOnUse": true,
        "replacePreviousCopy": false,
        "maxCopiedAbilities": 1,
        "pauseCopyChargeWhileStocked": true,
        "resetCopyChargeOnCopiedAbilityExpire": true
      }
    ]
  },
  {
    "name": "ริกะบีม",
    "description": "เมื่อจัดทีมไม่เกิน 4 ตัวละคร หลังจากการ์ดใบนี้โจมตีครบ 20 ครั้ง การโจมตีครั้งที่ 21 จะยิงลำแสงทะลุทะลวง ได้รับ ATK เพิ่มเติม 20,000,000 และเพิ่มจำนวนฮิตอีก 99 ฮิต ทำงานครั้งเดียวต่อการต่อสู้",
    "activeIn": [
      "team",
      "tower",
      "arena"
    ],
    "condition": {
      "maxTeamSize": 4
    },
    "effects": [
      {
        "type": "nextAttackPowerFlat",
        "value": 20000000,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 20,
          "repeat": false
        }
      },
      {
        "type": "nextAttackHits",
        "value": 99,
        "targetSide": "self",
        "condition": {
          "afterOwnAttacks": 20,
          "repeat": false
        }
      }
      ]
      }
     ]
  },
  {
    "id": 1006,
    "name": "Yuki Tsukumo",
    "rarity": "LR",
    "element": "มิติ",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1006.png",
    "ability": {
      "name": "นายชอบผู้หญิงแบบไหนล่ะ",
      "description": "เมื่อการ์ดนี้อยู่ในทีม ทั้งทีมจะได้รับ HP+100% และเมื่อตีครบ 5 ครั้ง ได้รับโล่ +3 และลดคอสสกิล 2 ครั้งให้พันธมิตรทุกคน ;ทำงานเฉพาะโหมด Tower",
      "activeIn": ["tower"],
      "condition": {},
      "effects": [
        { "type": "restoreShieldHits", "value": 3, "targetSide": "ally", "condition": { "afterOwnAttacks": 4, "repeat": true } },
        { "type": "activeSkillCostCycle", "value": -2, "targetSide": "ally" , "excludeSelf": true,"condition": { "afterOwnAttacks": 4, "repeat": true } },
        { "type": "teamHpRate", "value": 1 }
      ]
    }
  },
  {
    "id": 1007,
    "name": "Suguru Geto",
    "rarity": "LR",
    "element": "มิติ",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1007.png",
         "abilities": [
  {
    "name": "วิชาควบคุมคำสาป",
    "description": "เมื่อการ์ดใบนี้เป็นลีดเดอร์ การ์ดคำสาปทุกใบในทีมฝ่ายตรงข้ามจะถูกลด ATK, HP และ DEF ลง 50% ส่วนการ์ดคำสาปในทีมฝ่ายเราจะได้รับ ATK, HP และ DEF เพิ่มขึ้น 20%",
    "activeIn": [
      "team",
      "tower",
      "arena"
    ],
    "condition": {
      "leaderOnly": true
    },
    "effects": [
      {
        "type": "cardPowerRate",
        "value": -0.50,
        "targetSide": "enemy",
        "targetCardIds": [
          1002,
          1024,
          1025,
          1026,
          1027,
          1030,
          1035,
          1042
        ]
      },
      {
        "type": "cardHpRate",
        "value": -0.50,
        "targetSide": "enemy",
        "targetCardIds": [
          1002,
          1024,
          1025,
          1026,
          1027,
          1030,
          1035,
          1042
        ]
      },
      {
        "type": "cardDefenseRate",
        "value": -0.50,
        "targetSide": "enemy",
        "targetCardIds": [
          1002,
          1024,
          1025,
          1026,
          1027,
          1030,
          1035,
          1042
        ]
      },
      {
        "type": "cardPowerRate",
        "value": 0.20,
        "targetSide": "ally",
        "targetCardIds": [
          1002,
          1024,
          1025,
          1026,
          1027,
          1030,
          1035,
          1042
        ]
      },
      {
        "type": "cardHpRate",
        "value": 0.20,
        "targetSide": "ally",
        "targetCardIds": [
          1002,
          1024,
          1025,
          1026,
          1027,
          1030,
          1035,
          1042
        ]
      },
      {
        "type": "cardDefenseRate",
        "value": 0.20,
        "targetSide": "ally",
        "targetCardIds": [
          1002,
          1024,
          1025,
          1026,
          1027,
          1030,
          1035,
          1042
        ]
      }
      ]
      }
     ]
    },
  {
    "id": 1008,
    "name": "Kenjaku",
    "rarity": "SC",
    "element": "ความมืด",
    "power": 243000,
        "hp": 1215000,
        "defense": 97200,
    "incomePerSec": 6500,
    "upgradeDustBase": 2800,
    "upgradeDustGrowth": 1.078,
    "awakenMax": 4,
    "icon": "",
    "image": "1008.png",
    "ability": {
      "name": "กลยุทธ์ของคำสาปฉันเหนือกว่า",
      "description": "หากการ์ดใบนี้เป็นหลีดเดอร์และ เมื่อจัดทีมกับคำสาปหรือนักสาปแช่งที่ไม่ใช่การ์ด'Sukuna' ; ATK/HP-10%และยกเลิกเงื่อนไขสกิลของคำสาปหรือนักสาปแช่งในทีมทั้งหมด",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "leaderOnly": true, "anyCardIds": [ 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032] },
      "effects": [
        { "type": "teamPowerRate", "value": -0.1 },
        { "type": "teamHpRate", "value": -0.1 },
        { "type": "ignoreAbilityConditions", "targetSide": "ally", "targetCardIds": [1034, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032], "targetMatch": "any" }
      ]
    }
  },
  {
    "id": 1009,
    "name": "Yuji Itadori",
    "rarity": "UR",
    "element": "สายฟ้า",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1009.png",
    "ability": {
      "name": "ภาชนะของสุคุนะ",
      "description": "หากการ์ดใบนี้จัดทีมกับ'Nobara Kugisaki'UR หรือ 'megimi fushiguro'UR หรือ 'gojo stouru'LR หรือ 'Todo aoi'; คริติคอลเรท+15% และ ทุกการโจมตี 4 ครั้ง จะติดคริติคอล 100% ในการโจมตีครั้งถัดไป ",
    "activeIn": [
        "team",
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "criticalRate",
          "value": 0.15
        },
        {
          "type": "nextAttackCriticalRate",
          "value": 1,
          "targetSide": "self",
          "condition": {
            "afterOwnAttacks": 4,
            "repeat": true
          }
        }
      ],
      "condition": {
        "anyCardIds": [
          1010,
          1011,
          7,
          1013
        ]
      }
    }
},
  {
    "id": 1010,
    "name": "Nobara Kugisaki",
    "rarity": "UR",
    "element": "น้ำแข็ง",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1010.png",
    "ability": {
      "name": "เสียงสั่นพ้อง",
      "description": " เมื่อเริ่มต้นจะลดพลังป้องกันฝ่ายตรงข้ามลง 10% ; หากการ์ดใบนี้ถูกจัดรวมกับ 'Gojo'Legends;Yuji'UR และ Megumi'UR ทุกครั้งที่ตี3ครั้งจะเพิ่มคอสการใช้สกิลให้ฝั่งตรงข้าม 1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {},
      "effects": [
        {
          "type": "enemyDefenseRate",
          "value": -0.2
        },
        {
          "type": "activeSkillCostCycle",
          "value": 1,
          "targetSide": "enemy",
          "condition": { "requiredCardIds": [1009, 1011, 1001],
            "afterOwnAttacks": 2,
            "repeat": true
          }
        }
      ]
    }
  },
  {
    "id": 1011,
    "name": "Megumi Fushiguro",
    "rarity": "UR",
    "element": "ความมืด",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1011.png",
    "ability": {
      "name": "สวนแห่ง10เงา",
      "description": "หากการ์ดใบนี้เป็นหลีดเดอร์ เมื่อตีครบ 7 ครั้ง ; กางอาณาเขตสวนแห่งเงา การโจมตี 10 ครั้งหลังจากนี้ จะเข้าเป้า 100% ทำงานครั้งเดียวต่อการต่อสู้",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "leaderOnly": true, "afterOwnAttacks": 6, "repeat": false },
      "effects": [
        { "type": "attackHits",
      "value": 99,
      "persistentAfterActivation": true,
      "maxStacks": 10,
      "condition": {
        "afterOwnAttacks": 0,
        "repeat": true }
        }
      ]
    }
  },
  {
    "id": 1012,
    "name": "Kento Nanami",
    "rarity": "UR",
    "element": "สายฟ้า",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1012.png",
    "ability": {
      "name": "ได้เวลาโอทีแล้ว...",
      "description": "เมื่อตีครบ 3 ครั้ง ตีครั้งต่อไปจะบวก ATK+5400000 ",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "afterOwnAttacks": 3, "repeat": true },
      "effects": [
        { "type": "nextAttackPowerFlat", "value": 5400000 }
      ]
    }
  },
  {
    "id": 1036,
    "name": "Toge Inumaki",
    "rarity": "UR",
    "element": "น้ำแข็ง",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1036.png",
    "ability": {
      "name": "หยุดซ้ะ",
      "description": "ลด DEF ฝั่งตรงข้าม 10% ; เมื่อใส่ 'panda'UR;'maki'UR;'yuta'LR ในทีม ทุกครั้งที่ตีครบ 3 ครั้ง จะเพิ่มคอส Active skill ให้ฝั่งตรงข้าม +1",
      "activeIn": ["team", "tower","arena"],
      "condition": {},
      "effects": [
        { "type": "enemyDefenseRate", "value": -0.1 },
        {
          "type": "activeSkillCostCycle",
          "value": 1,
          "targetSide": "enemy",
          "condition": {
            "afterOwnAttacks": 2,
            "repeat": true, "requiredCardIds": [1037, 1016, 1005]
          }
        }
      ]
    }
  },
  {
    "id": 1037,
    "name": "Panda",
    "rarity": "UR",
    "element": "เหล็ก",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1037.png",
    "ability": {
  "name": "ชิกิกามิที่พูดได้",
  "description": "เพิ่มรายได้ของทีม 30% และเมื่อจัด Inumaki UR, Maki UR และ Yuta LR อยู่ในทีม ทุกครั้งที่การ์ดใบนี้โจมตีครบ 2 ครั้ง จะฟื้นฟูโล่ให้ฝ่ายพันธมิตร 1 ฮิต สูงสุด 8 ฮิต",
  "activeIn": ["team", "tower", "arena"],
  "condition": {},
  "effects": [
    {
      "type": "teamIncomeRate",
      "value": 0.30
    },
    {
      "type": "restoreShieldHits",
      "value": 1,
      "targetSide": "ally",
      "maxStacks": 8,
      "condition": {
        "afterOwnAttacks": 1,
        "repeat": true,
        "requiredCardIds": [1036, 1016, 1005]
      }
    }
  ]
}
  },
  {
    "id": 1013,
    "name": "Aoi Todo",
    "rarity": "UR",
    "element": "สายฟ้า",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1013.png",
    "ability": {
      "name": "มายบราเทอร์",
      "description": "เพิ่มอัตราคริติคอล 20%; เมื่อจัดทีมกับ 'Itadori Yuji'ระดับ UR ในทีมแค่ 2 คน; ATK/HP +200% โจมตีและโล่เพิ่มอย่างละ +4",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
      },
      "effects": [
        { "type": "teamPowerRate", "value": 2.0,"condition": {"requiredCardIds": [1009], "maxTeamSize": 2
      } },
        { "type": "teamHpRate", "value": 2.0,"condition": {"requiredCardIds": [1009], "maxTeamSize": 2
      } },
        { "type": "shieldHits", "value": 4,"condition": {"requiredCardIds": [1009], "maxTeamSize": 2
      } },
        { "type": "attackHits", "value": 4,"condition": {"requiredCardIds": [1009], "maxTeamSize": 2
      } },
        { "type": "criticalRate", "value": 0.20 }
      ]
    }
  },
  {
    "id": 1014,
    "name": "Momo Nishimiya",
    "rarity": "UR",
    "element": "ลม",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1014.png",
    "ability": {
      "name": "ทอร์นาโด",
      "description": "เพิ่มอัตราคริติคอล 25% ทุกครั้งที่การ์ดใบนี้ตีครบ 3 ครั้ง จะเพิ่ม ATK+5% ให้ผู้ใช้ไสยเวทในทีม (สูงสุด 5 ครั้ง)",
      "activeIn": ["team", "tower","arena"],
      "condition": { },
      "effects": [
        { "type": "criticalRate", "value": 0.25 },
        { "type": "increaseAttackRateStack",
          "value": 0.05,
          "targetSide": "ally",
          "targetCardIds":[43, 44, 45, 1001, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 42, 1021, 1022, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1036, 1037, 1038, 1039, 1040, 1041, 1043, 7, 26],
          "condition": {
            "afterOwnAttacks": 2,
            "repeat": true
          },
          "maxStacks": 5 }
      ]
    }
  },
  {
    "id": 1015,
    "name": "Mai Zenin",
    "rarity": "UR",
    "element": "เหล็ก",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1015.png",
    "ability": {
      "name": "ฝาแฝดเซนอิง",
      "description": "เมื่อในทีมมีตัวละครที่ชื่อ 'Maki' ; ตัวละครทั้งคู่จะได้รับ โล่ +2",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "anyCardIds": [1016, 1004]
      },
      "effects": [
        { "type": "shieldHits", "value": 4 }
      ]
    }
  },
  {
    "id": 1016,
    "name": "Maki Zenin",
    "rarity": "UR",
    "element": "ลม",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1016.png",
    "ability": {
      "name": "ผู้ไร้พรสวรรค์",
      "description": " ATK+200% ;อเวกตัน เจาะโล่ + 1 ฮิต';เลเวลตัน สกิลของตัวละคร'Naoya'ไร้ผล",
      "activeIn": ["team", "tower", "arena"],
      "condition": { 
      },
      "effects": [
        { "type": "selfPowerRate", "value": 2.0 },
        { "type": "attackHits", "value": 1, "condition": {"sourceMinAwaken": 5 } },
        { "type": "nullifyCardAbilities", "targetSide": "enemy", "targetCardIds": [1031], "condition": {"sourceMinLevel": 180 } }
      ]
    }
  },
  {
    "id": 1017,
    "name": "Kasumi Miwa",
    "rarity": "UR",
    "element": "ดิน",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1017.png",
    "ability": {
      "name": "อณาเขตแบบย่อ",
      "description": "หากในทีมมีผู้ใช้ไสยเวทนอกจากตัวเอง ; เจาะโล่ + 2 ฮิต",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "anyCardIds": [43, 44, 45, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 42, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 7, 26]
      },
      "effects": [
        { "type": "attackHits", "value": 2 }
      ]
    }
  },
  {
    "id": 1018,
    "name": "Kokichi Muta",
    "rarity": "UR",
    "element": "ดิน",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1018.png",
    "ability": {
      "name": "MegaMARU!!!",
      "description": "หากการ์ดใบนี้อเวกตันและเลเวลตัน ; ตัวเองได้รับ ATK/HP +9000000 และ เมื่อโจมตีครั้งที่ 5 จะตีเข้า 100% ทำงานครั้งเดียว;จะใส่ได้แค่ 4 ตัวละคร",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
         "maxTeamSize": 4, "sourceMinAwaken": 5, "sourceMinLevel": 180
      },
      "effects": [
        { "type": "teamPowerFlat", "value": 9000000 },
        { "type": "teamHpFlat", "value": 9000000 },
        { "type": "nextAttackHits", "value": 99, "condition": {"afterOwnAttacks": 4, "repeat": false } }
      ]
    }
  },
  {
    "id": 1019,
    "name": "Mei Mei",
    "rarity": "UR",
    "element": "ไฟ",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1019.png",
    "ability": {
      "name": "เงินมาก่อนงานถึงเดิน",
      "description": "เมื่อจัดลงทีมโชว์ รายได้+50%;เงื่อนไขห้ามใส่เกิน3คน",
      "activeIn": ["team"],
      "condition": {
        "maxTeamSize": 3
      },
      "effects": [
        { "type": "teamIncomeRate", "value": 0.5 }
      ]
    }
  },
  {
    "id": 1020,
    "name": "Utahime Iori",
    "rarity": "UR",
    "element": "ดิน",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1020.png",
    "ability": {
      "name": "อาณาเขตเสริมพลัง",
      "description": "หากอเวกตันและเลเวลตัน และมีผู้ใช้ไสยเวทในทีมนอกจากตัวเอง; เพื่อนร่วมทีที่เป็นผู้ใช้ไสยเวทเพิ่ม ATK/HP +40% ;คำสาปในทีม ATK/HP -90%;ฝั่งตรงข้าม -40%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "sourceMinAwaken": 5, "sourceMinLevel": 180,
                "anyCardIds": [43, 44, 45, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 42, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 7, 26]
      },
      "effects": [
        { "type": "cardPowerRate", "value": 0.4, "targetCardIds":[43, 44, 45, 1001, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 42, 1021, 1022, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1036, 1037, 1038, 1039, 1040, 1041, 1043, 7, 26] },
        { "type": "cardPowerRate", "value": -0.9, "targetCardIds": [1002, 1042, 1035, 1024, 1025, 1026, 1027, 1030, 1041, 1023] },
        { "type": "cardHpRate", "value": 0.4, "targetCardIds":[43, 44, 45, 1001, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 42, 1021, 1022, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1036, 1037, 1038, 1039, 1040, 1041, 1043, 7, 26] },
        { "type": "cardHpRate", "value": -0.9, "targetCardIds": [1002, 1042, 1035, 1024, 1025, 1026, 1027, 1030, 1041, 1023] },
        { "type": "cardPowerRate", "value": -0.4, "targetSide": "enemy", "targetCardIds": [1002, 1042, 1035, 1024, 1025, 1026, 1027, 1030, 1041, 1023] },
        { "type": "cardHpRate", "value": -0.4, "targetSide": "enemy", "targetCardIds": [1002, 1042, 1035, 1024, 1025, 1026, 1027, 1030, 1041, 1023] }
      ]
    }
  },
  {
    "id": 1035,
    "name": "Sukuna",
    "rarity": "UR",
    "element": "เหล็ก",
    "power": 81200,
        "hp": 406000,
        "defense": 32500,
    "incomePerSec": 2310,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1035.png",
    "ability": {
      "name": "อารามสงฆ์ซ่อนมาร",
      "description": "หากอเวกตันและเลเวลตัน และมีคนเดียวในทีมจะเก่งขึ้น 300% โจมตี 8 ครั้งและเพิ่มโล่ 8",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "sourceMinAwaken": 5, "sourceMinLevel": 180,
                "maxTeamSize": 1, "leaderOnly": true
      },
      "effects": [
        { "type": "selfPowerRate", "value": 3.0 },
        { "type": "selfHpRate", "value": 3.0 },
        { "type": "attackHits", "value": 7 },
        { "type": "shieldHits", "value": 8 }
      ]
    }
  },
  {
    "id": 1024,
    "name": "Jogo",
    "rarity": "UR",
    "element": "ไฟ",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1024.png",
    "ability": {
      "name": "ฝาโลงภูผาเหล็ก",
      "description": "หากอเวกตันและเลเวลตัน สมาชิกทีมที่มีธาตุไฟได้รับ ATK+20% และเจาะโล่เพิ่ม +1 ฮิต ",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "sourceMinAwaken": 5, "sourceMinLevel": 180
      },
      "effects": [
        { "type": "elementPowerRate", "value": 0.20, "targetElements": ["ไฟ"] },
        { "type": "attackHits", "value": 3, "targetElements": ["ไฟ"]}
      ]
    }
  },
  {
    "id": 1025,
    "name": "Hanami",
    "rarity": "UR",
    "element": "พืช",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1025.png",
    "ability": {
      "name": "พงไพรดอกไม้",
      "description": "หากอเวกตันและเลเวลตัน สมาชิกทีมที่มีธาตุพืชได้รับ ATK+20% และได้เจาะโล่เพิ่ม +1 ฮิต ",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "sourceMinAwaken": 5, "sourceMinLevel": 180
      },
      "effects": [
        { "type": "elementPowerRate", "value": 0.20, "targetElements": ["พืช"] },
        { "type": "attackHits", "value": 1, "targetElements": ["พืช"]}
      ]
    }
  },
  {
    "id": 1026,
    "name": "Dagon",
    "rarity": "UR",
    "element": "น้ำ",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1026.png",
    "ability": {
      "name": "มหาสมุทร",
      "description": "หากอเวกตันและเลเวลตัน สมาชิกทีมที่มีธาตุน้ำได้รับ ATK+20% และทีมเจาะโล่ +1 ฮิต ",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "sourceMinAwaken": 5, "sourceMinLevel": 180
      },
      "effects": [
        { "type": "elementPowerRate", "value": 0.20, "targetElements": ["น้ำ"] },
        { "type": "attackHits", "value": 1, "targetElements": ["น้ำ"]}
      ]
    }
  },
  {
    "id": 1027,
    "name": "Mahito",
    "rarity": "UR",
    "element": "พืช",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1027.png",
    "ability": {
      "name": "ธรรมชาติแปรผัน",
      "description": "เมื่อจัดเข้าทีมที่มีคำสาปอยู่ ทีมได้รับ ATK+15%/HP+15%; หากอเวกตัน/เลเวลตัน เมื่อตีครบ 3 ครั้ง จะได้รับฟื้นฟูเลือด 15% ",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "anyCardIds": [1026, 1025, 1024, 1035, 1002, 1042, 1041, 1023]
      },
      "effects": [
        { "type": "teamPowerRate", "value": 0.15 },
        { "type": "teamHpRate", "value": 0.15 },
        { "type": "increaseMaxHpBaseRate", "value": 0.15, "condition": { "afterOwnAttacks":2,"sourceMinAwaken": 5, "sourceMinLevel": 180 } }
      ]
    }
  },
  {
    "id": 1028,
    "name": "Takako Uro",
    "rarity": "UR",
    "element": "มิติ",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1028.png",
    "ability": {
      "name": "พื้นที่ไร้จำกัด..ท้องฟ้าคืออณาเขตของข้า",
      "description": "เมื่อจัดเข้าทีมที่มีผู้ใช้ไสยเวทอยู่นอกจากตัวเอง ตัวเองได้รับ HP +90%; หากอเวกตัน/เลเวลตัน ทีมได้รับโล่เพิ่ม +2 ",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "anyCardIds": [43, 44, 45, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1029, 42, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 7, 26]
      },
      "effects": [
        { "type": "selfHpRate", "value": 0.9 },
        { "type": "shieldHits", "value": 2, "condition": { "sourceMinAwaken": 5, "sourceMinLevel": 180 } }
      ]
    }
  },
  {
    "id": 1029,
    "name": "Ryu Ishigori",
    "rarity": "UR",
    "element": "แสง",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1029.png",
    "ability": {
      "name": "ไสยเวททะลุทะลวง",
      "description": "เมื่อจัดเข้าทีมที่มีผู้ใช้ไสยเวทอยู่นอกจากตัวเอง ตัวเองได้รับ ATK +80%; หากอเวกตัน/เลเวลตัน เจาะโล่ 3 ฮิต",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "anyCardIds": [43, 44, 45, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 42, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 7, 26]
      },
      "effects": [
        { "type": "selfPowerRate", "value": 0.8 },
        { "type": "attackHits", "value": 2, "condition": { "sourceMinAwaken": 5, "sourceMinLevel": 180 } }
      ]
    }
  },
  {
    "id": 1030,
    "name": "Choso",
    "rarity": "UR",
    "element": "น้ำ",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1030.png",
    "ability": {
      "name": "เจาะโลหิต",
      "description": "เมื่อจัดเข้าทีมที่มีผู้ใช้ไสยเวทอยู่นอกจากตัวเอง ทีมได้รับ HP +18%; หากมีผู้ใช้ไสยเวทชื่อ 'Yuji' อยู่ด้วย เจาะโล่เพิ่ม +2 ฮิต",
      "activeIn": ["team", "tower", "arena"],
      "condition": {
        "anyCardIds": [43, 44, 45, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 42, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 7, 26]
      },
      "effects": [
        { "type": "teamPowerRate", "value": 0.18 },
        { "type": "attackHits", "value": 2, "condition": { "anyCardIds": [26, 1041, 1023, 1009] } }
      ]
    }
  },
  {
    "id": 1031,
    "name": "Naoya Zenin",
    "rarity": "UR",
    "element": "มิติ",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1031.png",
    "ability": {
      "name": "24fps...",
      "description": "เมื่อจัดทีมเพียงการ์ดใบนี้ใบเดียว จะได้รับ ATK/HP +1000%, เจาะโล่ 7 ฮิตและ มีโล่+7",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "leaderOnly": true, "maxTeamSize": 1 },
      "effects": [
        { "type": "selfPowerRate", "value": 10.0 },
        { "type": "selfHpRate", "value": 10.0 },
        { "type": "attackHits", "value": 6 },
        { "type": "shieldHits", "value": 7 }
      ]
    }
  },
  {
    "id": 1032,
    "name": "Uraume",
    "rarity": "UR",
    "element": "น้ำแข็ง",
    "power": 81000,
        "hp": 405000,
        "defense": 32400,
    "incomePerSec": 2300,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "1032.png",
    "ability": {
      "name": "เหมันนิรันด์กาล...",
      "description": "เมื่อจัดเข้าทีมที่มีผู้ใช้ไสยเวท 'Sukuna' อยู่, ทีมฝ่ายตรงข้าม DEF-40%",
      "activeIn": ["tower", "arena"],
      "condition": {"anyCardIds": [1035, 1042, 1002] },
      "effects": [ 
        { "type": "enemyDefenseRate", "value": -0.4 }
      ]
        }
  },
  {
    "id": 43,
    "name": "Kirara Hoshi",
    "rarity": "UR",
    "element": "มิติ",
    "power": 80400,
        "hp": 402000,
        "defense": 32200,
    "incomePerSec": 2280,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "43.png",
  "abilities": [
    {
      "name": "รางดาวซ่อนแอบ",
      "description": "เมื่อจัดเข้าทีมที่มีผู้ใช้ไสยเวท 'Kinji Hakari' ; ทุกครั้งที่ตีครบ 3 ครั้ง จะทำฝ่ายตรงข้าม จะถูกเพิ่มคอสในการใช้สกิลเพิ่มขึ้น 2 ครั้ง และลดคอสสกิลแอคทีฟของ 'Kinji Hakari' ลง 1 ครั้ง ทุกครั้งที่สกิลนี้ทำงาน",
      "activeIn": [
        "tower",
        "arena"
      ],
      "effects": [
        {
          "type": "activeSkillCostCycle",
          "value": 2,
          "targetSide": "enemy",
        },
        {
          "type": "activeSkillCostCycle",
          "value": -1,
          "targetCardIds": [
            1033
          ]
        }
      ],
      "condition": {
        "requiredCardIds": [
          1033
        ],
        "afterOwnAttacks": 2,
        "repeat": true
      }
    }
  ]
},
  {
    "id": 42,
    "name": "Shoko Ieiri",
    "rarity": "UR",
    "element": "พืช",
    "power": 80400,
        "hp": 402000,
        "defense": 32200,
    "incomePerSec": 2280,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "42.png",
    "ability": {
      "name": "ไสยเวทย้อนกลับ...",
      "description": "เมื่อจัดเข้าทีม; ทีมได้รับ HP+5000000;เมื่ออเวกตัน/เลเวลตัน ได้รับความสามารถเพิ่ม ;เมื่อตีครบ 4 ครั้ง ฟื้นฟู +5000000",
      "activeIn": ["tower", "arena"],
      "condition": {},
      "effects": [
        { "type": "teamHpFlat", "value": 5000000 },
        { "type": "healHpFlat", "value": 5000000, "condition": { "sourceMinLevel": 180, "sourceMinAwaken": 5, "afterOwnAttacks": 3, "repeat": true } }
      ]
        }
  },
  {
    "id": 46,
    "name": "Kaoruko Waguri(YukiSuit)",
    "rarity": "UR",
    "element": "น้ำแข็ง",
    "power": 80400,
        "hp": 402000,
        "defense": 32200,
    "incomePerSec": 2280,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "46.png",
    "ability": {
      "name": "ไม่มีที่ไหนจะดีไปกว่าการได้เจอเธอทุกวัน...",
      "description": "หากจัดทีมร่วมกับการ์ด 'Yuki Suou(WaguriSuit)' ;การ์ดที่ชื่อ 'Yuki Suou(WaguriSuit)'ได้รับการยกเลิกเงื่อนไข และ ทีมได้รับรายได้+10%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"requiredCardIds": [37]},
      "effects": [
        { "type": "teamIncomeRate", "value": 0.1 },
        { "type": "ignoreAbilityConditions", "targetSide": "ally", "targetCardIds": [37],"targetMatch": "all" }
      ]
        }
  },
  {
    "id": 37,
    "name": "Yuki Suou(WaguriSuit)",
    "rarity": "UR",
    "element": "น้ำแข็ง",
    "power": 80400,
        "hp": 402000,
        "defense": 32200,
    "incomePerSec": 2280,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "37.png",
    "ability": {
      "name": "คัพCที่ขยำได้ดีกว่าคัพDที่ขยำไม่ได้เป็นไหนๆ...",
      "description": "หากจัดทีมน้ำแข็งครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ HP+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "น้ำแข็ง":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamHpRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.20 }
      ]
        }
  },
  {
    "id": 11,
    "name": "Goku",
    "rarity": "UR",
    "element": "พืช",
    "power": 80400,
        "hp": 402000,
        "defense": 32200,
    "incomePerSec": 2280,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "11.png",
    "ability": {
      "name": "S2...",
      "description": "หากจัดทีมพืชครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ ATK+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "พืช":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamPowerRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.20 }
      ]
        }
  },
  {
    "id": 12,
    "name": "Zenitsu",
    "rarity": "UR",
    "element": "สายฟ้า",
    "power": 80400,
        "hp": 402000,
        "defense": 32200,
    "incomePerSec": 2280,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "12.png",
    "ability": {
      "name": "ปราณสายฟ้ากระบวนท่าที่ 1...",
      "description": "หากจัดทีมสายฟ้าครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ ATK+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "สายฟ้า":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamPowerRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.20 }
      ]
        }
  },
  {
    "id": 13,
    "name": "Roroa Zoro",
    "rarity": "UR",
    "element": "เหล็ก",
    "power": 80400,
        "hp": 402000,
        "defense": 32200,
    "incomePerSec": 2280,
    "upgradeDustBase": 750,
    "upgradeDustGrowth": 1.064,
    "awakenMax": 5,
    "icon": "",
    "image": "13.png",
    "ability": {
      "name": "ตรีสหกโลกธาตุรวมเป็น1...",
      "description": "หากจัดทีมเหล็กครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ HP+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "เหล็ก":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamHpRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.20 }
      ]
        }
  },
  {
    "id": 36,
    "name": "Yuki Suou",
    "rarity": "SSR",
    "element": "ไฟ",
    "power": 27800,
        "hp": 139000,
        "defense": 11100,
    "incomePerSec": 824,
    "upgradeDustBase": 220,
    "upgradeDustGrowth": 1.052,
    "awakenMax": 7,
    "icon": "",
    "image": "36.png",
    "ability": {
      "name": "พี่ชายมายบราเทอร์...",
      "description": "หากจัดทีมไฟครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ ATK+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "ไฟ":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamPowerRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.20 }
      ]
        }
  },
  {
    "id": 14,
    "name": "Saber Alter",
    "rarity": "SSR",
    "element": "ความมืด",
    "power": 27000,
        "hp": 135000,
        "defense": 10800,
    "incomePerSec": 800,
    "upgradeDustBase": 220,
    "upgradeDustGrowth": 1.052,
    "awakenMax": 7,
    "icon": "",
    "image": "14.png",
    "ability": {
      "name": "จงลิ้มรสดาบฉันซ้ะ...",
      "description": "หากจัดทีมความมืดครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ HP+20% ,รายได้รวม +25%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "ความมืด":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamHpRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.25 }
      ]
        }
  },
  {
    "id": 15,
    "name": "Yuki Asuna",
    "rarity": "SSR",
    "element": "แสง",
    "power": 27000,
        "hp": 135000,
        "defense": 10800,
    "incomePerSec": 800,
    "upgradeDustBase": 220,
    "upgradeDustGrowth": 1.052,
    "awakenMax": 7,
    "icon": "",
    "image": "15.png",
    "ability": {
      "name": "ประกายแสงแห่งหวัง...",
      "description": "หากจัดทีมแสงครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ ATK+20% ,รายได้รวม +25%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "แสง":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamPowerRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.25 }
      ]
        }
  },
  {
    "id": 16,
    "name": "Sinobu",
    "rarity": "SSR",
    "element": "น้ำ",
    "power": 27000,
        "hp": 135000,
        "defense": 10800,
    "incomePerSec": 800,
    "upgradeDustBase": 220,
    "upgradeDustGrowth": 1.052,
    "awakenMax": 7,
    "icon": "",
    "image": "16.png",
    "ability": {
      "name": "ลิ้มรสพิษของฉันไหม...",
      "description": "หากจัดทีมน้ำครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ HP+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "น้ำ":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamHpRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.2 }
      ]
        }
  },
  {
    "id": 17,
    "name": "Nami",
    "rarity": "SSR",
    "element": "ลม",
    "power": 27000,
        "hp": 135000,
        "defense": 10800,
    "incomePerSec": 800,
    "upgradeDustBase": 220,
    "upgradeDustGrowth": 1.052,
    "awakenMax": 7,
    "icon": "",
    "image": "17.png",
    "ability": {
      "name": "เงินอยู่ในอากาศ...",
      "description": "หากจัดทีมลมครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ ATK+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"minElementCount": { "ลม":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamPowerRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.2 }
      ]
        }
  },
  {
    "id": 18,
    "name": "Waguri Kaoruko",
    "rarity": "SSR",
    "element": "ดิน",
    "power": 27000,
        "hp": 135000,
        "defense": 10800,
    "incomePerSec": 800,
    "upgradeDustBase": 220,
    "upgradeDustGrowth": 1.052,
    "awakenMax": 7,
    "icon": "",
    "image": "18.png",
    "ability": {
      "name": "เค้กชิ้นนี้ซื้อที่ไหนคะ...",
      "description": "หากจัดทีมดินครบ5ใบ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมได้รับ HP+20% ,รายได้รวม +20%",
      "activeIn": ["team", "tower", "arena"],
      "condition": { "minElementCount": { "ดิน":5}, "leaderOnly": true},
      "effects": [
        { "type": "teamHpRate", "value": 0.2 },
        { "type": "teamIncomeRate", "value": 0.2 }
      ]
        }
  },
  {
    "id": 19,
    "name": "Aria",
    "rarity": "SR",
    "element": "น้ำแข็ง",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "19.png",
    "ability": {
      "name": "โนๆฉันไม่ได้ชอบนายสักหน่อย...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุน้ำแข็งได้รับ ATK/HP +40%,และโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "น้ำแข็ง":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["น้ำแข็ง"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["น้ำแข็ง"] },
        { "type": "shieldHits", "value": 1 }
      ]
        }
  },
  {
    "id": 20,
    "name": "Inosuke",
    "rarity": "SR",
    "element": "พืช",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "20.png",
    "ability": {
      "name": "ลูกน้องของข้าตามข้ามา...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุพืชได้รับ ATK/HP +40%,และได้เจาะโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "พืช":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["พืช"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["พืช"] },
        { "type": "attackHits", "value": 1 }
      ]
        }
  },
  {
    "id": 21,
    "name": "Uraraka",
    "rarity": "SR",
    "element": "สายฟ้า",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "21.png",
    "ability": {
      "name": "ไม่มีอะไรต้องกังวล...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุสายฟ้าได้รับ ATK/HP +40%,และได้เจาะโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "สายฟ้า":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["สายฟ้า"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["สายฟ้า"] },
        { "type": "attackHits", "value": 1 }
      ]
        }
  },
  {
    "id": 22,
    "name": "Sakura",
    "rarity": "SR",
    "element": "ดิน",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "22.png",
    "ability": {
      "name": "หรือจะมีเรื่อง...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุดินได้รับ ATK/HP +40%,และโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "ดิน":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["ดิน"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["ดิน"] },
        { "type": "shieldHits", "value": 1 }
      ]
        }
  },
  {
    "id": 23,
    "name": "Miku",
    "rarity": "SR",
    "element": "น้ำ",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "23.png",
    "ability": {
      "name": "เสียงเพลงของฉัน..จะดังกังวาล",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุน้ำได้รับ ATK/HP +40%,และโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "น้ำ":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["น้ำ"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["น้ำ"] },
        { "type": "shieldHits", "value": 1 }
      ]
        }
  },
  {
    "id": 24,
    "name": "Zero Two",
    "rarity": "SR",
    "element": "ความมืด",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "24.png",
    "ability": {
      "name": "มีอะไรน่าสนใจ...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุมืดได้รับ ATK/HP +40%,และโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "ความมืด":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["ความมืด"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["ความมืด"] },
        { "type": "shieldHits", "value": 1 }
      ]
        }
  },
  {
    "id": 25,
    "name": "Vegeta",
    "rarity": "SR",
    "element": "แสง",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "25.png",
    "ability": {
      "name": "แกมันกระจอก...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุแสงได้รับ ATK/HP +40%,และเจาะโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "แสง":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["แสง"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["แสง"] },
        { "type": "attackHits", "value": 1 }
      ]
        }
  },
  {
    "id": 26,
    "name": "Itadori Yuji",
    "rarity": "SR",
    "element": "ลม",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "26.png",
    "ability": {
      "name": "เฮเทคเคน!!!",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุลมได้รับ ATK/HP +40%,และเจาะโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "ลม":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["ลม"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["ลม"] },
        { "type": "attackHits", "value": 1 }
      ]
        }
  },
  {
    "id": 27,
    "name": "Asuka",
    "rarity": "SR",
    "element": "ไฟ",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "27.png",
    "ability": {
      "name": "ไปซ้ะให้พ้น...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุไฟได้รับ ATK/HP +40%,และเจาะโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "ไฟ":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["ไฟ"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["ไฟ"] },
        { "type": "attackHits", "value": 1 }
      ]
        }
  },
  {
    "id": 28,
    "name": "Stark",
    "rarity": "SR",
    "element": "เหล็ก",
    "power": 9000,
        "hp": 45000,
        "defense": 3600,
    "incomePerSec": 280,
    "upgradeDustBase": 70,
    "upgradeDustGrowth": 1.04,
    "awakenMax": 9,
    "icon": "",
    "image": "28.png",
    "ability": {
      "name": "นักรบ...",
      "description": "หากการ์ดนี้อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีมแล้วตนเองเป็นหลีดเดอร์ (จัดทีมช่อง 1),ทุกคนในทีมที่เป็นธาตุเหล็กได้รับ ATK/HP +40%,และโล่+1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinAwaken": 9, "minElementCount": { "เหล็ก":2}, "leaderOnly": true},
      "effects": [
        { "type": "elementPowerRate", "value": 0.4, "targetElements": ["เหล็ก"] },
        { "type": "elementHpRate", "value": 0.4, "targetElements": ["เหล็ก"] },
        { "type": "shieldHits", "value": 1 }
      ]
        }
  },
  {
    "id": 29,
    "name": "Monkey D. Luffy",
    "rarity": "R",
    "element": "ไฟ",
    "power": 3000,
        "hp": 15000,
        "defense": 1200,
    "incomePerSec": 100,
    "upgradeDustBase": 25,
    "upgradeDustGrowth": 1.032,
    "awakenMax": 11,
    "icon": "",
    "image": "29.png",
    "ability": {
      "name": "เกียร์ 2...",
      "description": "หากการ์ดนี้เลเวล 120/อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีม ตนเองได้รับATK +100%,HP +100%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinLevel": 120, "sourceMinAwaken": 11},
      "effects": [
        { "type": "selfPowerRate", "value": 1.0 },
        { "type": "selfHpRate", "value": 1.0 }
      ]
        }
  },
  {
    "id": 30,
    "name": "Uzumaki Naruto",
    "rarity": "R",
    "element": "ลม",
    "power": 3000,
        "hp": 15000,
        "defense": 1200,
    "incomePerSec": 100,
    "upgradeDustBase": 25,
    "upgradeDustGrowth": 1.032,
    "awakenMax": 11,
    "icon": "",
    "image": "30.png",
    "ability": {
      "name": "โหมดคลั่ง...",
      "description": "หากการ์ดนี้เลเวล 120/อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีม ตนเองได้รับATK +100%,HP +100%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinLevel": 120, "sourceMinAwaken": 11},
      "effects": [
        { "type": "selfPowerRate", "value": 1.0 },
        { "type": "selfHpRate", "value": 1.0 }
      ]
        }
  },
  {
    "id": 31,
    "name": "Goku",
    "rarity": "R",
    "element": "แสง",
    "power": 3000,
        "hp": 15000,
        "defense": 1200,
    "incomePerSec": 100,
    "upgradeDustBase": 25,
    "upgradeDustGrowth": 1.032,
    "awakenMax": 11,
    "icon": "",
    "image": "31.png",
    "ability": {
      "name": "หมัดไคโอ...",
      "description": "หากการ์ดนี้เลเวล 120/อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีม ตนเองได้รับATK +200%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinLevel": 120, "sourceMinAwaken": 11},
      "effects": [
        { "type": "selfPowerRate", "value": 2.0 }
      ]
        }
  },
  {
    "id": 32,
    "name": "Ichigo Kurosaki",
    "rarity": "R",
    "element": "น้ำ",
    "power": 3000,
        "hp": 15000,
        "defense": 1200,
    "incomePerSec": 100,
    "upgradeDustBase": 25,
    "upgradeDustGrowth": 1.032,
    "awakenMax": 11,
    "icon": "",
    "image": "32.png",
    "ability": {
      "name": "บังไค...",
      "description": "หากการ์ดนี้เลเวล 120/อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีม ตนเองได้รับATK +200%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinLevel": 120, "sourceMinAwaken": 11},
      "effects": [
        { "type": "selfPowerRate", "value": 2.0 }
      ]
        }
  },
  {
    "id": 33,
    "name": "Kobi",
    "rarity": "N",
    "element": "ไร้ธาตุ",
    "power": 1000,
        "hp": 5000,
        "defense": 400,
    "incomePerSec": 35,
    "upgradeDustBase": 10,
    "upgradeDustGrowth": 1.025,
    "awakenMax": 13,
    "icon": "",
    "image": "33.png",
    "ability": {
      "name": "ทหารเรือปกป้องประชาชน...",
      "description": "หากการ์ดนี้เลเวล 100/อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีม ได้โล่ +2",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinLevel": 100, "sourceMinAwaken": 13},
      "effects": [
        { "type": "shieldHits", "value": 2 }
      ]
        }
  },
  {
    "id": 34,
    "name": "Conan",
    "rarity": "N",
    "element": "ไร้ธาตุ",
    "power": 1000,
        "hp": 5000,
        "defense": 400,
    "incomePerSec": 35,
    "upgradeDustBase": 10,
    "upgradeDustGrowth": 1.025,
    "awakenMax": 13,
    "icon": "",
    "image": "34.png",
    "ability": {
      "name": "ความจริงมีเพียง1เดียว...",
      "description": "หากการ์ดนี้เลเวล 100/อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีม ได้เจาะโล่ +1",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinLevel": 100, "sourceMinAwaken": 13},
      "effects": [
        { "type": "attackHits", "value": 1 }
      ]
        }
  },
  {
    "id": 35,
    "name": "Sung Jinwoo",
    "rarity": "N",
    "element": "ไร้ธาตุ",
    "power": 1000,
        "hp": 5000,
        "defense": 400,
    "incomePerSec": 35,
    "upgradeDustBase": 10,
    "upgradeDustGrowth": 1.025,
    "awakenMax": 13,
    "icon": "",
    "image": "35.png",
    "ability": {
      "name": "จงตื่น...ตัวฉัน",
      "description": "หากการ์ดนี้เลเวล 100/อเวกตัน ,เมื่อการ์ดนี้อยู่ในทีม อัตราคริติคอล +5%,เรทกาชา ระดับ SR/SSR +5%",
      "activeIn": ["team", "tower", "arena"],
      "condition": {"sourceMinLevel": 100, "sourceMinAwaken": 13},
      "effects": [
        { "type": "gachaRarityRate", "value": 0.05, "targetRarities": ["SR", "SSR"] },
        { "type": "criticalRate", "value": .05 }
      ]
        }
  }
];
