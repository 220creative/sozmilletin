import React from 'react';
import { getAdFor } from '../admin/adminStore';

interface AdZoneProps {
  type: 'leaderboard' | 'sidebar-rect' | 'sidebar-tall' | 'native';
  page?: 'home' | 'article';
  className?: string;
}

// Alan boşken (görsel yok) gösterilecek önerilen ölçü
const DIMS: Record<string, string> = {
  leaderboard: '970 × 250', 'sidebar-rect': '300 × 250', 'sidebar-tall': '300 × 600', native: '',
};

export const AdZone: React.FC<AdZoneProps> = ({ type, page = 'home', className = '' }) => {
  const ad = getAdFor(type, page);

  // Reklam kapalıysa ya da bu sayfada gösterilmiyorsa hiçbir şey render etme
  if (!ad) return null;

  const fit = ad.imageFit || 'contain';
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(ad.imageUrl);
  const isLink = ad.mode === 'image' && !!ad.destinationUrl && ad.destinationUrl !== '#';

  const handleClick = () => {
    if (isLink) window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`ad-container ${type === 'leaderboard' ? 'ad-leaderboard' : ''} ${className}`}>
      <span className="ad-label">Sponsorlu Reklam</span>

      {ad.mode === 'code' && ad.code.trim() ? (
        // Özel reklam kodu (Google AdSense vb.) — kod kendi boyutunu yönetir
        <div className={`ad-box ${type} ad-code`} dangerouslySetInnerHTML={{ __html: ad.code }} />
      ) : (
        <div
          className={`ad-box ${type} fit-${fit}`}
          onClick={handleClick}
          role={isLink ? 'link' : undefined}
          style={isLink ? { cursor: 'pointer' } : { cursor: 'default' }}
        >
          {ad.imageUrl ? (
            <>
              {isVideo ? (
                <video className="ad-img" src={ad.imageUrl} autoPlay loop muted playsInline preload="metadata" aria-label={ad.title || 'Reklam'} />
              ) : (
                <img className="ad-img" src={ad.imageUrl} alt={ad.title || 'Reklam'} loading="lazy" />
              )}
              {(ad.title || ad.ctaText) && (
                <div className="ad-overlay">
                  {ad.title && <div className="ad-overlay-title">{ad.title}</div>}
                  {ad.ctaText && <div className="ad-overlay-cta">{ad.ctaText} →</div>}
                </div>
              )}
            </>
          ) : (
            <div className="ad-placeholder">
              {ad.title ? (
                <>
                  <div className="ad-ph-title">{ad.title}</div>
                  {ad.description && <div className="ad-ph-desc">{ad.description}</div>}
                  {ad.ctaText && <div className="ad-ph-cta">{ad.ctaText} →</div>}
                </>
              ) : (
                <>
                  <div className="ad-ph-tag">REKLAM ALANI</div>
                  <div className="ad-ph-size">{DIMS[type]}</div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
