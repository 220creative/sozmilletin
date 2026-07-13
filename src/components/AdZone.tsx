import React from 'react';
import { mockAds } from '../data/mockData';
import { ExternalLink } from 'lucide-react';

interface AdZoneProps {
  type: 'leaderboard' | 'sidebar-rect' | 'sidebar-tall' | 'native';
  className?: string;
}

export const AdZone: React.FC<AdZoneProps> = ({ type, className = '' }) => {
  // Kampanyayı tipine göre buluyoruz
  const adCampaign = mockAds.find((ad) => ad.type === type);

  if (!adCampaign) {
    // Reklam bulunamazsa şık bir boş alan tasarımı gösteriyoruz
    return (
      <div className={`ad-container ${className}`}>
        <div className="ad-label">Sponsorlu Alan</div>
        <div className={`ad-box ${type}`}>
          <div className="ad-fallback">
            <span className="ad-fallback-title">SÖZ MİLLETİN REKLAM</span>
            <span className="ad-fallback-sub">Reklam Vermek İçin Tıklayın</span>
          </div>
        </div>
      </div>
    );
  }

  const handleClick = () => {
    if (adCampaign.destinationUrl && adCampaign.destinationUrl !== '#') {
      window.open(adCampaign.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`ad-container ${className}`}>
      <div className="ad-label">Sponsorlu İçerik</div>
      
      {type === 'native' ? (
        <div className="ad-box native" onClick={handleClick}>
          {adCampaign.imageUrl && (
            <img src={adCampaign.imageUrl} alt={adCampaign.title} className="ad-native-img" />
          )}
          <div className="ad-native-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="category-badge sponsored" style={{ margin: 0, fontSize: '9px', padding: '2px 6px' }}>SPONSORLU</span>
              <h4 className="ad-native-title">{adCampaign.title}</h4>
            </div>
            <p className="ad-native-desc">{adCampaign.description}</p>
            {adCampaign.ctaText && (
              <span className="ad-native-cta">
                {adCampaign.ctaText} &rarr;
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={`ad-box ${type}`} onClick={handleClick}>
          {adCampaign.imageUrl ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img
                src={adCampaign.imageUrl}
                alt={adCampaign.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                padding: '10px',
                color: 'white',
                textAlign: 'left'
              }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: 'white' }}>{adCampaign.title}</h5>
                {adCampaign.description && (
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {adCampaign.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="ad-fallback" style={{ padding: '16px', background: 'linear-gradient(135deg, #1f2937, #111827)', color: 'white', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="ad-fallback-sub" style={{ color: 'var(--accent-gold)' }}>SPONSORLU BAĞLANTI</span>
              <span className="ad-fallback-title" style={{ fontSize: '16px', fontWeight: 800, margin: '5px 0', color: 'white' }}>{adCampaign.title}</span>
              {adCampaign.description && (
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', lineHeight: '1.4' }}>{adCampaign.description}</p>
              )}
              {adCampaign.ctaText && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                  {adCampaign.ctaText} <ExternalLink size={12} />
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
