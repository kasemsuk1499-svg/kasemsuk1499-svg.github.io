ACC_REGISTER_CARD({
  id: 889,
  name: "ผู้จัดการอาเรีย",
  rarity: "EX",
  element: "มิติ",
  balanceSchemaVersion: 4,
  power: 15000,
  hp: 150000,
  defense: 12000,
  speed: 106,
  incomePerSec: 396,
  normalAttackTargetCount: 2,
  upgradeDustBase: 1107,
  upgradeDustGrowth: 1.017,
  awakenMax: 20,
  icon: "",
  image: "card/889/889.png",
  poster: "card/889/889.png",

  abilities: [
    {
      name: "แผนการจัดการทั่วไป",
      description: "เมื่อการ์ดใบนี้ยืนบนสนาม จะทำการเพิ่มคอสถาวรฝ่ายตรงข้าม 2 และทุกการโจมตีครบ 3 ครั้ง จะมีโอกาสสตั้นเป้าหมาย 5 เป้าหมาย นาน 2 เทิร์น โอกาส 20%",
      activeIn: ["team", "tower", "arena"],
      effects: [
        {
          type: "activeSkillCostPermanent",
          value: 2,
          targetSide: "enemy"
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          condition: {
            afterOwnAttacks: 2,
            repeat: true
          },
          targetSelection: "all",
          status: "stun",
          successRate: 0.2,
          targetCount: 5,
          durationTurns: 2
        }
      ]
    },
    {
      name: "การจัดการรายบุคคล",
      description: "เมื่ออยู่คู่กับ เมกุมินเด็กฝึกงาน เงินเดือน +25% และเพิ่มฐานเงินเดือนอีก 6000 บาท",
      activeIn: ["team", "tower", "arena"],
      effects: [
        {
          type: "selfIncomeRate",
          value: 0.25,
          targetSide: "self"
        },
        {
          type: "teamIncomeFlat",
          value: 6000,
          targetSide: "ally"
        }
      ],
      condition: {
        requiredCardIds: [888]
      }
    }
  ]
});