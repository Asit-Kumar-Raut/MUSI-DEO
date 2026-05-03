import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Download, Share2 } from 'lucide-react';
import { usePlayer } from '../../../context/PlayerContext';

const MusicPlayer = () => {
  const { currentSong, isPlaying, progress, currentTime, duration, isLooping, isShuffled, togglePlay, playNext, playPrev, seekTo, formatTime, toggleLoop, toggleShuffle } = usePlayer();

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
    <div style={{ height: '80px', background: '#181818', borderTop: '1px solid #282828', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 200 }}>
      <style>{`@media(max-width:768px){.player-extras{display:none!important;} .player-track{min-width:100px!important;width:auto!important;} .player-controls{max-width:100%!important;}}`}</style>
      
      {/* Track Info */}
      <div className="player-track" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '30%', minWidth: '180px' }}>
        {currentSong ? (
          <>
            <img src={currentSong.image} alt="" style={{ width: '52px', height: '52px', borderRadius: '4px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} onError={e => e.target.src = '/media/sujal.jpg'} />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{currentSong.title}</div>
              <div style={{ color: '#b3b3b3', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{currentSong.artist}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
              <button onClick={handleDownload} title="Download" style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}><Download size={16} /></button>
              <button onClick={handleShare} title="Share" style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '4px' }}><Share2 size={16} /></button>
            </div>
          </>
        ) : <div style={{ color: '#666', fontSize: '13px' }}>No song playing</div>}
      </div>

      {/* Controls */}
      <div className="player-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '45%', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '6px' }}>
          <button onClick={toggleShuffle} style={{ color: isShuffled ? '#1db954' : '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: '0.2s' }}><Shuffle size={16} /></button>
          <button onClick={playPrev} style={{ color: '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><SkipBack size={18} fill="#b3b3b3" /></button>
          <button onClick={togglePlay} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
            {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" style={{ marginLeft: '2px' }} />}
          </button>
          <button onClick={playNext} style={{ color: '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><SkipForward size={18} fill="#b3b3b3" /></button>
          <button onClick={toggleLoop} style={{ color: isLooping ? '#1db954' : '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: '0.2s' }}><Repeat size={16} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '500px' }}>
          <span style={{ fontSize: '11px', color: '#b3b3b3', fontFamily: 'monospace', width: '36px', textAlign: 'right' }}>{formatTime(currentTime)}</span>
          <div onClick={handleSeek} style={{ flex: 1, height: '4px', background: '#535353', borderRadius: '9999px', cursor: 'pointer', position: 'relative' }}>
            <div style={{ height: '100%', background: '#1db954', borderRadius: '9999px', width: `${progress}%`, position: 'absolute', top: 0, left: 0 }}>
              <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#b3b3b3', fontFamily: 'monospace', width: '36px' }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="player-extras" style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
        <Volume2 size={16} color="#b3b3b3" />
        <div style={{ width: '90px', height: '4px', background: '#535353', borderRadius: '9999px' }}>
          <div style={{ width: '70%', height: '100%', background: '#fff', borderRadius: '9999px' }} />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
