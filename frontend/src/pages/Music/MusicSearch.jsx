import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Play, Pause, Clock, AlertCircle, RefreshCcw, Heart, Plus, X, ChevronRight, User } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylists } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FAMOUS_SINGERS } from '../../data/mediaData';
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

// ---- Playlist Picker Modal ----
const PlaylistPicker = ({ song, playlists, onAdd, onClose }) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onAdd('__new__', newName.trim());
      setNewName('');
      setCreating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg, #1a0d2e, #0f0820)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '360px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', margin: 0 }}>Add to Playlist</h3>
            <p style={{ color: '#a78bfa', fontSize: '12px', marginTop: '4px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }} className="no-scrollbar">
          {/* Liked Songs always first */}
          {playlists.map(pl => (
            <button key={pl.id} onClick={() => onAdd(pl.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: pl.id === 'fav' ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.04)',
              border: pl.id === 'fav' ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', color: '#fff',
              fontWeight: 600, fontSize: '14px', textAlign: 'left', transition: '0.2s',
              width: '100%'
            }}>
              {pl.id === 'fav'
                ? <Heart size={18} fill="#d946ef" color="#d946ef" />
                : <div style={{ width: '18px', height: '18px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', borderRadius: '4px' }} />
              }
              {pl.name}
              <ChevronRight size={14} color="#666" style={{ marginLeft: 'auto' }} />
            </button>
          ))}
        </div>

        {creating ? (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Playlist name..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}
            />
            <button onClick={handleCreate} style={{ background: 'linear-gradient(135deg,#8b5cf6,#d946ef)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add</button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} style={{
            display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px',
            background: 'none', border: '1px dashed rgba(139,92,246,0.4)', borderRadius: '12px',
            padding: '12px 16px', color: '#a78bfa', fontWeight: 600, fontSize: '14px',
            cursor: 'pointer', width: '100%', transition: '0.2s'
          }}>
            <Plus size={18} /> Create New Playlist
          </button>
        )}
      </div>
    </div>
  );
};

