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
      description: "เมื่อการ์ดใบนี้ยืนบนสนาม จะเพิ่มคอสถาวรฝ่ายตรงข้าม 2 และทุกการโจมตีครบ 3 ครั้ง จะโจมตี/เล็งศัตรู 5 เป้าหมาย แล้วมีโอกาสสตั้นแต่ละเป้าหมาย 20% นาน 2 เทิร์น",
      activeIn: ["team", "tower", "arena"],
      effects: [
        {
          type: "activeSkillCostPermanent",
          value: 2,
          targetSide: "enemy"
        },
        {
          type: "nextAttackTargetCount",
          value: 5,
          targetSide: "self",
          condition: {
            afterOwnAttacks: 2,
            repeat: true
          }
        },
        {
          type: "applyStatus",
          targetSide: "enemy",
          targetSelection: "random",
          targetCount: 5,
          status: "stun",
          successRate: 0.2,
          durationTurns: 2,
          condition: {
            afterOwnAttacks: 2,
            repeat: true
          }
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
