import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Download, Share2, Music as MusicIcon, RefreshCw, FileText } from 'lucide-react';
import { localLyrics, getFallbackLyrics } from '../../../data/lyricsData';
import { usePlayer } from '../../../context/PlayerContext';
import axios from 'axios';

const FullScreenPlayer = ({ isOpen, onClose, API }) => {
  const { 
    currentSong, 
    isPlaying, 
    progress, 
    currentTime, 
    duration, 
    isLooping, 
    isShuffled, 
    togglePlay, 
    playNext, 
    playPrev, 
    seekTo, 
    formatTime, 
    toggleLoop, 
    toggleShuffle 
  } = usePlayer();

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // Fetch lyrics when song changes or when lyrics tab is opened
  useEffect(() => {
    if (!currentSong) return;
    
    const fetchLyrics = async () => {
      setLoadingLyrics(true);
      setLyrics('');
      try {
        // 1. Check local curated lyrics first
        const localId = currentSong.id.toString().replace('saavn-', '').replace('itunes-', '');
        if (localLyrics[localId]) {
          setLyrics(localLyrics[localId]);
          setLoadingLyrics(false);
          return;
        }

        // 2. Fetch from backend API
        const res = await axios.get(`${API}/music/lyrics?songId=${currentSong.id}`);
        if (res.data && res.data.lyrics) {
          setLyrics(res.data.lyrics);
        } else {
          // 3. Fallback to dynamic lyric sheet if API returns null
          setLyrics(getFallbackLyrics(currentSong.title, currentSong.artist));
        }
      } catch (err) {
        console.error("Lyrics fetch failed:", err);
        setLyrics(getFallbackLyrics(currentSong.title, currentSong.artist));
      } finally {
        setLoadingLyrics(false);
      }
    };

    fetchLyrics();
  }, [currentSong, API]);

  if (!isOpen || !currentSong) return null;

  const handleSeekChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    seekTo((clickX / width) * 100);
  };

  const handleDownload = () => {
    if (!currentSong?.audio) return;
    
    // If it's a local/same-origin song, download directly, otherwise use the backend proxy
    const isExternal = currentSong.audio.startsWith('http://') || currentSong.audio.startsWith('https://');
    const downloadUrl = isExternal
      ? `${API}/music/download?url=${encodeURIComponent(currentSong.audio)}&name=${encodeURIComponent(currentSong.title)}`
      : currentSong.audio;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${currentSong.title}.mp3`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    const shareUrl = window.location.origin + `/music?play=${currentSong.id}`;
    if (navigator.share) {
      navigator.share({
        title: currentSong.title,
        text: `Listening to ${currentSong.title} on MUSI-DEO`,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Share link copied to clipboard!");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#090909',
      color: '#fff',
      zIndex: 5000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .blur-backdrop {
          position: absolute;
          inset: 0;
          background-image: url(${currentSong.image});
          background-size: cover;
          background-position: center;
          filter: blur(70px) brightness(0.25);
          transform: scale(1.1);
          z-index: 1;
        }
        .lyrics-container::-webkit-scrollbar {
          width: 6px;
        }
        .lyrics-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .lyrics-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 99px;
        }
        .artwork-img {
          width: 320px;
          height: 320px;
          border-radius: 16px;
          object-fit: cover;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .artwork-img:hover {
          transform: scale(1.03);
        }
        @media (max-width: 900px) {
          .desktop-split-view {
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 20px !important;
          }
          .artwork-wrapper {
            margin-top: 10px !important;
          }
          .artwork-img {
            width: 240px !important;
            height: 240px !important;
          }
          .lyrics-card {
            width: 90% !important;
            height: 260px !important;
          }
        }
      `}</style>

      {/* Blurred background image */}
      <div className="blur-backdrop" />

      {/* Main Glassmorphic Wrapper */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 32px',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(30px)',
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              padding: '10px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: '0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <ChevronDown size={28} />
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#b3b3b3', letterSpacing: '0.15em', textTransform: 'uppercase' }}>PLAYING FROM LIBRARY</span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{currentSong.artist}</div>
          </div>

          <button 
            onClick={() => setShowLyrics(!showLyrics)} 
            style={{
              background: showLyrics ? '#1db954' : 'rgba(255,255,255,0.08)',
              border: 'none',
              color: showLyrics ? '#000' : '#fff',
              padding: '10px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '13px',
              transition: '0.2s',
            }}
            onMouseEnter={e => { if(!showLyrics) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { if(!showLyrics) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <FileText size={18} /> {showLyrics ? "Show Player" : "Lyrics"}
          </button>
        </header>

        {/* Desktop Split View: Left side Album Art, Right side Control & lyrics */}
        <div className="desktop-split-view" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '64px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}>
          {/* Cover Art Wrapper */}
          <div className="artwork-wrapper" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: '0.4s ease',
          }}>
            <img src={currentSong.image} alt={currentSong.title} className="artwork-img" onError={e => e.target.src = '/media/sujal.jpg'} />
            
            {!showLyrics && (
              <div style={{ marginTop: '28px', textAlign: 'center', maxWidth: '340px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{currentSong.title}</h2>
                <p style={{ fontSize: '1rem', color: '#1db954', fontWeight: 600, marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0 0' }}>{currentSong.artist}</p>
              </div>
            )}
          </div>

          {/* Interactive view: either standard player controls + details OR a massive scrollable lyrics panel */}
          {showLyrics ? (
            <div className="lyrics-card" style={{
              width: '450px',
              height: '420px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1db954', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} /> Lyrics Sheet
              </h3>
              
              <div className="lyrics-container" style={{
                flex: 1,
                overflowY: 'auto',
                fontSize: '1.1rem',
                lineHeight: '1.8',
                color: '#e5e5e5',
                fontWeight: 600,
                textAlign: 'left',
              }}>
                {loadingLyrics ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#b3b3b3' }}>
                    <RefreshCw size={24} className="spin" /> Fetching beautiful lyrics...
                  </div>
                ) : lyrics ? (
                  <div dangerouslySetInnerHTML={{ __html: lyrics.replace(/\n/g, '<br />') }} />
                ) : (
                  <div style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>Lyrics not found for this track.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              width: '100%',
              maxWidth: '450px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Extra Song Info / Lyrics Preview */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '32px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#1db954', textTransform: 'uppercase', letterSpacing: '0.1em' }}>UP NEXT</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tap "Lyrics" to sing along with scrolling lyrics!</div>
              </div>

              {/* Progress Slider */}
              <div style={{ marginBottom: '24px' }}>
                <div 
                  onClick={handleSeekChange} 
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    position: 'relative',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: '#1db954',
                    borderRadius: '999px',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b3b3b3', fontSize: '12px', fontFamily: 'monospace' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
              }}>
                <button 
                  onClick={toggleShuffle} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isShuffled ? '#1db954' : '#b3b3b3',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                >
                  <Shuffle size={22} />
                </button>

                <button 
                  onClick={playPrev} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <SkipBack size={32} fill="#fff" />
                </button>

                <button 
                  onClick={togglePlay} 
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isPlaying ? <Pause size={32} fill="#000" /> : <Play size={32} fill="#000" style={{ marginLeft: '4px' }} />}
                </button>

                <button 
                  onClick={playNext} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <SkipForward size={32} fill="#fff" />
                </button>

                <button 
                  onClick={toggleLoop} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isLooping ? '#1db954' : '#b3b3b3',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                >
                  <Repeat size={22} />
                </button>
              </div>

              {/* Extra Utility Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
              }}>
                <button 
                  onClick={handleDownload} 
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <Download size={18} /> Download
                </button>

                <button 
                  onClick={handleShare} 
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;
