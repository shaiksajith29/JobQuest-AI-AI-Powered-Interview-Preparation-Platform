const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, hash], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User registered" });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err || result.length === 0) return res.status(401).json({ error: "Invalid" });
    const match = await bcrypt.compare(password, result[0].password);
    if (!match) return res.status(401).json({ error: "Invalid" });
    const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: result[0].id, name: result[0].name } });
  });
});

module.exports = router;
