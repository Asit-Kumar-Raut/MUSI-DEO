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

// HELPERS FOR DUAL-SOURCE MUSIC STREAMING
async function getItunesMusic(query) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=30`);
    const data = await res.json();
    const results = (data.results || []).map(track => {
      const highResImage = track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '500x500bb') : '/media/sujal.jpg';
      const durationSec = track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 180;
      return {
        id: track.trackId.toString(),
        name: track.trackName,
        primaryArtists: track.artistName,
        image: [
          { link: track.artworkUrl30 || highResImage },
          { link: track.artworkUrl60 || highResImage },
          { link: highResImage }
        ],
        downloadUrl: [
          { link: track.previewUrl || '' },
          { link: track.previewUrl || '' },
          { link: track.previewUrl || '' },
          { link: track.previewUrl || '' },
          { link: track.previewUrl || '' }
        ],
        duration: durationSec
      };
    }).filter(s => s.downloadUrl[0].link);
    
    return {
      status: 'SUCCESS',
      data: { results }
    };
  } catch (err) {
    console.error("[MUSIC] iTunes Search API failed:", err.message);
    return {
      status: 'ERROR',
      message: err.message,
      data: { results: [] }
    };
  }
}

async function getMusicTrending() {
  try {
    console.log("[MUSIC] Trying JioSaavn API for trending hits...");
    const res = await fetch('https://jiosaavn-api.vercel.app/search?query=latest bollywood');
    if (res.status === 200) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return {
          status: 'SUCCESS',
          data: {
            results: data.results.map(s => ({
              id: s.id,
              name: s.title,
              primaryArtists: s.more_info?.singers || s.description?.split(' · ')[1] || 'Various Artists',
              image: [
                { link: s.images?.["50x50"] || s.image },
                { link: s.images?.["150x150"] || s.image },
                { link: s.images?.["500x500"] || s.image }
              ],
              downloadUrl: [
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' }
              ],
              duration: 180
            })).filter(s => s.downloadUrl[0].link)
          }
        };
      }
    }
    throw new Error(`JioSaavn returned status ${res.status}`);
  } catch (err) {
    console.error("[MUSIC] JioSaavn Trending failed:", err.message);
    console.log("[MUSIC] Falling back to iTunes Search API...");
    return await getItunesMusic('latest bollywood');
  }
}

async function searchMusic(query) {
  try {
    console.log(`[MUSIC] Trying JioSaavn API for search: "${query}"...`);
    const res = await fetch(`https://jiosaavn-api.vercel.app/search?query=${encodeURIComponent(query)}`);
    if (res.status === 200) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return {
          status: 'SUCCESS',
          data: {
            results: data.results.map(s => ({
              id: s.id,
              name: s.title,
              primaryArtists: s.more_info?.singers || s.description?.split(' · ')[1] || 'Various Artists',
              image: [
                { link: s.images?.["50x50"] || s.image },
                { link: s.images?.["150x150"] || s.image },
                { link: s.images?.["500x500"] || s.image }
              ],
              downloadUrl: [
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' },
                { link: s.more_info?.vlink || '' }
              ],
              duration: 180
            })).filter(s => s.downloadUrl[0].link)
          }
        };
      }
    }
    throw new Error(`JioSaavn returned status ${res.status}`);
  } catch (err) {
    console.error(`[MUSIC] JioSaavn search failed for "${query}":`, err.message);
    console.log("[MUSIC] Falling back to iTunes Search API...");
    return await getItunesMusic(query);
  }
}

// MUSIC API ENDPOINTS
app.get('/api/music/trending', async (req, res) => {
  console.log("HIT: /api/music/trending");
  const data = await getMusicTrending();
  res.json(data);
});

app.get('/api/music/search', async (req, res) => {
  console.log("HIT: /api/music/search");
  const q = req.query.q || 'arijit';
  const data = await searchMusic(q);
  res.json(data);
});

// LYRICS ENDPOINT
app.get('/api/music/lyrics', async (req, res) => {
  console.log("HIT: /api/music/lyrics");
  try {
    const songId = req.query.songId;
    if (!songId) {
      return res.status(400).json({ error: "songId is required" });
    }
    
    // Split key if it has a prefix like "saavn-"
    const cleanId = songId.startsWith('saavn-') ? songId.replace('saavn-', '') : songId;
    
    console.log(`[MUSIC] Fetching lyrics for song ID: ${cleanId}`);
    const lyricsRes = await fetch(`https://jiosaavn-api.vercel.app/lyrics?id=${cleanId}`);
    if (lyricsRes.status === 200) {
      const data = await lyricsRes.json();
      if (data.status && data.lyrics) {
        return res.json({ lyrics: data.lyrics });
      }
    }
    res.json({ lyrics: null });
  } catch (err) {
    console.error("[MUSIC] Lyrics fetch error:", err.message);
    res.json({ lyrics: null });
  }
});

// Auth Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({ 
    status: "ok", 
    port: PORT, 
    database: dbStatus,
    message: "MUSI-DEO API v2" 
  });
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
