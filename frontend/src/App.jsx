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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #111 0%, #000 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse-logo {
          0% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 0px #1db954); }
          50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 20px #1db954); }
          100% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 0px #1db954); }
        }
        @keyframes spin-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-ring {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #1db954;
          animation: spin-ring 2s linear infinite;
        }
        .loading-ring-inner {
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: #1db954;
          animation: spin-ring 1.5s linear reverse infinite;
          opacity: 0.5;
        }
      `}</style>
      
      <div className="loading-ring"></div>
      <div className="loading-ring-inner"></div>
      
      <img src="/logo.png" alt="MUSI-DEO" style={{ width: '100px', height: '100px', zIndex: 10, animation: 'pulse-logo 2s infinite ease-in-out' }} />
      
      <div style={{ marginTop: '40px', textAlign: 'center', zIndex: 10 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.3em', color: '#1db954', textTransform: 'uppercase' }}>MUSI-DEO</div>
        <div style={{ color: '#666', fontSize: '12px', marginTop: '8px', letterSpacing: '0.1em' }}>EXPERIENCE THE SOUND</div>
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
      <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
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
