import React, { createContext, useState, useContext, useEffect } from 'react';
import { db, auth } from '../firebase';
import { useAuth } from './AuthContext';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const firebaseUser = auth.currentUser;
    
    if (user && !user.isGuest && firebaseUser) {
      const userKey = (user.email || user.id || 'unknown').toLowerCase();
      const playlistsRef = collection(db, 'users', userKey, 'playlists');
      
      const unsubscribe = onSnapshot(playlistsRef, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        if (!list.find(p => p.id === 'fav')) {
          const favRef = doc(db, 'users', userKey, 'playlists', 'fav');
          setDoc(favRef, { name: 'My Favorites', songs: [] });
          list.push({ id: 'fav', name: 'My Favorites', songs: [] });
        }
        
        setPlaylists(list);
      }, (err) => {
        console.error("Firestore playlist sync error:", err);
      });

      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('musideo_playlists');
      const localList = saved ? JSON.parse(saved) : [
        { id: 'fav', name: 'My Favorites', songs: [] }
      ];
      setPlaylists(localList);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.isGuest) {
      localStorage.setItem('musideo_playlists', JSON.stringify(playlists));
    }
  }, [playlists, user]);

  const createPlaylist = async (name) => {
    const id = Date.now().toString();
    const newPlaylist = { name, songs: [] };
    const firebaseUser = auth.currentUser;
    
    if (user && !user.isGuest && firebaseUser) {
      const userKey = (user.email || user.id || 'unknown').toLowerCase();
      const docRef = doc(db, 'users', userKey, 'playlists', id);
      await setDoc(docRef, newPlaylist);
    } else {
      setPlaylists(prev => [...prev, { id, ...newPlaylist }]);
    }
  };

  const addToPlaylist = async (playlistId, song) => {
    const target = playlists.find(p => p.id === playlistId);
    if (!target) return;
    
    if (target.songs.find(s => s.id === song.id)) return;
    
    const updatedSongs = [...target.songs, song];
    const firebaseUser = auth.currentUser;
    
    if (user && !user.isGuest && firebaseUser) {
      const userKey = (user.email || user.id || 'unknown').toLowerCase();
      const docRef = doc(db, 'users', userKey, 'playlists', playlistId);
      await setDoc(docRef, { name: target.name, songs: updatedSongs });
    } else {
      setPlaylists(prev => prev.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, songs: updatedSongs };
        }
        return pl;
      }));
    }
  };

  const removeFromPlaylist = async (playlistId, songId) => {
    const target = playlists.find(p => p.id === playlistId);
    if (!target) return;
    
    const updatedSongs = target.songs.filter(s => s.id !== songId);
    const firebaseUser = auth.currentUser;
    
    if (user && !user.isGuest && firebaseUser) {
      const userKey = (user.email || user.id || 'unknown').toLowerCase();
      const docRef = doc(db, 'users', userKey, 'playlists', playlistId);
      await setDoc(docRef, { name: target.name, songs: updatedSongs });
    } else {
      setPlaylists(prev => prev.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, songs: updatedSongs };
        }
        return pl;
      }));
    }
  };

  const deletePlaylist = async (id) => {
    if (id === 'fav') return;
    const firebaseUser = auth.currentUser;
    
    if (user && !user.isGuest && firebaseUser) {
      const userKey = (user.email || user.id || 'unknown').toLowerCase();
      const docRef = doc(db, 'users', userKey, 'playlists', id);
      await deleteDoc(docRef);
    } else {
      setPlaylists(playlists.filter(p => p.id !== id));
    }
  };

  return (
    <PlaylistContext.Provider value={{ playlists, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => useContext(PlaylistContext);

