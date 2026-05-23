import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5001/api' 
  : 'https://musi-deo.vercel.app/api';

const inputStyle = { width: '100%', padding: '14px 16px', background: '#242424', border: '1px solid transparent', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.2s ease' };

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, { username, email, password });
      navigate('/verify', { state: { email } });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '30%', right: '10%', width: '30%', height: '30%', background: '#6366f1', opacity: 0.15, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <form onSubmit={handleRegister} className="animate-fade-in" style={{ background: 'rgba(18,18,18,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', padding: '48px', borderRadius: '24px', width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px', color: '#fff' }}>MUSI-DEO</h1>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '32px' }}>Join the ultimate entertainment platform.</p>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <div style={{ marginBottom: '16px' }}>
          <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#1db954'} onBlur={e => e.target.style.borderColor = 'transparent'} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#1db954'} onBlur={e => e.target.style.borderColor = 'transparent'} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#1db954'} onBlur={e => e.target.style.borderColor = 'transparent'} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#1db954', color: '#000', fontWeight: 700, fontSize: '1rem', borderRadius: '9999px', cursor: 'pointer', transition: '0.2s', border: 'none', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p style={{ textAlign: 'center', color: '#a0a0a0', marginTop: '32px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#fff', fontWeight: 600 }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
