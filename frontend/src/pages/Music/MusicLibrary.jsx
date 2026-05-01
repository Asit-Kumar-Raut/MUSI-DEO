import React from 'react';
import { Heart, Music } from 'lucide-react';
import { allSongs } from '../../data/mediaData';
import { usePlayer } from '../../context/PlayerContext';

const MusicLibrary = () => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  return (
    <div style={{ paddingBottom: '140px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Heart size={24} color="#1db954" fill="#1db954" /> Your Library
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {allSongs.map((song, idx) => {
          const active = currentSong?.id === song.id;
          return (
            <div key={song.id} onClick={() => playSong(song, allSongs)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', background: active ? 'rgba(29,185,84,0.15)' : 'transparent', transition: '0.15s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#ffffff10'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(29,185,84,0.15)' : 'transparent'; }}>
              <span style={{ width: '20px', color: '#a0a0a0', fontSize: '13px', textAlign: 'right' }}>{idx + 1}</span>
              <img src={song.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: active ? '#1db954' : '#fff', fontWeight: 600, fontSize: '14px' }}>{song.title}</div>
                <div style={{ color: '#a0a0a0', fontSize: '12px' }}>{song.artist}</div>
              </div>
              <Music size={16} color={active ? '#1db954' : '#555'} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MusicLibrary;
