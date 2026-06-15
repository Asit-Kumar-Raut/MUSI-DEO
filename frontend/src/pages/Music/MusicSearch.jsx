import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Pause, Clock, AlertCircle, RefreshCcw, Plus } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylists } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5001/api' 
  : 'https://musi-deo.vercel.app/api';
const categoryColors = ['#27856a', '#8400e7', '#1e3264', '#e8115b', '#148a08', '#bc5900', '#e91429', '#e1118c', '#503750', '#477d95', '#ba5d07', '#0d73ec'];
const categories = ['Hindi', 'Odia', 'Bengali', 'English', 'Punjabi', 'Tamil', 'Telugu', 'Bhojpuri', 'Romantic', 'Sad Songs', 'Party', 'Devotional'];

const formatSong = (s) => ({
  id: `saavn-${s.id}`,
  title: s.name,
  artist: s.primaryArtists || 'Various Artists',
  image: s.image?.[2]?.link || s.image?.[1]?.link || '/media/sujal.jpg',
  audio: s.downloadUrl?.[4]?.link || s.downloadUrl?.[3]?.link || s.downloadUrl?.[2]?.link || '',
  duration: parseInt(s.duration) || 0,
});

const MusicSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);
  const [error, setError] = useState(null);
  const { playSong, currentSong } = usePlayer();
  const { playlists, addToPlaylist } = usePlaylists();
  const { user } = useAuth();

  const handleGlobalAction = (action) => {
    if (user?.isGuest) {
      alert("To enjoy all the global music and premium features, please Login first! Guest account only supports Local Gallery.");
      return;
    }
    action();
  };

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true); setError(null);
    try {
      const res = await axios.get(`${API}/music/search?q=${encodeURIComponent(q)}&limit=40`);
      if (res.data.status === 'SUCCESS' || res.data.data) {
        const formatted = (res.data.data?.results || []).map(formatSong).filter(s => s.audio);
        setResults(formatted);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      setError("Backend server not responding correctly.");
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialQ) { setQuery(initialQ); doSearch(initialQ); }
  }, [initialQ]);

  const handleAdd = (e, song) => {
    e.stopPropagation();
    const plId = prompt("Choose Playlist ID (default: fav) or enter name from sidebar list:");
    // In a real app, this would be a dropdown menu. For now, we'll use a simple prompt or just add to favorites.
    addToPlaylist('fav', song);
    alert("Added to Liked Songs!");
  };

  return (
    <div style={{ paddingBottom: '120px' }} className="animate-slide-right">
      <div style={{ position: 'sticky', top: 0, background: '#030108', zIndex: 20, paddingBottom: '16px', paddingTop: '8px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <SearchIcon size={20} color="#6b21a8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search for songs, artists, or podcasts" value={query}
            onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
            style={{ width: '100%', padding: '14px 20px 14px 48px', background: '#150f24', color: '#fff', fontWeight: 600, fontSize: '15px', borderRadius: '9999px', border: '1px solid rgba(139,92,246,0.3)', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }} />
        </div>
      </div>

      {searched ? (
        <div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b3b3b3', marginTop: '20px' }}>
              <RefreshCcw size={20} className="spin" /> Searching global library...
            </div>
          ) : error ? (
            <div style={{ background: '#0e081c', padding: '24px', borderRadius: '12px', border: '1px solid #ef4444', marginTop: '20px', maxWidth: '600px' }}>
              <h3 style={{ color: '#ef4444' }}>Connection Error</h3>
              <p style={{ color: '#aaa' }}>Check if backend is on Port 5001.</p>
              <button onClick={() => doSearch(query)} style={{ marginTop: '10px' }}>Retry</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '20px' }}>
              {results.length > 0 ? results.map((song, idx) => {
                const active = currentSong?.id === song.id;
                return (
                  <div key={song.id} onClick={() => handleGlobalAction(() => playSong(song, results))}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', background: active ? 'rgba(139,92,246,0.15)' : 'transparent', border: active ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if(!active) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ width: '24px', color: '#a0a0a0', fontSize: '13px', textAlign: 'right' }}>{idx + 1}</span>
                    <img src={song.image} alt="" style={{ width: '44px', height: '44px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: active ? '#d946ef' : '#fff', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                      <div style={{ color: '#a78bfa', fontSize: '12px' }}>{song.artist}</div>
                    </div>
                    <button onClick={(e) => handleAdd(e, song)} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px' }} title="Add to Liked Songs"><Plus size={18} /></button>
                    <div style={{ color: '#a0a0a0', fontSize: '12px' }}>{Math.floor(song.duration/60)}:{(song.duration%60).toString().padStart(2,'0')}</div>
                  </div>
                );
              }) : <p style={{ color: '#aaa', marginTop: '20px' }}>No songs found.</p>}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Browse All</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {categories.map((cat, i) => (
              <div key={cat} onClick={() => handleGlobalAction(() => { setQuery(cat); doSearch(cat); })}
                style={{ background: categoryColors[i % categoryColors.length], borderRadius: '12px', padding: '16px', height: '100px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>{cat}</h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicSearch;
