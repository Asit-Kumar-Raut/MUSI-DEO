const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const CryptoJS = require('crypto-js');


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

const parseDuration = (dStr) => {
  if (!dStr) return 180;
  const parts = dStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parseInt(dStr) || 180;
};

function decryptMediaUrl(encryptedUrl) {
  if (!encryptedUrl) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("[DECRYPT ERROR]", err.message);
    return '';
  }
}

function getDownloadUrls(decryptedUrl) {
  if (!decryptedUrl) return [];
  const extensions = ['_12', '_48', '_96', '_160', '_320'];
  const baseParts = decryptedUrl.split('_96');
  if (baseParts.length > 1) {
    const ext = baseParts[baseParts.length - 1];
    const prefix = baseParts.slice(0, -1).join('_96');
    return extensions.map(bitrate => ({
      link: prefix + bitrate + ext
    }));
  }
  return [
    { link: decryptedUrl },
    { link: decryptedUrl },
    { link: decryptedUrl },
    { link: decryptedUrl },
    { link: decryptedUrl }
  ];
}

function mapOfficialSaavnSong(s) {
  const encryptedMediaUrl = s.more_info?.encrypted_media_url;
  const decrypted = decryptMediaUrl(encryptedMediaUrl);
  
  if (!decrypted) return null;

  const downloadUrl = getDownloadUrls(decrypted);

  const durationStr = s.more_info?.duration || '';
  const duration = parseInt(durationStr) || 180;

  const title = s.title ? s.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';

  const image150 = s.image || '';
  const image50 = image150.replace('150x150', '50x50');
  const image500 = image150.replace('150x150', '500x500');

  const artistNames = s.more_info?.artistMap?.primary_artists?.map(a => a.name).join(', ')
    || s.more_info?.music
    || 'Various Artists';

  return {
    id: s.id,
    name: title,
    primaryArtists: artistNames,
    image: [
      { link: image50 },
      { link: image150 },
      { link: image500 }
    ],
    downloadUrl: downloadUrl,
    duration: duration
  };
}

const JIOSAAVN_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cookie': 'L=english; gdpr_acceptance=true;'
};

async function fetchOfficialSaavnSearch(query) {
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=web64s`;
  const res = await fetch(url, { headers: JIOSAAVN_HEADERS });
  if (res.status !== 200) {
    throw new Error(`Official JioSaavn returned status ${res.status}`);
  }
  const data = await res.json();
  return data.results || data || [];
}

async function getMusicTrending() {
  try {
    console.log("[MUSIC] Fetching official trending/latest bollywood...");
    const songs = await fetchOfficialSaavnSearch('latest bollywood');
    const mapped = songs
      .map(mapOfficialSaavnSong)
      .filter(Boolean);
      
    if (mapped.length > 0) {
      return {
        status: 'SUCCESS',
        data: { results: mapped }
      };
    }
    throw new Error("No songs returned from official search");
  } catch (err) {
    console.error("[MUSIC] JioSaavn Trending failed:", err.message);
    console.log("[MUSIC] Falling back to iTunes Search API...");
    return await getItunesMusic('latest bollywood');
  }
}

async function searchMusic(query) {
  try {
    console.log(`[MUSIC] Fetching official JioSaavn search: "${query}"...`);
    const songs = await fetchOfficialSaavnSearch(query);
    const mapped = songs
      .map(mapOfficialSaavnSong)
      .filter(Boolean);
      
    if (mapped.length > 0) {
      return {
        status: 'SUCCESS',
        data: { results: mapped }
      };
    }
    throw new Error("No songs returned from official search");
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

// DOWNLOAD PROXY ENDPOINT FOR SAME-ORIGIN DIRECT BROWSER DOWNLOADS
app.get('/api/music/download', async (req, res) => {
  console.log("HIT: /api/music/download");
  try {
    const audioUrl = req.query.url;
    const songName = req.query.name || 'song';
    if (!audioUrl) {
      return res.status(400).json({ error: "url is required" });
    }
    
    // Clean non-safe characters for headers
    const cleanName = songName.replace(/[^a-zA-Z0-9\s-_]/g, '');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName)}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    
    // Fetch and send buffer
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio stream: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("[DOWNLOAD ERROR]", err.message);
    res.status(500).json({ error: "Download failed" });
  }
});


// Auth Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  let dbStatus = "Disconnected";
  const state = mongoose.connection.readyState;
  if (state === 1) dbStatus = "Connected";
  else if (state === 2) dbStatus = "Connecting...";
  else if (state === 3) dbStatus = "Disconnecting...";

  res.json({ 
    status: "ok", 
    port: PORT, 
    database: dbStatus,
    dbStateCode: state,
    message: "MUSI-DEO API v3",
    note: "MongoDB connects asynchronously. If status is 'Connecting...', please refresh in a few seconds."
  });
});

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb+srv://asitraut2006_db_user:0CpGUoNn0hMnd8d3@cluster0.ehruu5p.mongodb.net/musideo?retryWrites=true&w=majority&appName=Cluster0";

// Mongoose Connection Event Listeners for real-time console feedback
mongoose.connection.on('connected', () => console.log("✅ Mongoose status: Connected to MongoDB"));
mongoose.connection.on('error', (err) => console.error("❌ Mongoose status: Connection error:", err.message));
mongoose.connection.on('disconnected', () => console.log("⚠️ Mongoose status: Disconnected from MongoDB"));

mongoose.connect(uri)
  .then(() => console.log("✅ Database Connected on 5001"))
  .catch(err => console.error("❌ Database Error during initial connect:", err.message));

app.listen(PORT, () => {
  console.log(`\n----------------------------------`);
  console.log(`🚀 NEW SERVER RUNNING ON PORT ${PORT}`);
  console.log(`----------------------------------\n`);
});
