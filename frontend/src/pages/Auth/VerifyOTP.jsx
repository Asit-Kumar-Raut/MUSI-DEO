import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5001/api' 
  : 'https://musi-deo.vercel.app/api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => { if (!email) navigate('/register'); }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post(`${API}/auth/verify-otp`, { email, otp });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <form onSubmit={handleVerify} className="animate-fade-in" style={{ background: 'rgba(18,18,18,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', padding: '48px', borderRadius: '24px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px', color: '#fff' }}>MUSI-DEO</h1>
        <div style={{ width: '64px', height: '64px', background: '#242424', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px auto', fontSize: '28px' }}>🔑</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Check Your Email</h2>
        <p style={{ color: '#a0a0a0', marginBottom: '8px', fontSize: '0.9rem' }}>We've sent a 6-digit code to<br /><span style={{ color: '#fff', fontWeight: 600 }}>{email}</span></p>
        <p style={{ color: '#facc15', fontSize: '0.8rem', fontWeight: 600, marginBottom: '24px' }}>⚠️ Not in inbox? Check your SPAM folder.</p>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
        <input type="text" placeholder="Enter 6-digit OTP" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} style={{ width: '100%', padding: '16px', background: '#242424', border: '1px solid transparent', borderRadius: '8px', color: '#fff', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5em', fontWeight: 700, outline: 'none', marginBottom: '24px' }} />
        <button type="submit" disabled={loading || otp.length !== 6} style={{ width: '100%', padding: '14px', background: '#1db954', color: '#000', fontWeight: 700, fontSize: '1rem', borderRadius: '9999px', cursor: 'pointer', border: 'none', opacity: (loading || otp.length !== 6) ? 0.6 : 1 }}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;
