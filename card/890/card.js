ACC_REGISTER_CARD({
  id: 890,
  name: "อลิซเลขาส่วนตัว",
  rarity: "EX",
  element: "แสง",
  balanceSchemaVersion: 4,
  power: 30000,
  hp: 150000,
  defense: 12000,
  speed: 106,
  incomePerSec: 330,
  normalAttackTargetCount: 1,
  targetSelection: "default",
  upgradeDustBase: 1107,
  upgradeDustGrowth: 1.017,
  awakenMax: 20,
  image: "card/890/890.png",
  abilities: [
    {
      name: "คุ้มกันภัยอันตรายท่านหัวหน้า",
      description: "เมื่อการ์ดใบนี้ตีครบ 3 ครั้ง จะล้างสถาะผิดปกติให้เพื่อนร่วมทีม 3 คน แบบสุ่ม หากมีหัวหน้า จะล้างสถานะให้หัวหน้าเพิ่มด้วย",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "cleanseStatuses",
          targetSide: "ally",
          targetSelection: "random",
          targetCount: 3
        },
        {
          type: "cleanseStatuses",
          targetSide: "teammates",
          targetCardIds: [
            900
          ],
          targetSelection: "specific",
          targetCount: 1
        }
      ],
      condition: {
        afterOwnAttacks: 2,
        repeat: true
      }
    },
    {
      name: "เคลียร์ตารางงาน",
      description: "เมื่อโจมตีครบ 5 ครั้ง จะทำการขจัดบัพเป้าหมาย 5 เป้าหมาย อัตรา 40%",
      activeIn: [
        "team",
        "tower",
        "arena",
        "worldBoss"
      ],
      effects: [
        {
          type: "purgeBuffs",
          targetSide: "enemy",
          targetSelection: "all",
          successRate: 0.4
        }
      ],
      attackTargetCount: 5,
      condition: {
        afterOwnAttacks: 4,
        repeat: true
      }
    }
  ]
});