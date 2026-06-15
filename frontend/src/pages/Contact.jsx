import React, { useState } from 'react';
import { Mail, MessageSquare, Send, User, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5001/api' 
  : 'https://musi-deo.vercel.app/api';

const Contact = () => {
  const location = useLocation();
  const isVideo = location.pathname.startsWith('/video');
  
  // Theme Variables
  const accentColor = isVideo ? '#ff0000' : '#8b5cf6';
  const iconColor = isVideo ? '#ff3b30' : '#d946ef';
  const accentGradient = isVideo 
    ? 'linear-gradient(135deg, #ff0000 0%, #ff5555 100%)'
    : 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)';
  const shadowColor = isVideo ? 'rgba(255, 0, 0, 0.4)' : 'rgba(139, 92, 246, 0.4)';
  const cardBg = isVideo ? '#161616' : 'rgba(10, 6, 20, 0.75)';
  const borderStyle = isVideo ? '1px solid #272727' : '1px solid rgba(139, 92, 246, 0.15)';
  const inputBg = isVideo ? '#1f1f1f' : '#150f24';
  const inputBorder = isVideo ? '1px solid #303030' : '1px solid rgba(139, 92, 246, 0.2)';
  const focusShadow = isVideo ? 'rgba(255, 0, 0, 0.2)' : 'rgba(139, 92, 246, 0.2)';

  const [formData, setFormData] = useState({ name: '', email: '', message: '', feedbackType: 'Support' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      await axios.post(`${API}/auth/contact`, formData);
      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', email: '', message: '', feedbackType: 'Support' });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.response?.data?.message || 'Failed to send message' });
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: inputBg,
    border: inputBorder,
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.5s ease', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .contact-input:focus { border-color: ${accentColor} !important; box-shadow: 0 0 10px ${focusShadow} !important; }
        .contact-card {
          background: ${cardBg};
          backdrop-filter: blur(24px);
          border: ${borderStyle};
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          transition: all 0.3s ease;
        }
        .contact-card:hover {
          border-color: ${isVideo ? 'rgba(255,0,0,0.3)' : 'rgba(139,92,246,0.3)'};
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '12px', textShadow: `0 0 15px ${isVideo ? 'rgba(255,0,0,0.2)' : 'rgba(139,92,246,0.2)'}` }}>Get in Touch</h1>
        <p style={{ color: '#a78bfa', fontSize: '1.1rem' }}>Have feedback or need support? We're here to help.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        
        {/* Info Side */}
        <div style={{ color: '#fff' }}>
          <div className="contact-card" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: '#fff' }}>Support Channels</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ background: isVideo ? 'rgba(255,0,0,0.1)' : 'rgba(139,92,246,0.15)', padding: '12px', borderRadius: '12px' }}>
                <Mail color={iconColor} size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Mail Us</div>
                <div style={{ color: '#888', fontSize: '14px', marginTop: '2px' }}>Contact our support team</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ background: isVideo ? 'rgba(255,0,0,0.1)' : 'rgba(139,92,246,0.15)', padding: '12px', borderRadius: '12px' }}>
                <MessageSquare color={iconColor} size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>AI Assistant</div>
                <div style={{ color: '#888', fontSize: '14px', marginTop: '2px' }}>Talk to Asig for instant help</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div>
          {status.success ? (
            <div className="contact-card" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
              <CheckCircle size={64} color={iconColor} style={{ marginBottom: '16px', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>Message Sent!</h3>
              <p style={{ color: '#888', marginTop: '12px' }}>Thank you for reaching out. We'll get back to you soon.</p>
              <button 
                onClick={() => setStatus({ ...status, success: false })} 
                style={{ 
                  marginTop: '24px', 
                  background: accentGradient, 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px 32px', 
                  borderRadius: '30px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${shadowColor}`
                }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-card" style={{ padding: '32px', borderRadius: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Your Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input type="text" required placeholder="ASIT" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inputStyle, paddingLeft: '48px' }} className="contact-input" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input type="email" required placeholder="xyz@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ ...inputStyle, paddingLeft: '48px' }} className="contact-input" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Feedback Type</label>
                <select value={formData.feedbackType} onChange={e => setFormData({ ...formData, feedbackType: e.target.value })} style={inputStyle} className="contact-input">
                  <option value="Support" style={{ background: '#120d1e' }}>Support</option>
                  <option value="Feedback" style={{ background: '#120d1e' }}>Feedback</option>
                  <option value="Feature Request" style={{ background: '#120d1e' }}>Feature Request</option>
                  <option value="Bug Report" style={{ background: '#120d1e' }}>Bug Report</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Message</label>
                <textarea required rows="4" placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} style={{ ...inputStyle, resize: 'none' }} className="contact-input"></textarea>
              </div>

              {status.error && <p style={{ color: '#fca5a5', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{status.error}</p>}

              <button 
                type="submit" 
                disabled={status.loading} 
                style={{ 
                  width: '100%', 
                  background: accentGradient, 
                  color: '#fff', 
                  border: 'none', 
                  padding: '16px', 
                  borderRadius: '30px', 
                  fontWeight: 800, 
                  fontSize: '16px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px', 
                  boxShadow: `0 4px 15px ${shadowColor}`,
                  opacity: status.loading ? 0.7 : 1 
                }}
              >
                {status.loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
