const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connection String ของ MongoDB Atlas
const mongoURI = 'mongodb+srv://Jerry:12345@cluster0.cjuhp4u.mongodb.net/PunJerr';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Atlas Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// 1. Schema ผู้ใช้งาน (User)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 2. Schema รายการสั่งซื้อ (Order)
const orderSchema = new mongoose.Schema({
  username: { type: String, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// ==================================================
// API SYSTEM
// ==================================================

// API สมัครสมาชิก
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username หรือ Email นี้ถูกใช้งานแล้ว' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
});

// API เข้าสู่ระบบ
app.post('/api/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${loginId}$`, 'i') } },
        { email: { $regex: new RegExp(`^${loginId}$`, 'i') } }
      ]
    });

    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Username/Email หรือ Password ไม่ถูกต้อง' });
    }

    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: { username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// API สั่งซื้อสินค้า
app.post('/api/buy', async (req, res) => {
  try {
    const { username, productName, price } = req.body;

    if (!username || !productName || !price) {
      return res.status(400).json({ error: 'ข้อมูลคำสั่งซื้อไม่ถูกต้อง' });
    }

    const newOrder = new Order({ username, productName, price });
    await newOrder.save();

    res.status(201).json({ message: 'สั่งซื้อสำเร็จ! บันทึกลง MongoDB เรียบร้อย' });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกการสั่งซื้อ' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});