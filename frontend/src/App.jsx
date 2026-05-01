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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#fff', fontSize: '1.2rem' }}>
      Loading...
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
