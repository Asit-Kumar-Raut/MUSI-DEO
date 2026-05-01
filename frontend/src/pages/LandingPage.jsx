import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const go = (path) => navigate(user ? path : '/login');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: '#1db954', opacity: 0.15, filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: '#ff0000', opacity: 0.15, filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.15em', background: 'linear-gradient(90deg, #fff, #b3b3b3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MUSI-DEO</h1>
        {user ? (
          <div style={{ background: '#242424', padding: '8px 20px', borderRadius: '9999px', fontWeight: 600, border: '1px solid #333', color: '#fff' }}>{user.username}</div>
        ) : (
          <button onClick={() => navigate('/login')} style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', background: 'none', border: 'none' }}>Sign In</button>
        )}
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', zIndex: 10 }} className="animate-fade-in">
        <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
          One Platform. <br />
          <span style={{ color: '#1db954' }}>Infinite Music.</span> <br />
          <span style={{ color: '#ff4444' }}>Endless Video.</span>
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#b3b3b3', maxWidth: '600px', marginBottom: '48px' }}>
          Listen your music, enjoy your video — all in one place.
        </p>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Music Card */}
          <div onClick={() => go('/music')} style={{ cursor: 'pointer', background: 'rgba(18,18,18,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(29,185,84,0.3)', padding: '40px 32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '240px', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(29,185,84,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)'; e.currentTarget.style.borderColor = '#1db954'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(29,185,84,0.3)'; }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(29,185,84,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎵</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Music</h3>
            <p style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>Listen to your songs</p>
          </div>

          {/* Video Card */}
          <div onClick={() => go('/video')} style={{ cursor: 'pointer', background: 'rgba(18,18,18,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,0,0,0.3)', padding: '40px 32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '240px', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(255,0,0,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)'; e.currentTarget.style.borderColor = '#ff0000'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.3)'; }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Video</h3>
            <p style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>Watch trending videos</p>
          </div>
        </div>
      </main>

      {/* Background video */}
      <video autoPlay muted loop style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08, zIndex: 0, pointerEvents: 'none' }}>
        <source src="/media/musicbackground.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default LandingPage;
