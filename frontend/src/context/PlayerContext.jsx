import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const audioRef = useRef(new Audio());

  // Load last played song from localStorage on mount
  useEffect(() => {
    const savedSong = localStorage.getItem('musideo_last_song');
    const savedPlaylist = localStorage.getItem('musideo_last_playlist');
    if (savedSong) setCurrentSong(JSON.parse(savedSong));
    if (savedPlaylist) setPlaylist(JSON.parse(savedPlaylist));
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
    <PlayerContext.Provider value={{ currentSong, isPlaying, progress, currentTime, duration, playlist, isLooping, isShuffled, playSong, addToQueue, stopMusic, togglePlay, toggleLoop, toggleShuffle, playNext, playPrev, seekTo, formatTime, setPlaylist }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
