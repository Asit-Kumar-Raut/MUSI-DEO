import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const inputStyle = { width: '100%', padding: '14px 16px', background: '#242424', border: '1px solid transparent', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' };

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message); setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to reset password'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="animate-fade-in" style={{ background: 'rgba(18,18,18,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', padding: '48px', borderRadius: '24px', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px', color: '#fff' }}>MUSI-DEO</h1>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Reset Password</h2>
        <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '32px', fontSize: '0.9rem' }}>{step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code and your new password.'}</p>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.5)', color: '#4ade80', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: '24px' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#1db954', color: '#000', fontWeight: 700, borderRadius: '9999px', cursor: 'pointer', border: 'none', opacity: loading ? 0.6 : 1 }}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input type="text" placeholder="Enter 6-digit OTP" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '16px' }} />
            <input type="password" placeholder="New Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '24px' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#1db954', color: '#000', fontWeight: 700, borderRadius: '9999px', cursor: 'pointer', border: 'none', opacity: loading ? 0.6 : 1 }}>{loading ? 'Resetting...' : 'Confirm New Password'}</button>
          </form>
        )}
        <p style={{ textAlign: 'center', color: '#a0a0a0', marginTop: '32px', fontSize: '0.9rem' }}>Remembered? <Link to="/login" style={{ color: '#fff', fontWeight: 600 }}>Back to login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
