import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Send, X, Bot, MessageSquare, Volume2, Sparkles, Wand2 } from 'lucide-react';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';

const API = 'https://musi-deo.vercel.app/api';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: typeof window !== 'undefined' ? window.innerHeight - 150 : 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { playSong } = usePlayer();
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const formatSong = (s) => ({
    id: `saavn-${s.id}`,
    title: s.name,
    artist: s.primaryArtists || 'Various Artists',
    image: s.image?.[2]?.link || s.image?.[1]?.link || '/media/sujal.jpg',
    audio: s.downloadUrl?.[4]?.link || s.downloadUrl?.[3]?.link || s.downloadUrl?.[2]?.link || '',
    duration: parseInt(s.duration) || 0,
  });

  const speak = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const addMessageAndSpeak = (text, sender) => {
    setMessages(prev => [...prev, { text, sender, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    if (sender === 'ai') speak(text);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addMessageAndSpeak("Hello! I am Asig. Type any song or video name and I will find it!", 'ai');
      }, 600);
    }
  }, [isOpen]);

  const processAI = async (text) => {
    if (!text) return;
    const lower = text.toLowerCase();
    const currentPath = location.pathname;
    
    // Explicit keywords
    const playMatch = lower.match(/(?:play|bajao|baja|gaana|suno|listen)\s+(.+)/);
    const videoMatch = lower.match(/(?:show|dikhao|video|watch|dekho|dekhna)\s+(.+)/);

    // INTELLIGENT SEARCH: If no keyword, decide based on current page
    let query = text;
    let mode = "music"; // Default

    if (playMatch) {
      query = playMatch[1];
      mode = "music";
    } else if (videoMatch) {
      query = videoMatch[1];
      mode = "video";
    } else {
      // Auto-detect based on page
      if (currentPath.includes('/video')) {
        mode = "video";
      } else {
        mode = "music";
      }
    }

    if (mode === "music") {
      addMessageAndSpeak(`Asig is searching and playing: "${query}"`, 'ai');
      try {
        const res = await axios.get(`${API}/music/search?q=${encodeURIComponent(query)}`);
        const data = res.data.data?.results || res.data.results || [];
        if (data.length > 0) {
          const track = formatSong(data[0]);
          playSong(track, data.map(formatSong).filter(s => s.audio));
          addMessageAndSpeak(`Playing ${track.title}. Enjoy!`, 'ai');
          navigate('/music');
        } else {
          addMessageAndSpeak(`Not in direct library. Checking search results for "${query}".`, 'ai');
          navigate(`/music/search?q=${encodeURIComponent(query)}`);
        }
      } catch {
        navigate(`/music/search?q=${encodeURIComponent(query)}`);
      }
    } else {
      addMessageAndSpeak(`Asig is finding the video for "${query}".`, 'ai');
      navigate(`/video/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    addMessageAndSpeak(text, 'user');
    processAI(text);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      addMessageAndSpeak(t, 'user');
      processAI(t);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleMouseDown = useCallback((e) => { setIsDragging(true); setHasMoved(false); setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y }); }, [position]);
  const handleMouseMove = useCallback((e) => { if (!isDragging) return; setHasMoved(true); setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }); }, [isDragging, dragOffset]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ position: 'fixed', left: position.x, top: position.y, zIndex: 3000, userSelect: 'none' }}>
      <style>{`
        @keyframes asig-glow { 0% { border-color: #1db954; box-shadow: 0 0 10px rgba(29,185,84,0.3); } 50% { border-color: #19e68c; box-shadow: 0 0 25px rgba(29,185,84,0.6); } 100% { border-color: #1db954; box-shadow: 0 0 10px rgba(29,185,84,0.3); } }
        .asig-avatar { width: 75px; height: 75px; border-radius: 50%; border: 3px solid #1db954; cursor: grab; object-fit: cover; box-shadow: 0 10px 40px rgba(0,0,0,0.6); transition: 0.3s; background: #000; }
        .asig-speaking { animation: asig-glow 0.8s infinite; border-width: 4px; }
        .asig-listening { animation: asig-glow 1.5s infinite; border-color: #ff4444 !important; }
      `}</style>

      <div style={{ position: 'relative' }}>
        <img src="/media/ai_poto.png" alt="Asig" onMouseDown={handleMouseDown} onClick={() => !hasMoved && setIsOpen(!isOpen)}
          className={`asig-avatar ${isSpeaking ? 'asig-speaking' : ''} ${isListening ? 'asig-listening' : ''}`}
          onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png'} />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', bottom: '95px', left: 0, width: '330px', height: '500px', background: '#0a0a0a', borderRadius: '24px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.9)' }}>
          <div style={{ padding: '18px', background: 'linear-gradient(135deg, #1db954, #19e68c)', color: '#000', fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ASIG VOICE AI</span>
            <X size={22} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
          </div>
          <div style={{ flex: 1, padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }} className="no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? '#1db954' : '#222', color: m.sender === 'user' ? '#000' : '#fff', padding: '12px 16px', borderRadius: '18px', fontSize: '14px', maxWidth: '85%', fontWeight: 500 }}>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '16px', background: '#121212', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={startListening} style={{ width: '45px', height: '45px', borderRadius: '50%', background: isListening ? '#ff4444' : '#282828', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Volume2 size={24} color={isListening ? '#fff' : '#1db954'} />
            </button>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask Asig anything..." style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: '25px', padding: '12px 45px 12px 20px', color: '#fff', outline: 'none', fontSize: '14px' }} />
              <button onClick={handleSend} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#1db954', cursor: 'pointer' }}><Send size={20} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
