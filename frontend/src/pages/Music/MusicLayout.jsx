import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, PlusCircle, Heart, LogOut, Video, Menu, X, Music as MusicIcon, MessageSquare, Download } from 'lucide-react';
import MusicPlayer from './components/MusicPlayer';
import MusicHome from './MusicHome';
import MusicSearch from './MusicSearch';
import MusicLibrary from './MusicLibrary';
import ArtistPage from './ArtistPage';
import PlaylistPage from './PlaylistPage';
import { useAuth } from '../../context/AuthContext';
import { usePlaylists } from '../../context/PlaylistContext';
import Contact from '../Contact';

const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { playlists, createPlaylist } = usePlaylists();
  
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallOption, setShowInstallOption] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setShowInstallOption((!!window.deferredPrompt || ios) && !isStandalone);

    const handleInstallable = () => setShowInstallOption(true);
    const handleInstalled = () => setShowInstallOption(false);

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      alert("To install MUSI-DEO on your Apple device:\n\n1. Tap the Share button at the bottom (iPhone) or top (iPad) of Safari.\n2. Scroll down and select 'Add to Home Screen'.\n3. Tap 'Add' to launch MUSI-DEO as a full screen app!");
      return;
    }

    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    window.deferredPrompt = null;
    setShowInstallOption(false);
  };

  const handleCreate = () => {
    const name = prompt("Enter playlist name:");
    if (name) createPlaylist(name);
  };

  const navItems = [
    { path: '/music', label: 'Home', Icon: Home },
    { path: '/music/search', label: 'Search', Icon: Search },
    { path: '/music/library', label: 'Your Library', Icon: Library },
    { path: '/music/contact', label: 'Contact & Feedback', Icon: MessageSquare },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px' }}>
      <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent-music)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="text-gradient">MUSI-DEO</span>
        {onClose && <X onClick={onClose} style={{ cursor: 'pointer', color: '#fff' }} />}
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, color: active ? '#fff' : 'var(--text-secondary)', textDecoration: 'none', background: active ? 'var(--bg-hover)' : 'transparent', border: active ? '1px solid rgba(139, 92, 246, 0.15)' : '1px solid transparent', transition: '0.2s' }}>
              <Icon size={24} color={active ? 'var(--accent-music-hover)' : 'var(--text-muted)'} /> {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '16px', paddingLeft: '12px' }}>PLAYLISTS</p>
        <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', padding: '10px 12px', width: '100%', textAlign: 'left', transition: '0.2s' }}>
          <div style={{ background: '#fff', borderRadius: '2px', padding: '4px' }}><PlusCircle size={16} color="#000" /></div> Create Playlist
        </button>
        <Link to="/music/playlist/fav" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none', padding: '10px 12px', transition: '0.2s' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-music), var(--accent-music-hover))', borderRadius: '2px', padding: '4px' }}><Heart size={16} color="#fff" fill="#fff" /></div> Liked Songs
        </Link>
      </div>

      <div style={{ marginTop: '12px', borderTop: '1px solid rgba(139, 92, 246, 0.1)', paddingTop: '12px', overflowY: 'auto' }} className="no-scrollbar">
        {playlists.filter(p => p.id !== 'fav').map(pl => (
          <Link key={pl.id} to={`/music/playlist/${pl.id}`} onClick={onClose} style={{ display: 'block', padding: '8px 12px', color: location.pathname === `/music/playlist/${pl.id}` ? '#fff' : 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', transition: '0.2s' }}>
            {pl.name}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        {showInstallOption && (
          <button onClick={handleInstall} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)', transition: '0.2s' }}>
            <Download size={20} /> Install App
          </button>
        )}
        <Link to="/video" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-video)', fontWeight: 800, textDecoration: 'none', marginBottom: '16px', padding: '12px', background: 'rgba(255, 0, 127, 0.08)', borderRadius: '8px', border: '1px solid rgba(255,0,127,0.15)', transition: '0.2s' }}><Video size={20} /> Switch to Video</Link>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: '12px', transition: '0.2s' }}><LogOut size={20} /> Logout</button>
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
        .mobile-drawer { position: fixed; inset: 0; background: var(--bg-secondary); z-index: 1000; transform: translateX(-100%); transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
        .mobile-drawer.open { transform: translateX(0); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', color: '#fff', overflow: 'hidden' }}>
        
        {/* Mobile Header with 3-Bar Menu */}
        <header className="mobile-header" style={{ display: 'none', height: '64px', background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(139, 92, 246, 0.1)', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Menu onClick={() => setIsMenuOpen(true)} style={{ cursor: 'pointer' }} size={28} />
            <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent-music)', letterSpacing: '0.05em' }} className="text-gradient">MUSI-DEO</span>
          </div>
          <Link to="/music/search" style={{ color: '#fff' }}><Search size={24} /></Link>
        </header>

        {/* Mobile Drawer Menu */}
        <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
          <SidebarContent onClose={() => setIsMenuOpen(false)} />
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div className="desktop-sidebar" style={{ width: '240px', background: 'var(--bg-secondary)', borderRight: '1px solid rgba(139, 92, 246, 0.1)' }}>
            <SidebarContent />
          </div>
          <div className="music-main" style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(180deg, var(--bg-tertiary) 0%, var(--bg-primary) 400px)', padding: '24px' }}>
            <Routes>
              <Route path="/" element={<MusicHome />} />
              <Route path="/search" element={<MusicSearch />} />
              <Route path="/library" element={<MusicLibrary />} />
              <Route path="/artist/:id" element={<ArtistPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </div>
        </div>
        <MusicPlayer />
      </div>
    </>
  );
};

export default MusicLayout;
