const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5001; // CHANGED TO 5001 TO AVOID CONFLICTS

app.use(cors());
app.use(express.json());

// DEBUG LOGGING
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// MUSIC API (DIRECTLY AT TOP)
app.get('/api/music/trending', async (req, res) => {
  console.log("HIT: /api/music/trending");
  try {
    const SAAVN_API = 'https://jiosaavn-api-privatecvc2.vercel.app';
    const response = await fetch(`${SAAVN_API}/search/songs?query=latest bollywood&limit=50`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/music/search', async (req, res) => {
  console.log("HIT: /api/music/search");
  try {
    const q = req.query.q || 'arijit';
    const SAAVN_API = 'https://jiosaavn-api-privatecvc2.vercel.app';
    const response = await fetch(`${SAAVN_API}/search/songs?query=${encodeURIComponent(q)}&limit=30`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: "ok", port: PORT, message: "MUSI-DEO API v2" });
});

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb+srv://asitraut2006_db_user:0CpGUoNn0hMnd8d3@cluster0.ehruu5p.mongodb.net/musideo?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log("✅ Database Connected on 5001"))
  .catch(err => console.error("❌ Database Error:", err.message));

app.listen(PORT, () => {
  console.log(`\n----------------------------------`);
  console.log(`🚀 NEW SERVER RUNNING ON PORT ${PORT}`);
  console.log(`----------------------------------\n`);
});
