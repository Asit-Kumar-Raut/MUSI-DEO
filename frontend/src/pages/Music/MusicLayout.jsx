import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, PlusCircle, Heart, LogOut, Video, Menu, X, Music as MusicIcon } from 'lucide-react';
import MusicPlayer from './components/MusicPlayer';
import MusicHome from './MusicHome';
import MusicSearch from './MusicSearch';
import MusicLibrary from './MusicLibrary';
import ArtistPage from './ArtistPage';
import PlaylistPage from './PlaylistPage';
import { useAuth } from '../../context/AuthContext';
import { usePlaylists } from '../../context/PlaylistContext';

const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { playlists, createPlaylist } = usePlaylists();

  const handleCreate = () => {
    const name = prompt("Enter playlist name:");
    if (name) createPlaylist(name);
  };

  const navItems = [
    { path: '/music', label: 'Home', Icon: Home },
    { path: '/music/search', label: 'Search', Icon: Search },
    { path: '/music/library', label: 'Your Library', Icon: Library },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px' }}>
      <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1db954', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>MUSI-DEO</span>
        {onClose && <X onClick={onClose} style={{ cursor: 'pointer', color: '#fff' }} />}
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, color: active ? '#fff' : '#b3b3b3', textDecoration: 'none', background: active ? '#282828' : 'transparent' }}>
              <Icon size={24} color={active ? '#fff' : '#b3b3b3'} /> {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: '32px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#b3b3b3', letterSpacing: '0.1em', marginBottom: '16px', paddingLeft: '12px' }}>PLAYLISTS</p>
        <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', padding: '10px 12px', width: '100%', textAlign: 'left' }}>
          <div style={{ background: '#fff', borderRadius: '2px', padding: '4px' }}><PlusCircle size={16} color="#000" /></div> Create Playlist
        </button>
        <Link to="/music/playlist/fav" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none', padding: '10px 12px' }}>
          <div style={{ background: 'linear-gradient(135deg,#450af5,#c4efd9)', borderRadius: '2px', padding: '4px' }}><Heart size={16} color="#fff" fill="#fff" /></div> Liked Songs
        </Link>
      </div>

      <div style={{ marginTop: '12px', borderTop: '1px solid #282828', paddingTop: '12px', overflowY: 'auto' }} className="no-scrollbar">
        {playlists.filter(p => p.id !== 'fav').map(pl => (
          <Link key={pl.id} to={`/music/playlist/${pl.id}`} onClick={onClose} style={{ display: 'block', padding: '8px 12px', color: location.pathname === `/music/playlist/${pl.id}` ? '#fff' : '#b3b3b3', textDecoration: 'none', fontSize: '14px' }}>
            {pl.name}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <Link to="/video" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4444', fontWeight: 800, textDecoration: 'none', marginBottom: '16px', padding: '12px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}><Video size={20} /> Switch to Video</Link>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b3b3b3', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: '12px' }}><LogOut size={20} /> Logout</button>
      </div>
    </div>
  );
};

const MusicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mobile-drawer { position: fixed; inset: 0; background: #000; z-index: 1000; transform: translateX(-100%); transition: 0.3s ease; }
        .mobile-drawer.open { transform: translateX(0); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#121212', color: '#fff', overflow: 'hidden' }}>
        
        {/* Mobile Header with 3-Bar Menu */}
        <header className="mobile-header" style={{ display: 'none', height: '64px', background: '#000', borderBottom: '1px solid #282828', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Menu onClick={() => setIsMenuOpen(true)} style={{ cursor: 'pointer' }} size={28} />
            <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#1db954', letterSpacing: '0.05em' }}>MUSI-DEO</span>
          </div>
          <Link to="/music/search" style={{ color: '#fff' }}><Search size={24} /></Link>
        </header>

        {/* Mobile Drawer Menu */}
        <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
          <SidebarContent onClose={() => setIsMenuOpen(false)} />
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div className="desktop-sidebar" style={{ width: '240px', background: '#000', borderRight: '1px solid #282828' }}>
            <SidebarContent />
          </div>
          <div className="music-main" style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(180deg, #1a1a1a 0%, #121212 400px)', padding: '24px' }}>
            <Routes>
              <Route path="/" element={<MusicHome />} />
              <Route path="/search" element={<MusicSearch />} />
              <Route path="/library" element={<MusicLibrary />} />
              <Route path="/artist/:id" element={<ArtistPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
            </Routes>
          </div>
        </div>
        <MusicPlayer />
      </div>
    </>
  );
};

export default MusicLayout;
