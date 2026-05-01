import React, { useEffect, useState } from 'react';
import { Play, TrendingUp, ChevronRight, Music as MusicIcon, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { allSongs } from '../../data/mediaData';

const API = 'http://localhost:5001/api';

const FAMOUS_SINGERS = [
  { name: 'Arijit Singh', img: '/media/arijit.jpg', genre: 'Romantic' },
  { name: 'Darshan Raval', img: '/media/darshna.jpg', genre: 'Pop' },
  { name: 'Jubin Nautiyal', img: '/media/jubin.jpg', genre: 'Melody' },
  { name: 'Honey Singh', img: '/media/honey.jpg', genre: 'Rap' },
  { name: 'Badshah', img: '/media/badsaha.jpg', genre: 'Hip Hop' },
  { name: 'Emiway Bantai', img: '/media/emiway.jpg', genre: 'Underground' },
  { name: 'Shreya Ghoshal', img: '/media/srivali.jpg', genre: 'Classical' },
  { name: 'Atif Aslam', img: '/media/sajna.jpg', genre: 'Sufi' },
  { name: 'Neha Kakkar', img: '/media/kinisoni.jpg', genre: 'Dance' },
  { name: 'KK', img: '/media/sach.jpg', genre: 'Soul' },
  { name: 'Sonu Nigam', img: '/media/arijit.jpg', genre: 'Legend' },
  { name: 'Kumar Sanu', img: '/media/sach.jpg', genre: '90s Hits' },
  { name: 'Humane Sagar', img: '/media/arijit.jpg', genre: 'Odia King' },
  { name: 'Mantu Chhuria', img: '/media/arijit.jpg', genre: 'Odia Folk' },
];

const formatSong = (s) => ({
  id: `saavn-${s.id}`,
  title: s.name,
  artist: s.primaryArtists || 'Various Artists',
  image: s.image?.[2]?.link || s.image?.[1]?.link || '/media/sujal.jpg',
  audio: s.downloadUrl?.[4]?.link || s.downloadUrl?.[3]?.link || s.downloadUrl?.[2]?.link || '',
  duration: parseInt(s.duration) || 0,
});

const MusicHome = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState('');
  const { playSong, currentSong } = usePlayer();
  const navigate = useNavigate();

  const fetchTrending = async () => {
    setLoading(true);
    setDebugMsg('');
    try {
      const res = await axios.get(`${API}/music/trending`);
      const results = res.data.data?.results || [];
      setTrending(results.map(formatSong).filter(s => s.audio));
    } catch (err) {
      console.error('Trending fetch error', err);
      setDebugMsg(err.message === 'Network Error' 
        ? "Frontend cannot reach Port 5000. Is the backend running?" 
        : `Backend returned error: ${err.response?.status || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await axios.get('http://localhost:5000/');
      alert(`Backend Status: ONLINE\nMessage: ${res.data.message || 'Ready'}`);
    } catch (err) {
      alert(`Backend Status: OFFLINE\nError: ${err.message}\n\nMake sure to run 'node server.js' in the backend folder!`);
    }
  };

  return (
    <div style={{ paddingBottom: '120px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .singer-card:hover img { transform: scale(1.1); }
        .song-row:hover { background: rgba(255,255,255,0.1) !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>Music Universe</h2>
          <p style={{ color: '#b3b3b3', fontSize: '14px', marginTop: '4px' }}>Millions of global hits at your fingertips.</p>
        </div>
        <button onClick={checkConnection} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#282828', color: '#fff', border: '1px solid #404040', padding: '10px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <Activity size={16} color="#1db954" /> Check Connection
        </button>
      </div>

      {/* Featured Artists */}
      <section style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Global Stars</h3>
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
          {FAMOUS_SINGERS.map((singer, i) => (
            <div key={i} onClick={() => navigate(`/music/search?q=${encodeURIComponent(singer.name)}`)}
              className="singer-card"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', minWidth: '140px', textAlign: 'center' }}>
              <div style={{ width: '130px', height: '130px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', border: '3px solid transparent', transition: '0.4s' }}>
                <img src={singer.img} alt={singer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' }} onError={e => e.target.src = '/media/sujal.jpg'} />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{singer.name}</div>
                <div style={{ color: '#1db954', fontSize: '12px', fontWeight: 600 }}>{singer.genre}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#1db954', padding: '8px', borderRadius: '50%' }}><TrendingUp size={20} color="#000" /></div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Trending Hits</h3>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b3b3b3', padding: '40px', background: '#181818', borderRadius: '16px' }}>
            <RefreshCw size={24} className="spin" /> <span>Connecting to Global Music Stream...</span>
          </div>
        ) : trending.length === 0 ? (
          <div style={{ background: '#181818', padding: '32px', borderRadius: '16px', border: '1px solid #333', textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>Connection Interrupted</h4>
            <p style={{ color: '#aaa', fontSize: '14px', marginTop: '8px', maxWidth: '400px', margin: '8px auto' }}>{debugMsg || "We couldn't fetch the latest global hits. This usually happens if the backend server is not running."}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={fetchTrending} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '24px', fontWeight: 700, cursor: 'pointer' }}>Try Again</button>
              <button onClick={checkConnection} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '24px', fontWeight: 700, cursor: 'pointer' }}>Troubleshoot</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {trending.slice(0, 15).map((song) => {
              const active = currentSong?.id === song.id;
              return (
                <div key={song.id} onClick={() => playSong(song, trending)}
                  className="song-row"
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', cursor: 'pointer', background: active ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.03)', transition: '0.3s', border: active ? '1px solid #1db954' : '1px solid transparent' }}>
                  <img src={song.image} alt="" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: active ? '#1db954' : '#fff', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                    <div style={{ color: '#b3b3b3', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</div>
                  </div>
                  <div style={{ color: '#b3b3b3', fontSize: '12px', fontFamily: 'monospace' }}>{Math.floor(song.duration/60)}:{(song.duration%60).toString().padStart(2,'0')}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Local Favorites */}
      <section>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>Your Local Gallery</h3>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
          {allSongs.map(song => {
            const active = currentSong?.id === song.id;
            return (
              <div key={song.id} onClick={() => playSong(song, allSongs)}
                style={{ minWidth: '180px', background: '#181818', padding: '20px', borderRadius: '16px', cursor: 'pointer', transition: '0.3s', border: '1px solid #282828' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#181818'; e.currentTarget.style.borderColor = '#282828'; }}>
                <img src={song.image} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} />
                <div style={{ color: active ? '#1db954' : '#fff', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                <div style={{ color: '#b3b3b3', fontSize: '12px', marginTop: '4px' }}>Local Quality</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default MusicHome;
