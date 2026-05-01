import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylists } from '../../context/PlaylistContext';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Trash2, Music, Clock, MoreHorizontal } from 'lucide-react';

const PlaylistPage = () => {
  const { id } = useParams();
  const { playlists, removeFromPlaylist, deletePlaylist } = usePlaylists();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const navigate = useNavigate();

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Playlist not found</div>;
  }

  const handleDelete = () => {
    if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      navigate('/music');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .song-row:hover { background: rgba(255,255,255,0.05); }`}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '192px', height: '192px', background: 'linear-gradient(135deg, #282828, #121212)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
          <Music size={80} color="#535353" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>PLAYLIST</p>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.04em' }}>{playlist.name}</h1>
          <p style={{ color: '#b3b3b3', fontSize: '14px', fontWeight: 600 }}>{playlist.songs.length} songs • Created by you</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '32px' }}>
        {playlist.songs.length > 0 && (
          <button onClick={() => playSong(playlist.songs[0], playlist.songs)} style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1db954', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s transform' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <Play size={24} fill="#000" color="#000" />
          </button>
        )}
        {id !== 'fav' && (
          <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }} title="Delete Playlist">
            <Trash2 size={28} />
          </button>
        )}
      </div>

      {/* Song List */}
      <div style={{ borderTop: '1px solid #282828', paddingTop: '16px' }}>
        <div style={{ display: 'flex', padding: '0 12px 10px', borderBottom: '1px solid #282828', color: '#b3b3b3', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em' }}>
          <div style={{ width: '40px' }}>#</div>
          <div style={{ flex: 1 }}>TITLE</div>
          <div style={{ width: '150px' }}>ALBUM / ARTIST</div>
          <div style={{ width: '50px' }}><Clock size={16} /></div>
          <div style={{ width: '40px' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
          {playlist.songs.length > 0 ? playlist.songs.map((song, idx) => {
            const active = currentSong?.id === song.id;
            return (
              <div key={song.id} className="song-row" style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', transition: '0.1s' }}
                onClick={() => playSong(song, playlist.songs)}>
                <div style={{ width: '40px', color: active ? '#1db954' : '#b3b3b3', fontSize: '14px' }}>{idx + 1}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={song.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ color: active ? '#1db954' : '#fff', fontSize: '14px', fontWeight: 600 }}>{song.title}</div>
                    <div style={{ color: '#b3b3b3', fontSize: '12px' }}>{song.artist}</div>
                  </div>
                </div>
                <div style={{ width: '150px', color: '#b3b3b3', fontSize: '13px' }}>{song.artist}</div>
                <div style={{ width: '50px', color: '#b3b3b3', fontSize: '13px' }}>{Math.floor(song.duration/60)}:{(song.duration%60).toString().padStart(2,'0')}</div>
                <div style={{ width: '40px' }}>
                  <button onClick={(e) => { e.stopPropagation(); removeFromPlaylist(playlist.id, song.id); }} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }} title="Remove from playlist">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#b3b3b3' }}>
              No songs in this playlist yet. Go to Search to add some!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
