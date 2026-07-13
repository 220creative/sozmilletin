import React from 'react';
import { getAds } from '../admin/adminStore';

interface AdZoneProps {
  type: 'leaderboard' | 'sidebar-rect' | 'sidebar-tall' | 'native';
  className?: string;
}

export const AdZone: React.FC<AdZoneProps> = ({ type, className = '' }) => {
  const adCampaign = getAds().find((ad) => ad.type === type);

  // Reklam boyutları
  let dims = { w: '', h: '' };
  if (type === 'leaderboard') dims = { w: '728', h: '90' };
  else if (type === 'sidebar-rect') dims = { w: '300', h: '250' };
  else if (type === 'sidebar-tall') dims = { w: '300', h: '600' };

  const handleClick = () => {
    if (adCampaign && adCampaign.destinationUrl && adCampaign.destinationUrl !== '#') {
      window.open(adCampaign.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`ad-container ${className}`} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: type === 'leaderboard' ? '24px' : '0' }}>
      <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Sponsorlu Reklam
      </span>
      
      <div 
        className={`ad-box ${type}`} 
        onClick={handleClick}
        style={{
          width: '100%',
          height: type === 'leaderboard' ? '90px' : type === 'sidebar-rect' ? '250px' : type === 'sidebar-tall' ? '600px' : 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        {adCampaign && adCampaign.imageUrl ? (
          <img
            src={adCampaign.imageUrl}
            alt={adCampaign.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', opacity: 0.4 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px' }}>REKLAM ALANI</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>{dims.w} × {dims.h}</div>
          </div>
        )}
      </div>
    </div>
  );
};
