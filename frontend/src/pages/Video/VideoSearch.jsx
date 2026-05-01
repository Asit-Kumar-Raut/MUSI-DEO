import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft, Play, ExternalLink, TrendingUp } from 'lucide-react';

const VideoSearch = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  
  // Recommended search results
  const recommendations = [
    { id: 'UuHVGelXbeg', title: 'Tum Hi Ho - Arijit Singh', ch: 'T-Series' },
    { id: 'atKUGkb0Vno', title: 'Tera Ban Jaunga - Kabir Singh', ch: 'T-Series' },
    { id: 'caGz8FhFwzE', title: 'Makhna - Honey Singh', ch: 'T-Series' },
    { id: 'JGwWNGJdvx8', title: 'Shape of You - Ed Sheeran', ch: 'Ed Sheeran' },
    { id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi', ch: 'Luis Fonsi' },
    { id: 'RgKAFK5djSk', title: 'See You Again - Wiz Khalifa', ch: 'Wiz Khalifa' },
  ];

  return (
    <div style={{ paddingBottom: '60px', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .search-card:hover { background: #282828 !important; transform: translateY(-4px); }
        .search-card:hover .play-icon { opacity: 1 !important; transform: scale(1) !important; }
        .grid { display: grid; gridTemplateColumns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        @media(max-width:768px){ .grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <Link to="/video" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#b3b3b3', fontSize: '14px', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Browse
      </Link>
      
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>
          Results for "{q}"
        </h2>
        <p style={{ color: '#b3b3b3', fontSize: '15px' }}>Top results from YouTube and Local Library</p>
      </div>

      <div className="grid">
        {/* The Direct YouTube Search Link */}
        <div style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
          <div style={{ background: '#181818', borderRadius: '16px', padding: '24px', border: '1px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '64px', height: '64px', background: '#ff0000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={32} color="#fff" />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Explore Global YouTube Results</h3>
                <p style={{ color: '#b3b3b3', fontSize: '14px', marginTop: '4px' }}>Click to see all trending videos for "{q}" directly on YouTube.</p>
              </div>
            </div>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer" 
              style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: '30px', fontWeight: 800, textDecoration: 'none', fontSize: '14px', transition: '0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              Open YouTube Search
            </a>
          </div>
        </div>

        {/* Recommended Result Cards */}
        {recommendations.map(video => (
          <Link to={`/video/watch/yt-${video.id}`} key={video.id} style={{ textDecoration: 'none', color: '#fff' }}>
            <div className="search-card" style={{ background: '#181818', borderRadius: '16px', padding: '16px', height: '100%', transition: '0.3s', border: '1px solid transparent' }}>
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="play-icon" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transform: 'scale(0.8)', transition: '0.3s' }}>
                   <div style={{ background: '#1db954', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={24} fill="#000" color="#000" />
                   </div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', lineHeight: 1.4 }}>{video.title}</h4>
                <p style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: 500 }}>{video.ch} • YouTube</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoSearch;
