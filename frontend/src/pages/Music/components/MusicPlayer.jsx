import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Download, Share2, Maximize2, Heart } from 'lucide-react';
import { usePlayer } from '../../../context/PlayerContext';
import { usePlaylists } from '../../../context/PlaylistContext';
import FullScreenPlayer from './FullScreenPlayer';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5001/api' 
  : 'https://musi-deo.vercel.app/api';

const MusicPlayer = () => {
  const { currentSong, isPlaying, progress, currentTime, duration, isLooping, isShuffled, togglePlay, playNext, playPrev, seekTo, formatTime, toggleLoop, toggleShuffle, volume, setVolume } = usePlayer();
  const { playlists, addToPlaylist, removeFromPlaylist } = usePlaylists();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isLiked = playlists.find(p => p.id === 'fav')?.songs.some(s => s.id === currentSong?.id);
  
  const handleLikeToggle = (e) => {
    e.stopPropagation();
    if (!currentSong) return;
    if (isLiked) {
      removeFromPlaylist('fav', currentSong.id);
    } else {
      addToPlaylist('fav', currentSong);
    }
  };

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * 100);
  };

  const handleDownload = () => {
    if (!currentSong?.audio) return;
    const link = document.createElement('a');
    link.href = currentSong.audio;
    link.download = `${currentSong.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (!currentSong) return;
    const shareUrl = window.location.origin + `/music?play=${currentSong.id}`;
    if (navigator.share) {
      navigator.share({
        title: currentSong.title,
        text: `Check out this song: ${currentSong.title} by ${currentSong.artist} on MUSI-DEO`,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Share link copied to clipboard!");
    }
  };

  return (
    <>
      <div className="player-container">
        <style>{`
          .player-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 80px;
            background: #0e081c;
            border-top: 1px solid rgba(139, 92, 246, 0.15);
            padding: 0 16px;
            flex-shrink: 0;
            z-index: 200;
            position: relative;
            transition: all 0.3s ease;
          }
          
          .player-mobile-controls {
            display: none;
          }

          .volume-slider {
            -webkit-appearance: none;
            appearance: none;
          }
          .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 4px rgba(0,0,0,0.6);
            cursor: pointer;
            transition: transform 0.1s;
          }
          .volume-slider::-webkit-slider-thumb:hover {
            transform: scale(1.3);
          }
          .volume-slider::-moz-range-thumb {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #fff;
            border: none;
            box-shadow: 0 0 4px rgba(0,0,0,0.6);
            cursor: pointer;
            transition: transform 0.1s;
          }
          .volume-slider::-moz-range-thumb:hover {
            transform: scale(1.3);
          }
          
          @media(max-width:768px){
            .player-container {
              height: 155px !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              padding: 12px 16px !important;
              gap: 8px !important;
            }
            
            .player-track {
              width: 100% !important;
              min-width: 0 !important;
              justify-content: space-between !important;
            }
            
            .desktop-only-icons {
              display: flex !important;
              gap: 12px !important;
            }
            
            .player-desktop-controls {
              display: flex !important;
              max-width: 100% !important;
              width: 100% !important;
            }
            
            .player-extras {
              display: flex !important;
              width: 100% !important;
              justify-content: center !important;
              gap: 12px !important;
              margin-top: 2px;
            }
          }
        `}</style>
        
        {/* Track Info (Left) */}
        <div className="player-track" 
          onClick={() => currentSong && setIsFullScreen(true)}
          title={currentSong ? "Click to open Full Screen" : ""}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '30%', minWidth: '180px', cursor: currentSong ? 'pointer' : 'default', minWidth: 0 }}>
          {currentSong ? (
            <>
              <img src={currentSong.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '1px solid rgba(139, 92, 246, 0.2)' }} onError={e => e.target.src = '/media/sujal.jpg'} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</div>
                <div style={{ color: '#a78bfa', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{currentSong.artist}</div>
              </div>
              
              {/* Desktop & Mobile Utility Icons */}
              <div className="desktop-only-icons" style={{ display: 'flex', gap: '8px', marginLeft: '10px' }} onClick={e => e.stopPropagation()}>
                <button onClick={handleLikeToggle} title={isLiked ? "Remove from Liked Songs" : "Add to Liked Songs"} style={{ background: 'none', border: 'none', color: isLiked ? '#d946ef' : '#b3b3b3', cursor: 'pointer', padding: '4px', transition: '0.2s' }}>
                  <Heart size={16} fill={isLiked ? '#d946ef' : 'none'} color={isLiked ? '#d946ef' : '#b3b3b3'} />
                </button>
                <button onClick={handleDownload} title="Download" style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}><Download size={16} /></button>
                <button onClick={handleShare} title="Share" style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}><Share2 size={16} /></button>
                <button onClick={() => setIsFullScreen(true)} title="Full Screen" style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}><Maximize2 size={16} /></button>
              </div>
            </>
          ) : <div style={{ color: '#666', fontSize: '13px' }}>No song playing</div>}
        </div>

        {/* Play Controls & Seek bar (Middle / Bottom) */}
        <div className="player-desktop-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '45%', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '6px' }}>
            <button onClick={toggleShuffle} style={{ color: isShuffled ? '#8b5cf6' : '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: '0.2s' }}><Shuffle size={16} /></button>
            <button onClick={playPrev} style={{ color: '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><SkipBack size={18} fill="#b3b3b3" /></button>
            <button onClick={togglePlay} style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', transition: 'transform 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
              {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" style={{ marginLeft: '2px' }} />}
            </button>
            <button onClick={playNext} style={{ color: '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><SkipForward size={18} fill="#b3b3b3" /></button>
            <button onClick={toggleLoop} style={{ color: isLooping ? '#8b5cf6' : '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: '0.2s' }}><Repeat size={16} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '500px' }}>
            <span style={{ fontSize: '11px', color: '#b3b3b3', fontFamily: 'monospace', width: '36px', textAlign: 'right' }}>{formatTime(currentTime)}</span>
            <div onClick={handleSeek} style={{ flex: 1, height: '4px', background: '#535353', borderRadius: '9999px', cursor: 'pointer', position: 'relative' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', borderRadius: '9999px', width: `${progress}%`, position: 'absolute', top: 0, left: 0 }}>
                <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#b3b3b3', fontFamily: 'monospace', width: '36px' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Extras (Right / Bottom) */}
        <div className="player-extras" style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
          <Volume2 
            size={16} 
            color={volume === 0 ? "#d946ef" : "#b3b3b3"} 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)} 
          />
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: '90px',
              height: '4px',
              WebkitAppearance: 'none',
              background: `linear-gradient(to right, #8b5cf6 0%, #d946ef ${volume * 100}%, #535353 ${volume * 100}%, #535353 100%)`,
              borderRadius: '9999px',
              outline: 'none',
              cursor: 'pointer'
            }}
            className="volume-slider"
          />
        </div>
      </div>

      <FullScreenPlayer 
        isOpen={isFullScreen} 
        onClose={() => setIsFullScreen(false)} 
        API={API} 
      />
    </>
  );
};

export default MusicPlayer;
