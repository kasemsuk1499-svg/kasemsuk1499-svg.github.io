วิธีวางภาพบอสแบบโฟลเดอร์ ID

ตัวอย่าง:
boss/10001/boss.js
boss/10001/boss.png

ใน boss.js ใส่ image: "boss.png" หรือไม่ใส่ image ก็ได้ ระบบจะหา boss/<id>/boss.png อัตโนมัติ
ถ้าอยากใช้ชื่ออื่น เช่น fullart.webp ให้ใส่ image: "fullart.webp" แล้ววางไฟล์ไว้ที่ boss/<id>/fullart.webp
ถ้าใส่ URL เต็ม หรือ path ที่มี / ระบบจะใช้ path นั้นตรง ๆ
