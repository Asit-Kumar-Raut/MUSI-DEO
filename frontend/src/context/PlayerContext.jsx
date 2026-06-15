import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import { allSongs } from '../data/mediaData';
import { useAuth } from './AuthContext';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('musideo_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem('musideo_volume', volume.toString());
    }
  }, [volume]);

  // Watch for logout and auto-stop music
  useEffect(() => {
    if (!user) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentSong(null);
      setPlaylist([]);
      localStorage.removeItem('musideo_last_song');
      localStorage.removeItem('musideo_last_playlist');
    }
  }, [user]);

  // Load last played song from localStorage on mount and parse shared links
  useEffect(() => {
    const savedSong = localStorage.getItem('musideo_last_song');
    const savedPlaylist = localStorage.getItem('musideo_last_playlist');
    let loadedSong = null;
    
    if (savedSong) {
      loadedSong = JSON.parse(savedSong);
      setCurrentSong(loadedSong);
      audioRef.current.src = loadedSong.audio;
    }
    if (savedPlaylist) setPlaylist(JSON.parse(savedPlaylist));

    // Handle shared song link
    const params = new URLSearchParams(window.location.search);
    const playId = params.get('play');
    if (playId) {
      if (loadedSong && loadedSong.id === playId) return;

      const localSong = allSongs.find(s => s.id === playId);
      if (localSong) {
        playSong(localSong);
      } else {
        const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:5001/api' 
          : 'https://musi-deo.vercel.app/api';
        
        fetch(`${API}/music/song/${playId}`)
          .then(res => res.json())
          .then(resData => {
            if (resData.status === 'SUCCESS' && resData.data) {
              const s = resData.data;
              const song = {
                id: s.id.toString().startsWith('saavn-') || s.id.toString().startsWith('itunes-') ? s.id.toString() : `saavn-${s.id}`,
                title: s.name,
                artist: s.primaryArtists || 'Various Artists',
                image: s.image?.[2]?.link || s.image?.[1]?.link || '/media/sujal.jpg',
                audio: s.downloadUrl?.[4]?.link || s.downloadUrl?.[3]?.link || s.downloadUrl?.[2]?.link || '',
                duration: parseInt(s.duration) || 0,
              };
              playSong(song);
            }
          })
          .catch(err => console.error("Error loading shared song:", err));
      }
    }
  }, []);
  
  const stateRef = useRef({ playlist: [], currentSong: null, isLooping: false });
  useEffect(() => {
    stateRef.current = { playlist, currentSong, isLooping };
  }, [playlist, currentSong, isLooping]);

  const playSong = (song, list) => {
    if (list) setPlaylist(list);
    else if (!playlist.find(s => s.id === song.id)) setPlaylist([song, ...playlist]);

    if (currentSong?.id === song.id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    audioRef.current.src = song.audio;
    audioRef.current.play().catch(() => {});
    setCurrentSong(song);
    setIsPlaying(true);

    // Persist
    localStorage.setItem('musideo_last_song', JSON.stringify(song));
    if (list) {
      setPlaylist(list);
      localStorage.setItem('musideo_last_playlist', JSON.stringify(list));
    }
  };

  const addToQueue = (song) => {
    setPlaylist(prev => {
      const newList = [...prev, song];
      localStorage.setItem('musideo_last_playlist', JSON.stringify(newList));
      return newList;
    });
  };

  const stopMusic = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => setIsLooping(!isLooping);
  const toggleShuffle = () => setIsShuffled(!isShuffled);

  const playNext = useCallback(() => {
    const { playlist: list, currentSong: current } = stateRef.current;
    if (!current || list.length === 0) return;
    
    let next;
    const idx = list.findIndex(s => s.id === current.id);
    if (idx >= 0 && idx < list.length - 1) {
      next = list[idx + 1];
    } else {
      next = list[0]; // Loop back to start
    }
    
    if (next) {
      audioRef.current.src = next.audio;
      audioRef.current.play().catch(() => {});
      setCurrentSong(next);
      setIsPlaying(true);
    }
  }, []);

  const playPrev = useCallback(() => {
    const { playlist: list, currentSong: current } = stateRef.current;
    if (!current || list.length === 0) return;
    
    const idx = list.findIndex(s => s.id === current.id);
    if (idx > 0) {
      const prev = list[idx - 1];
      audioRef.current.src = prev.audio;
      audioRef.current.play().catch(() => {});
      setCurrentSong(prev);
      setIsPlaying(true);
    }
  }, []);

  const seekTo = (pct) => {
    if (audioRef.current.duration) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };

    const onEnded = () => {
      if (stateRef.current.isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [playNext]);

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <PlayerContext.Provider value={{ currentSong, isPlaying, progress, currentTime, duration, playlist, isLooping, isShuffled, playSong, addToQueue, stopMusic, togglePlay, toggleLoop, toggleShuffle, playNext, playPrev, seekTo, formatTime, setPlaylist, volume, setVolume }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
