# Character artworks

อัปโหลดรูปตัวละครไว้ในโฟลเดอร์นี้ เช่น:

- `rimuru_01.jpg`
- `rimuru_02.jpg`
- `gojo_01.webp`

จากนั้นเปิด `../data/characters.json` แล้วใส่ path แบบนี้:

```json
{
  "id": "rimuru",
  "name": "Rimuru Tempest",
  "images": [
    "images/rimuru_01.jpg",
    "images/rimuru_02.jpg"
  ]
}
```

ตัวละครหนึ่งตัวใส่ได้หลายรูป และระบบจะสุ่มอาร์ตทุกครั้งที่ตัวละครนั้นถูกเลือกเป็นโจทย์

ถ้ามีหลาย record แต่ใช้ `id` เดียวกัน ระบบจะรวมเป็นตัวละครเดียวอัตโนมัติ