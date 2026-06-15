import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylists } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const FAMOUS_SINGERS = [
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_002_20230323072147_500x500.jpg', genre: 'Romantic', desc: 'Arijit Singh is an Indian playback singer and music composer. He sings predominantly in Hindi and Bengali, and has been described as one of the most talented singers in India.' },
  { name: 'Darshan Raval', img: 'https://c.saavncdn.com/artists/Darshan_Raval_003_20231109085121_500x500.jpg', genre: 'Pop', desc: 'Darshan Raval is an Indian singer, songwriter, and composer known for his independent pop hits and soulful romantic melodies.' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_005_20230612140417_500x500.jpg', genre: 'Melody', desc: 'Jubin Nautiyal is an Indian playback singer and performer, celebrated for his soulful vocals and timeless Bollywood hits.' },
  { name: 'Yo Yo Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_002_20221216102650_500x500.jpg', genre: 'Rap', desc: 'Yo Yo Honey Singh is an Indian music producer, rapper, singer, songwriter, and actor, known for his high-energy party anthems.' },
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_005_20230913075253_500x500.jpg', genre: 'Hip Hop', desc: 'Badshah is an Indian rapper, singer, songwriter, and businessman, renowned for his chart-topping pop and rap blockbusters.' },
  { name: 'Emiway Bantai', img: 'https://c.saavncdn.com/artists/Emiway_Bantai_002_20221021102924_500x500.jpg', genre: 'Underground', desc: 'Emiway Bantai is an independent Indian rapper, singer, songwriter, and dancer, recognized for his explosive underground hip-hop style.' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_003_20230612140618_500x500.jpg', genre: 'Classical', desc: "Shreya Ghoshal is one of India's most decorated playback singers, known for her versatility, classical mastery, and sweet tone." },
  { name: 'Atif Aslam', img: 'https://c.saavncdn.com/artists/Atif_Aslam_004_20230612141019_500x500.jpg', genre: 'Sufi', desc: "Atif Aslam is a Pakistani playback singer, songwriter, and actor, famous for his vocal belting technique and intense romantic ballads." },
  { name: 'Neha Kakkar', img: 'https://c.saavncdn.com/artists/Neha_Kakkar_006_20230612140306_500x500.jpg', genre: 'Dance', desc: 'Neha Kakkar is a prominent Indian playback singer known for her powerful pop voice, energetic stage presence, and viral dance numbers.' },
  { name: 'KK', img: 'https://c.saavncdn.com/artists/K_K__002_20220601095204_500x500.jpg', genre: 'Soul', desc: "Krishnakumar Kunnath (KK) was a legendary Indian playback singer, revered for his emotive, powerful, and iconic rock-ballad voice." },
  { name: 'Sonu Nigam', img: 'https://c.saavncdn.com/artists/Sonu_Nigam_004_20230612140810_500x500.jpg', genre: 'Legend', desc: 'Sonu Nigam is a legendary Indian playback singer, composer, and actor, widely regarded as one of the most versatile voices in modern music.' },
  { name: 'Kumar Sanu', img: 'https://c.saavncdn.com/artists/Kumar_Sanu_004_20230612140938_500x500.jpg', genre: '90s Hits', desc: 'Kumar Sanu is a legendary Indian playback singer, famous for singing thousands of romantic Bollywood songs throughout the golden 1990s.' },
  { name: 'Humane Sagar', img: 'https://c.saavncdn.com/artists/Humane_Sagar_150x150.jpg', genre: 'Odia King', desc: 'Humane Sagar is a top Odia playback singer, famous for his romantic and sentimental hits in Ollywood cinema.' },
  { name: 'Mantu Chhuria', img: 'https://c.saavncdn.com/artists/Mantu_Chhuria_150x150.jpg', genre: 'Odia Folk', desc: 'Mantu Chhuria is a popular Odia folk and Sambalpuri singer, known for his high-spirited regional hits and dance tracks.' },
];

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5001/api' 
  : 'https://musi-deo.vercel.app/api';

const formatSong = (s) => ({
  id: s.id.toString().startsWith('saavn-') || s.id.toString().startsWith('itunes-') ? s.id.toString() : `saavn-${s.id}`,
  title: s.name,
  artist: s.primaryArtists || 'Various Artists',
  image: s.image?.[2]?.link || s.image?.[1]?.link || '/media/sujal.jpg',
  audio: s.downloadUrl?.[4]?.link || s.downloadUrl?.[3]?.link || s.downloadUrl?.[2]?.link || '',
  duration: parseInt(s.duration) || 0,
});

const ArtistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { playlists, addToPlaylist, removeFromPlaylist } = usePlaylists();
  const { user } = useAuth();
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Find artist details from configuration
  const artist = FAMOUS_SINGERS.find(s => s.name.toLowerCase() === decodeURIComponent(id).toLowerCase()) || {
    name: decodeURIComponent(id),
    img: 'https://c.saavncdn.com/artists/Arijit_Singh_002_20230323072147_500x500.jpg',
    genre: 'Vocalist',
    desc: 'Talented vocalist featured on MUSI-DEO.'
  };

  useEffect(() => {
    const fetchArtistSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/music/search?q=${encodeURIComponent(artist.name)}&limit=30`);
        if (res.data.status === 'SUCCESS' || res.data.data) {
          const results = res.data.data?.results || [];
          const formatted = results.map(formatSong).filter(s => s.audio);
          setSongs(formatted);
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (err) {
        console.error("Error fetching artist songs:", err);
        setError("Could not retrieve songs for this artist. Please check connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistSongs();
  }, [id, artist.name]);

  const handlePlayArtistAll = () => {
    if (songs.length > 0) {
      // Plays the first song and passes only the artist's songs as the active playlist queue
      playSong(songs[0], songs);
    }
  };

  const handlePlaySong = (song) => {
    // Play the clicked song and restrict queue only to this artist's songs
    playSong(song, songs);
  };

  const isLiked = (songId) => {
    return playlists.find(p => p.id === 'fav')?.songs.some(s => s.id === songId);
  };

  const handleLikeToggle = (e, song) => {
    e.stopPropagation();
    if (isLiked(song.id)) {
      removeFromPlaylist('fav', song.id);
    } else {
      addToPlaylist('fav', song);
    }
  };

  return (
    <div style={{ paddingBottom: '140px', color: '#fff', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .artist-header {
          position: relative;
          height: 380px;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 32px;
          display: flex;
          align-items: flex-end;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(139, 92, 246, 0.1);
        }
        .artist-banner-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.4) contrast(1.1);
          z-index: 1;
        }
        .artist-header-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(11, 7, 23, 0.95) 100%);
          z-index: 2;
        }
        .artist-info-card {
          position: relative;
          z-index: 3;
          max-width: 700px;
        }
        .artist-badge {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: #fff;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        .artist-name {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
          line-height: 1.1;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .artist-genre {
          font-size: 14px;
          color: #d946ef;
          font-weight: 700;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .artist-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .play-all-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: #fff;
          font-weight: 800;
          font-size: 15px;
          padding: 14px 28px;
          border-radius: 9999px;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
        }
        .play-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(139, 92, 246, 0.6);
        }
        .song-row-custom {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          border-radius: 14px;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.02);
          transition: 0.25s ease;
        }
        .song-row-custom:hover {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.2);
          transform: translateX(4px);
        }
        .song-row-custom.active {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
        }
        .play-circle-small {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        .song-row-custom:hover .play-circle-small {
          background: #8b5cf6;
          color: #fff;
          transform: scale(1.1);
        }
        @media (max-width: 768px) {
          .artist-header {
            height: 480px;
            padding: 24px;
          }
          .artist-name {
            font-size: 2.2rem;
          }
        }
      `}</style>

      {/* Artist Banner */}
      <div className="artist-header">
        <img src={artist.img} alt={artist.name} className="artist-banner-img" onError={e => e.target.src = '/media/sujal.jpg'} />
        <div className="artist-header-glow" />
        
        <div className="artist-info-card">
          <div className="artist-badge">
            <Sparkles size={12} /> Verified Artist
          </div>
          <h1 className="artist-name">{artist.name}</h1>
          <div className="artist-genre">{artist.genre} • Official Musician</div>
          <p className="artist-desc">{artist.desc}</p>
          
          {songs.length > 0 && (
            <button className="play-all-btn" onClick={handlePlayArtistAll}>
              <Play size={18} fill="#fff" /> Play Tracks
            </button>
          )}
        </div>
      </div>

      {/* Artist Tracks */}
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Popular Releases <span style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: 500 }}>({songs.length} tracks available)</span>
      </h3>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b3b3b3', padding: '60px 0' }}>
          <RefreshCw size={24} className="spin" /> <span>Loading official catalog...</span>
        </div>
      ) : error ? (
        <div style={{ background: '#1e0c25', border: '1px solid rgba(239,68,68,0.3)', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={32} color="#ef4444" />
          <div>
            <h4 style={{ fontWeight: 700 }}>Connection Error</h4>
            <p style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{error}</p>
          </div>
        </div>
      ) : songs.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <AlertCircle size={40} color="#b3b3b3" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#b3b3b3' }}>No tracks found in the stream for this artist.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {songs.map((song, idx) => {
            const active = currentSong?.id === song.id;
            const liked = isLiked(song.id);
            return (
              <div key={song.id} className={`song-row-custom ${active ? 'active' : ''}`} onClick={() => handlePlaySong(song)}>
                <span style={{ width: '24px', color: '#b3b3b3', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>{idx + 1}</span>
                
                <div className="play-circle-small">
                  {active && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '1px' }} />}
                </div>

                <img src={song.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: active ? '#d946ef' : '#fff', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                  <div style={{ color: '#b3b3b3', fontSize: '12px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={(e) => handleLikeToggle(e, song)} title={liked ? "Remove from Liked Songs" : "Add to Liked Songs"} style={{ background: 'none', border: 'none', color: liked ? '#d946ef' : '#b3b3b3', cursor: 'pointer', padding: '8px' }}>
                    <Heart size={18} fill={liked ? '#d946ef' : 'none'} color={liked ? '#d946ef' : '#b3b3b3'} />
                  </button>
                  <span style={{ color: '#b3b3b3', fontSize: '13px', fontFamily: 'monospace', width: '38px', textAlign: 'right' }}>{Math.floor(song.duration/60)}:{(song.duration%60).toString().padStart(2,'0')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArtistPage;
