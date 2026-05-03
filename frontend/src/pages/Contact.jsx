import React, { useState } from 'react';
import { Mail, MessageSquare, Send, User, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', feedbackType: 'Support' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      await axios.post('https://musi-deo.vercel.app/api/auth/contact', formData);
      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', email: '', message: '', feedbackType: 'Support' });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.response?.data?.message || 'Failed to send message' });
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .contact-input:focus { border-color: #1db954 !important; box-shadow: 0 0 10px rgba(29,185,84,0.1); }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>Get in Touch</h1>
        <p style={{ color: '#b3b3b3', fontSize: '1.1rem' }}>Have feedback or need support? We're here to help.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        
        {/* Info Side */}
        <div style={{ color: '#fff' }}>
          <div style={{ background: '#181818', padding: '32px', borderRadius: '24px', border: '1px solid #282828' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Support Channels</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(29,185,84,0.1)', padding: '12px', borderRadius: '12px' }}><Mail color="#1db954" /></div>
              <div>
                <div style={{ fontWeight: 700 }}>Mail Us</div>
                <div style={{ color: '#b3b3b3', fontSize: '14px' }}>Contact our support team</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(29,185,84,0.1)', padding: '12px', borderRadius: '12px' }}><MessageSquare color="#1db954" /></div>
              <div>
                <div style={{ fontWeight: 700 }}>AI Assistant</div>
                <div style={{ color: '#b3b3b3', fontSize: '14px' }}>Talk to Asig for instant help</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div>
          {status.success ? (
            <div style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid #1db954', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
              <CheckCircle size={64} color="#1db954" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>Message Sent!</h3>
              <p style={{ color: '#b3b3b3', marginTop: '12px' }}>Thank you for reaching out. We'll get back to you soon.</p>
              <button onClick={() => setStatus({ ...status, success: false })} style={{ marginTop: '24px', background: '#1db954', color: '#000', border: 'none', padding: '12px 32px', borderRadius: '30px', fontWeight: 700, cursor: 'pointer' }}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: '#181818', padding: '32px', borderRadius: '24px', border: '1px solid #282828' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Your Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input type="text" required placeholder="ASIT" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inputStyle, paddingLeft: '48px' }} className="contact-input" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input type="email" required placeholder="xyz@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ ...inputStyle, paddingLeft: '48px' }} className="contact-input" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Feedback Type</label>
                <select value={formData.feedbackType} onChange={e => setFormData({ ...formData, feedbackType: e.target.value })} style={inputStyle} className="contact-input">
                  <option value="Support">Support</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#b3b3b3', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Message</label>
                <textarea required rows="4" placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} style={{ ...inputStyle, resize: 'none' }} className="contact-input"></textarea>
              </div>

              {status.error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{status.error}</p>}

              <button type="submit" disabled={status.loading} style={{ width: '100%', background: '#1db954', color: '#000', border: 'none', padding: '16px', borderRadius: '30px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: status.loading ? 0.7 : 1 }}>
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
