import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { PlaylistProvider } from './context/PlaylistContext';
import AIAssistant from './components/AIAssistant';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import ForgotPassword from './pages/Auth/ForgotPassword';
import MusicLayout from './pages/Music/MusicLayout';
import VideoLayout from './pages/Video/VideoLayout';
import LandingPage from './pages/LandingPage';
import Contact from './pages/Contact';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #0d081f 0%, #030108 100%)', color: '#fff', position: 'relative', overflow: 'hidden', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes pulse-logo {
          0% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 0px #8b5cf6); }
          50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 25px #d946ef); }
          100% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 0px #8b5cf6); }
        }
        @keyframes spin-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-ring {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #8b5cf6;
          border-bottom-color: #d946ef;
          animation: spin-ring 2.5s cubic-bezier(0.53, 0.21, 0.29, 0.67) infinite;
        }
        .loading-ring-inner {
          position: absolute;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-left-color: #d946ef;
          border-right-color: #8b5cf6;
          animation: spin-ring 1.8s linear reverse infinite;
          opacity: 0.6;
        }
        /* Background decorative glowing particles */
        .splash-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }
      `}</style>
      
      {/* Decorative Blur Ambient Lights */}
      <div className="splash-particle" style={{ top: '20%', left: '15%', width: '250px', height: '250px', animation: 'pulse-logo 4s infinite alternate' }} />
      <div className="splash-particle" style={{ bottom: '20%', right: '15%', width: '250px', height: '250px', animation: 'pulse-logo 3s infinite alternate-reverse' }} />
      
      <div className="loading-ring"></div>
      <div className="loading-ring-inner"></div>
      
      <img src="/logo.png" alt="MUSI-DEO" style={{ width: '110px', height: '110px', zIndex: 10, animation: 'pulse-logo 2.2s infinite ease-in-out' }} />
      
      <div style={{ marginTop: '40px', textAlign: 'center', zIndex: 10 }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.4em', background: 'linear-gradient(135deg, #ffffff 0%, #d946ef 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(139,92,246,0.4)' }}>MUSI-DEO</div>
        <div style={{ color: '#a78bfa', fontSize: '12px', marginTop: '10px', letterSpacing: '0.15em', fontWeight: 600 }}>EXPERIENCE THE SOUND & VIDEO</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/music/*" element={<ProtectedRoute><MusicLayout /></ProtectedRoute>} />
      <Route path="/video/*" element={<ProtectedRoute><VideoLayout /></ProtectedRoute>} />
      <Route path="/contact" element={<Navigate to="/music/contact" replace />} />
    </Routes>
  );
};

function App() {
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      // Notify components that app is installable
      window.dispatchEvent(new Event('pwa-installable'));
    };

    const handleAppInstalled = () => {
      window.deferredPrompt = null;
      window.dispatchEvent(new Event('pwa-installed'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <AuthProvider>
      <PlayerProvider>
        <PlaylistProvider>
          <Router>
            <AppRoutes />
            <AIAssistant />
          </Router>
        </PlaylistProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
