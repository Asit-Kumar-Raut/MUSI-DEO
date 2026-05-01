import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Search, TrendingUp, Music, Info, ExternalLink, X } from 'lucide-react';
import { allVideos } from '../../data/mediaData';

const VideoCard = ({ video, type }) => {
  const isYoutube = type === 'yt';
  const id = isYoutube ? `yt-${video.id}` : `local-${video.id}`;
  const thumb = isYoutube 
    ? `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg` 
    : (video.thumbnail || '/media/sujal.jpg');

  return (
    <Link to={`/video/watch/${id}`} style={{ textDecoration: 'none', color: '#fff' }}>
      <div className="video-card" style={{ background: '#181818', borderRadius: '12px', padding: '12px', height: '100%', transition: 'all 0.3s', position: 'relative', overflow: 'hidden', border: '1px solid transparent' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
          <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="play-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }}>
            <div style={{ background: '#1db954', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={24} fill="#000" color="#000" /></div>
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</h3>
          <p style={{ fontSize: '12px', color: '#b3b3b3' }}>{isYoutube ? video.ch : 'Local Media'}</p>
        </div>
      </div>
    </Link>
  );
};

const VideoHome = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('video_popup_seen');
    if (!hasSeen) {
      setShowPopup(true);
      sessionStorage.setItem('video_popup_seen', 'true');
    }
  }, []);

  const YT_SECTIONS = [
    { title: 'Trending Bollywood', videos: [{ id: 'UuHVGelXbeg', title: 'Tum Hi Ho - Arijit Singh', ch: 'T-Series' }, { id: 'atKUGkb0Vno', title: 'Tera Ban Jaunga - Bollywood', ch: 'T-Series' }, { id: 'VNz4gk0isAk', title: 'Kala Chashma', ch: 'T-Series' }, { id: 'hAFr1KVkSKE', title: 'Kaun Tujhe', ch: 'T-Series' }] },
    { title: 'International Hits', videos: [{ id: 'JGwWNGJdvx8', title: 'Shape of You - Ed Sheeran', ch: 'Ed Sheeran' }, { id: 'kJQP7kiw5Fk', title: 'Despacito', ch: 'Luis Fonsi' }, { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', ch: 'Alan Walker' }, { id: 'PT2_F-1esPk', title: 'Blinding Lights', ch: 'The Weeknd' }] }
  ];

  return (
    <div style={{ paddingBottom: '40px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .video-card:hover { background: #282828 !important; border-color: #444 !important; }
        .video-card:hover .play-overlay { opacity: 1 !important; }
        .vgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        @media(max-width:768px){ .vgrid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Development Popup */}
      {showPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1db954', color: '#000', padding: '40px', borderRadius: '24px', maxWidth: '500px', textAlign: 'center', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <X onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} size={24} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '20px' }}>Welcome to Video!</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.5 }}>
              "We are working in video page so enjoy your music"
            </p>
            <button onClick={() => setShowPopup(false)} style={{ marginTop: '30px', background: '#000', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '30px', fontWeight: 800, cursor: 'pointer' }}>Got it!</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Video Gallery</h2>
        <p style={{ color: '#b3b3b3' }}>Watch verified global hits and local favorites.</p>
      </div>
      
      <section style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', color: '#fff' }}>Local Library</h3>
        <div className="vgrid">
          {allVideos.map(video => <VideoCard key={video.id} video={video} type="local" />)}
        </div>
      </section>

      {YT_SECTIONS.map(section => (
        <section key={section.title} style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', color: '#fff' }}>{section.title}</h3>
          <div className="vgrid">
            {section.videos.map(video => <VideoCard key={video.id} video={video} type="yt" />)}
          </div>
        </section>
      ))}
    </div>
  );
};

export default VideoHome;
