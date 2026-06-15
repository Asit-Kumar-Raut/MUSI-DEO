import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, Music, LogOut, Video as VideoIcon, Menu, X, MessageSquare } from 'lucide-react';
import VideoHome from './VideoHome';
import VideoWatch from './VideoWatch';
import VideoSearch from './VideoSearch';
import Contact from '../Contact';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';

const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const items = [
    { path: '/video', label: 'Home', Icon: Home },
    { path: '/video/trending', label: 'Trending', Icon: Compass },
    { path: '/video/contact', label: 'Contact & Feedback', Icon: MessageSquare },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f0f0f', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VideoIcon size={28} color="#ff0000" fill="#ff0000" />
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>MUSI-DEO</span>
        </div>
        {onClose && <X onClick={onClose} style={{ cursor: 'pointer', color: '#fff' }} />}
      </div>
      
      {items.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        return (
          <Link key={path} to={path} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '10px', fontSize: '15px', fontWeight: active ? 700 : 500, color: active ? '#fff' : '#aaa', background: active ? '#272727' : 'transparent', textDecoration: 'none', marginBottom: '4px' }}>
            <Icon size={24} color={active ? '#fff' : '#aaa'} /> {label}
          </Link>
        );
      })}

      <div style={{ marginTop: '24px', borderTop: '1px solid #272727', paddingTop: '24px' }}>
        <Link to="/music" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: 800, color: '#1db954', textDecoration: 'none', background: 'rgba(29,185,84,0.1)' }}>
          <Music size={22} /> Switch to Music
        </Link>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #272727', paddingTop: '16px' }}>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b3b3b3', fontWeight: 600, fontSize: '14px', cursor: 'pointer', background: 'none', border: 'none', padding: '12px' }}><LogOut size={20} /> Logout</button>
      </div>
    </div>
  );
};

const VideoLayout = () => {
  const { stopMusic } = usePlayer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => { stopMusic(); }, [stopMusic]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) { navigate(`/video/search?q=${encodeURIComponent(searchQ)}`); setIsMenuOpen(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', color: '#fff', overflow: 'hidden' }}>
      <style>{`
        @media(max-width:768px){
          .video-desktop-sidebar { display:none!important; } 
          .video-title-text { display:none!important; }
          .mobile-header { display: flex !important; }
          .desktop-header { display: none !important; }
        }
        .video-drawer { position: fixed; inset: 0; background: #000; z-index: 1000; transform: translateX(-100%); transition: 0.3s ease; }
        .video-drawer.open { transform: translateX(0); }
      `}</style>
      
      {/* Desktop Topbar */}
      <header className="desktop-header" style={{ height: '64px', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid #272727', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/video" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <VideoIcon size={30} color="#ff0000" fill="#ff0000" />
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>MUSI-DEO</span>
          </Link>
        </div>
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '600px', margin: '0 40px' }}>
          <div style={{ display: 'flex', background: '#121212', border: '1px solid #303030', borderRadius: '40px', padding: '2px 20px' }}>
            <input type="text" placeholder="Search videos..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 0', color: '#fff', outline: 'none' }} />
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Search size={20} color="#aaa" /></button>
          </div>
        </form>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/music" style={{ color: '#1db954', fontWeight: 800, textDecoration: 'none', fontSize: '14px' }}>Music Mode</Link>
        </div>
      </header>

      {/* Mobile Header with 3-Bar Menu */}
      <header className="mobile-header" style={{ display: 'none', height: '60px', background: '#000', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #272727', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Menu size={28} onClick={() => setIsMenuOpen(true)} style={{ cursor: 'pointer' }} />
          <VideoIcon size={28} color="#ff0000" fill="#ff0000" />
        </div>
        <form onSubmit={handleSearch} style={{ flex: 1, margin: '0 12px' }}>
          <input type="text" placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ width: '100%', background: '#181818', border: 'none', borderRadius: '20px', padding: '8px 16px', color: '#fff', fontSize: '13px' }} />
        </form>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`video-drawer ${isMenuOpen ? 'open' : ''}`}>
        <SidebarContent onClose={() => setIsMenuOpen(false)} />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="video-desktop-sidebar" style={{ width: '240px', flexShrink: 0 }}><SidebarContent /></div>
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#0f0f0f' }}>
          <Routes>
            <Route path="/" element={<VideoHome />} />
            <Route path="/watch/:id" element={<VideoWatch />} />
            <Route path="/search" element={<VideoSearch />} />
            <Route path="/trending" element={<VideoHome />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default VideoLayout;
