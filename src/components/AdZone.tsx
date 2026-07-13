import React from 'react';
import { getAdFor } from '../admin/adminStore';

interface AdZoneProps {
  type: 'leaderboard' | 'sidebar-rect' | 'sidebar-tall' | 'native';
  page?: 'home' | 'article';
  className?: string;
}

const HEIGHTS: Record<string, string> = {
  leaderboard: '90px', 'sidebar-rect': '250px', 'sidebar-tall': '600px', native: 'auto',
};
const DIMS: Record<string, string> = {
  leaderboard: '728 × 90', 'sidebar-rect': '300 × 250', 'sidebar-tall': '300 × 600', native: '',
};

export const AdZone: React.FC<AdZoneProps> = ({ type, page = 'home', className = '' }) => {
  const ad = getAdFor(type, page);

  // Reklam kapalıysa ya da bu sayfada gösterilmiyorsa hiçbir şey render etme
  if (!ad) return null;

  const handleClick = () => {
    if (ad.mode === 'image' && ad.destinationUrl && ad.destinationUrl !== '#') {
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`ad-container ${className}`} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: type === 'leaderboard' ? '24px' : '0' }}>
      <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsorlu Reklam</span>

      {ad.mode === 'code' && ad.code.trim() ? (
        // Özel reklam kodu (Google AdSense vb.)
        <div className={`ad-box ${type}`} style={{ width: '100%', minHeight: HEIGHTS[type], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: ad.code }} />
      ) : (
        <div
          className={`ad-box ${type}`}
          onClick={handleClick}
          style={{
            width: '100%', height: HEIGHTS[type], background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-premium)',
          }}
        >
          {ad.imageUrl ? (
            <>
              <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {(ad.title || ad.ctaText) && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85), transparent)', padding: '10px', color: '#fff', textAlign: 'left' }}>
                  {ad.title && <div style={{ fontSize: '13px', fontWeight: 800 }}>{ad.title}</div>}
                  {ad.ctaText && <div style={{ fontSize: '11px', color: 'var(--accent-gold, #ffd700)', fontWeight: 700 }}>{ad.ctaText} →</div>}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', opacity: 0.45, padding: '12px' }}>
              {ad.title ? (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{ad.title}</div>
                  {ad.description && <div style={{ fontSize: '11px', marginTop: '4px' }}>{ad.description}</div>}
                  {ad.ctaText && <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--accent-red)', fontWeight: 700 }}>{ad.ctaText} →</div>}
                </>
              ) : (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px' }}>REKLAM ALANI</div>
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>{DIMS[type]}</div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
