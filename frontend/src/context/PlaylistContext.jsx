import React, { createContext, useState, useContext, useEffect } from 'react';

const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('musideo_playlists');
    return saved ? JSON.parse(saved) : [
      { id: 'fav', name: 'My Favorites', songs: [] }
    ];
  });

  useEffect(() => {
    localStorage.setItem('musideo_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = (name) => {
    const newPlaylist = { id: Date.now().toString(), name, songs: [] };
    setPlaylists([...playlists, newPlaylist]);
  };

  const addToPlaylist = (playlistId, song) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        // Prevent duplicates
        if (pl.songs.find(s => s.id === song.id)) return pl;
        return { ...pl, songs: [...pl.songs, song] };
      }
      return pl;
    }));
  };

  const removeFromPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, songs: pl.songs.filter(s => s.id !== songId) };
      }
      return pl;
    }));
  };

  const deletePlaylist = (id) => {
    if (id === 'fav') return;
    setPlaylists(playlists.filter(p => p.id !== id));
  };

  return (
    <PlaylistContext.Provider value={{ playlists, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => useContext(PlaylistContext);