// ---- Artist Card at top of search results ----
const ArtistCard = ({ artist, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '20px',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(217,70,239,0.08))',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '20px', padding: '20px 24px', cursor: 'pointer',
    marginBottom: '28px', transition: 'all 0.25s',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; }}>
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <img src={artist.img.replace('500x500', '150x150')} alt={artist.name}
        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(139,92,246,0.4)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
        onError={e => e.target.src = '/media/sujal.jpg'} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'linear-gradient(135deg,#8b5cf6,#d946ef)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0b0717' }}>
        <User size={12} color="#fff" />
      </div>
    </div>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Artist</div>
      <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{artist.name}</div>
      <div style={{ fontSize: '13px', color: '#d946ef', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{artist.genre}</div>
    </div>
    <div style={{ marginLeft: 'auto', color: '#a78bfa', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
      View Profile <ChevronRight size={16} />
    </div>
  </div>
);

const MusicSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);
  const [error, setError] = useState(null);
  const [pickerSong, setPickerSong] = useState(null);
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { playlists, addToPlaylist, createPlaylist } = usePlaylists();
  const { user } = useAuth();
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const handleGlobalAction = (action) => {
    if (user?.isGuest) {
      alert("To enjoy all the global music and premium features, please Login first!");
      return;
    }
    action();
  };

  // Find matching artist from FAMOUS_SINGERS
  const matchedArtist = query.trim().length >= 2
    ? FAMOUS_SINGERS.find(s => s.name.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]))
    : null;

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

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const isLiked = (songId) => playlists.find(p => p.id === 'fav')?.songs.some(s => s.id === songId);

  const handleHeartClick = (e, song) => {
    e.stopPropagation();
    handleGlobalAction(() => {
      if (isLiked(song.id)) return; // already liked, don't toggle off here
      addToPlaylist('fav', song);
    });
  };

  const handlePlusClick = (e, song) => {
    e.stopPropagation();
    handleGlobalAction(() => setPickerSong(song));
  };

  const handlePickerAdd = async (playlistId, newPlaylistName) => {
    if (playlistId === '__new__') {
      const newId = await createPlaylist(newPlaylistName);
      // Small delay to let Firestore/state settle, then add song
      setTimeout(() => addToPlaylist(newId, pickerSong), 300);
    } else {
      await addToPlaylist(playlistId, pickerSong);
    }
    setPickerSong(null);
  };

  return (
    <div style={{ paddingBottom: '120px' }} className="animate-slide-right">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .search-row:hover { background: rgba(139,92,246,0.07) !important; }
        .heart-btn { opacity: 0; transition: 0.2s; }
        .search-row:hover .heart-btn { opacity: 1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Search Input */}
      <div style={{ position: 'sticky', top: 0, background: '#030108', zIndex: 20, paddingBottom: '16px', paddingTop: '8px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <SearchIcon size={20} color="#6b21a8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search for songs, artists, or podcasts"
            value={query}
            onChange={e => handleChange(e.target.value)}
            style={{ width: '100%', padding: '14px 20px 14px 48px', background: '#150f24', color: '#fff', fontWeight: 600, fontSize: '15px', borderRadius: '9999px', border: '1px solid rgba(139,92,246,0.3)', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
          />
        </div>
      </div>

      {searched ? (
        <div style={{ animation: 'fadeUp 0.35s ease' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b3b3b3', marginTop: '20px' }}>
              <RefreshCcw size={20} className="spin" /> Searching global library...
            </div>
          ) : error ? (
            <div style={{ background: '#0e081c', padding: '24px', borderRadius: '12px', border: '1px solid #ef4444', marginTop: '20px', maxWidth: '600px' }}>
              <h3 style={{ color: '#ef4444' }}>Connection Error</h3>
              <p style={{ color: '#aaa' }}>Check if backend is on Port 5001.</p>
              <button onClick={() => doSearch(query)} style={{ marginTop: '10px', padding: '8px 20px', background: '#8b5cf6', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Retry</button>
            </div>
          ) : (
            <div>
              {/* Artist Match Card */}
              {matchedArtist && (
                <ArtistCard
                  artist={matchedArtist}
                  onClick={() => handleGlobalAction(() => navigate(`/music/artist/${encodeURIComponent(matchedArtist.name)}`))}
                />
              )}

              {/* Songs Header */}
              {results.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', margin: 0 }}>Songs</h3>
                  <span style={{ color: '#666', fontSize: '13px' }}>{results.length} results</span>
                </div>
              )}

              {/* Song Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {results.length > 0 ? results.map((song, idx) => {
                  const active = currentSong?.id === song.id;
                  const liked = isLiked(song.id);
                  return (
                    <div
                      key={song.id}
                      className="search-row"
                      onClick={() => handleGlobalAction(() => playSong(song, results))}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', background: active ? 'rgba(139,92,246,0.15)' : 'transparent', border: active ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent', transition: 'all 0.2s' }}
                    >
                      <span style={{ width: '24px', color: '#a0a0a0', fontSize: '13px', textAlign: 'right', flexShrink: 0 }}>{idx + 1}</span>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={song.image} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} onError={e => e.target.src = '/media/sujal.jpg'} />
                        {active && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(139,92,246,0.5)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isPlaying ? <Pause size={14} fill="#fff" color="#fff" /> : <Play size={14} fill="#fff" color="#fff" />}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: active ? '#d946ef' : '#fff', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                        <div style={{ color: '#a78bfa', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</div>
                      </div>
                      {/* Like button */}
                      <button
                        className="heart-btn"
                        onClick={(e) => handleHeartClick(e, song)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: liked ? '#d946ef' : '#b3b3b3', flexShrink: 0 }}
                        title={liked ? 'Liked!' : 'Like'}
                      >
                        <Heart size={18} fill={liked ? '#d946ef' : 'none'} color={liked ? '#d946ef' : '#b3b3b3'} />
                      </button>
                      {/* Add to playlist button */}
                      <button
                        className="heart-btn"
                        onClick={(e) => handlePlusClick(e, song)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#b3b3b3', flexShrink: 0 }}
                        title="Add to Playlist"
                      >
                        <Plus size={18} />
                      </button>
                      <div style={{ color: '#a0a0a0', fontSize: '12px', flexShrink: 0 }}>
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  );
                }) : (
                  <p style={{ color: '#aaa', marginTop: '20px' }}>No songs found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Browse All</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {categories.map((cat, i) => (
              <div key={cat}
                onClick={() => handleGlobalAction(() => { setQuery(cat); doSearch(cat); })}
                style={{ background: categoryColors[i % categoryColors.length], borderRadius: '12px', padding: '16px', height: '100px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>{cat}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlist Picker Modal */}
      {pickerSong && (
        <PlaylistPicker
          song={pickerSong}
          playlists={playlists}
          onAdd={handlePickerAdd}
          onClose={() => setPickerSong(null)}
        />
      )}
    </div>
  );
};

export default MusicSearch;
