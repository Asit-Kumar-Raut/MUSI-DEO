import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Download, ArrowLeft, ExternalLink, Play, AlertCircle } from 'lucide-react';
import { allVideos } from '../../data/mediaData';

const VideoWatch = () => {
  const { id } = useParams();
  const isYoutube = id.startsWith('yt-');
  const videoId = isYoutube ? id.replace('yt-', '') : id.replace('local-', '');
  const [hasError, setHasError] = useState(false);

  const localVideo = !isYoutube ? allVideos.find(v => v.id === parseInt(videoId)) : null;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media(max-width:1100px){ .watch-layout { flex-direction: column !important; } .watch-sidebar { width: 100% !important; } }
        .action-btn:hover { background: #3e3e3e !important; transform: scale(1.05); }
        .yt-fallback { position: absolute; inset: 0; background: #111; display: flex; flex-direction: column; align-items: center; justifyContent: center; text-align: center; padding: 20px; z-index: 5; }
      `}</style>

      <Link to="/video" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#b3b3b3', fontSize: '14px', textDecoration: 'none', marginBottom: '24px', fontWeight: 600, transition: '0.2s' }}>
        <ArrowLeft size={18} /> Back to Browse
      </Link>

      <div className="watch-layout" style={{ display: 'flex', gap: '32px' }}>
        {/* Main Player Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            background: '#000', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)', 
            aspectRatio: '16/9',
            position: 'relative',
            border: '1px solid #282828'
          }}>
            {isYoutube ? (
              <>
                <iframe 
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1&origin=${window.location.origin}`} 
                  title="Premium Video Player" 
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
                  allowFullScreen 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                   <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer" 
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', textDecoration: 'none', fontWeight: 700, border: '1px solid #444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Open YouTube <ExternalLink size={14} />
                  </a>
                </div>
              </>
            ) : localVideo ? (
              <video src={localVideo.src} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Video not found</div>}
          </div>

          <div style={{ marginTop: '24px' }}>
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {localVideo?.title || 'YouTube Global Video'}
            </h1>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Play size={24} color="#1db954" fill="#1db954" />
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700 }}>{isYoutube ? 'Streaming via YouTube' : 'Playing Local Media'}</p>
                    <p style={{ color: '#aaa', fontSize: '12px' }}>Zero ads, premium experience.</p>
                  </div>
               </div>
               {isYoutube && (
                 <p style={{ color: '#aaa', fontSize: '12px', maxWidth: '300px', textAlign: 'right' }}>
                   Note: If video says "Unavailable", it's restricted by the artist. Click "Open YouTube" above to watch.
                 </p>
               )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="watch-sidebar" style={{ width: '400px', flexShrink: 0 }}>
          <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '20px', fontSize: '1.2rem' }}>Related Content</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allVideos.slice(0, 5).map(v => (
              <Link to={`/video/watch/local-${v.id}`} key={v.id} style={{ display: 'flex', gap: '14px', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '8px' }}>
                <div style={{ width: '140px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                  <video src={v.src} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{v.title}</h4>
                  <p style={{ color: '#b3b3b3', fontSize: '11px', marginTop: '4px' }}>Local Quality</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoWatch;
