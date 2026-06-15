import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  background: '#150f24',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.3s ease',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
};

const getFriendlyErrorMessage = (err) => {
  if (!err) return 'Authentication failed';
  const code = err.code || (err.message && err.message.includes('auth/') ? err.message : '');
  console.log("Firebase Auth Error Details:", err);
  
  if (code.includes('user-not-found')) {
    return 'No account found with this email. Please sign up or verify your details.';
  }
  if (code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many failed attempts. Access has been temporarily locked to protect your account. Please try again later.';
  }
  if (code.includes('network-request-failed')) {
    return 'Network connection lost. Please verify your internet connection and try again.';
  }
  if (code.includes('popup-blocked')) {
    return '🚫 Sign-in popup was blocked by your browser. Please enable popups for this site in your browser settings (look at the right side of the address bar) and try again.';
  }
  
  const rawMsg = err.message ? err.message.replace('Firebase: ', '') : '';
  return rawMsg || 'Authentication failed. Please try again.';
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signInWithGoogle, loginAsGuest } = useAuth();

  const handleGuest = () => {
    loginAsGuest();
    navigate('/music');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      // Trigger login immediately so the browser recognizes it as a direct user action
      await signInWithGoogle();
      setLoading(true);
      navigate('/');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030108', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Background Neon Glow Rings */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: '#8b5cf6', opacity: 0.12, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '25%', width: '250px', height: '250px', background: '#d946ef', opacity: 0.10, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      
      {/* Container Box */}
      <div className="animate-fade-in glow-pulse" style={{ background: 'rgba(10, 6, 20, 0.75)', backdropFilter: 'blur(24px)', border: '1px solid rgba(139, 92, 246, 0.15)', padding: '40px 36px', borderRadius: '24px', width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        
        {/* Logo and Headings */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.png" alt="MUSI-DEO" style={{ width: '70px', height: '70px', filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.5))' }} />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px', color: '#fff', textShadow: '0 0 10px rgba(139,92,246,0.3)' }}>MUSI-DEO</h1>
        <p style={{ textAlign: 'center', color: '#a78bfa', fontSize: '0.9rem', marginBottom: '28px' }}>Sign in to sync your library & playlists</p>

        {/* Display Errors */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.88rem', textAlign: 'center', lineHeight: '1.4' }}>
            {error}
          </div>
        )}

        {/* Form contents */}
        <div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = '#8b5cf6'} 
                onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'} 
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = '#8b5cf6'} 
                onBlur={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'} 
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link to="/forgot-password" style={{ color: '#a78bfa', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#d946ef'} onMouseOut={e => e.target.style.color = '#a78bfa'}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', border: 'none', boxShadow: '0 4px 15px rgba(139,92,246,0.4)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* OR Continue With Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0 20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ padding: '0 12px', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Google Sign-In Button */}
        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px 14px', 
            background: 'rgba(255,255,255,0.04)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '10px', 
            color: '#fff', 
            fontWeight: 600, 
            fontSize: '0.9rem', 
            cursor: 'pointer', 
            transition: 'all 0.3s ease', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '12px'
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        {/* Guest Access Button */}
        <button type="button" onClick={handleGuest} style={{ width: '100%', padding: '12px 14px', background: 'transparent', color: '#b91c1c', fontWeight: 600, fontSize: '0.9rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '8px' }} onMouseOver={e => { e.target.style.background = 'rgba(239,68,68,0.05)'; e.target.style.borderColor = 'rgba(239,68,68,0.4)'; }} onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(239,68,68,0.2)'; }}>
          Continue as Guest
        </button>

        {/* Redirect to Signup */}
        <p style={{ textAlign: 'center', color: '#888', marginTop: '28px', fontSize: '0.85rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }} onMouseOver={e => e.target.style.color = '#8b5cf6'} onMouseOut={e => e.target.style.color = '#fff'}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
