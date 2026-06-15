import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const go = (path) => navigate(user ? path : '/login');

  return (
    <div style={{ minHeight: '100vh', background: '#030108', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Styles for Animations */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse-glow-bg {
          0% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.15); opacity: 0.18; }
          100% { transform: scale(1); opacity: 0.12; }
        }
        .hero-title span {
          display: inline-block;
          animation: float-slow 4s ease-in-out infinite;
        }
        .hero-title span:nth-child(2) {
          animation-delay: 1.5s;
        }
        .animated-card-music {
          cursor: pointer;
          background: rgba(20, 12, 38, 0.45);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 44px 32px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 250px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.05);
          animation: float-slow 5s ease-in-out infinite;
        }
        .animated-card-music:hover {
          transform: translateY(-12px) scale(1.04) !important;
          border-color: #d946ef;
          box-shadow: 0 15px 35px rgba(217, 70, 239, 0.3), inset 0 0 15px rgba(217, 70, 239, 0.1);
        }
        .animated-card-video {
          cursor: pointer;
          background: rgba(12, 28, 38, 0.45);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(6, 182, 212, 0.2);
          padding: 44px 32px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 250px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.05);
          animation: float-reverse 5s ease-in-out infinite;
        }
        .animated-card-video:hover {
          transform: translateY(-12px) scale(1.04) !important;
          border-color: #06b6d4;
          box-shadow: 0 15px 35px rgba(6, 182, 212, 0.3), inset 0 0 15px rgba(6, 182, 212, 0.1);
        }
        .glow-dot-music {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: 0.3s;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .animated-card-music:hover .glow-dot-music {
          background: rgba(217, 70, 239, 0.3);
          transform: scale(1.1);
        }
        .glow-dot-video {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: 0.3s;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .animated-card-video:hover .glow-dot-video {
          background: rgba(6, 182, 212, 0.3);
          transform: scale(1.1);
        }
      `}</style>

      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '45%', height: '45%', background: '#8b5cf6', opacity: 0.15, filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none', animation: 'pulse-glow-bg 6s infinite alternate' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '45%', height: '45%', background: '#d946ef', opacity: 0.12, filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none', animation: 'pulse-glow-bg 7s infinite alternate-reverse' }} />

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 48px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.2em', background: 'linear-gradient(90deg, #fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 15px rgba(139,92,246,0.3)' }}>MUSI-DEO</h1>
        {user ? (
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px 22px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>{user.username}</div>
        ) : (
          <button onClick={() => navigate('/login')} style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 22px', borderRadius: '9999px', transition: 'all 0.3s ease' }} onMouseOver={e => { e.target.style.background = '#8b5cf6'; e.target.style.borderColor = '#8b5cf6'; }} onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}>Sign In</button>
        )}
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', zIndex: 10 }} className="animate-fade-in">
        <h2 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
          One Platform. <br />
          <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #d946ef 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Infinite Music.</span> <br />
          <span style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Endless Video.</span>
        </h2>
        <p style={{ fontSize: '1.15rem', color: '#b3aed2', maxWidth: '600px', marginBottom: '44px', lineHeight: '1.6' }}>
          Your ultimate gateway to seamless global streaming. Listen to millions of high-res songs, watch trending cinema & videos — all synchronized in one premium dark canvas.
        </p>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Music Card */}
          <div onClick={() => go('/music')} className="animated-card-music">
            <div className="glow-dot-music">🎵</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Music</h3>
            <p style={{ fontSize: '0.88rem', color: '#b3aed2', lineHeight: '1.4' }}>Stream millions of tracks dynamically via JioSaavn & iTunes APIs.</p>
          </div>

          {/* Video Card */}
          <div onClick={() => go('/video')} className="animated-card-video">
            <div className="glow-dot-video">🎬</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Video</h3>
            <p style={{ fontSize: '0.88rem', color: '#b3aed2', lineHeight: '1.4' }}>Watch cinema, trailers & video tutorials with native players.</p>
          </div>
        </div>
      </main>

      {/* Background ambient video */}
      <video autoPlay muted loop style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.05, zIndex: 0, pointerEvents: 'none' }}>
        <source src="/media/musicbackground.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default LandingPage;
