import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
  variant?: 'full' | 'compact' | 'header';
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full', light = false }) => {
  const redColor = '#e30613';
  const textColor = light ? '#ffffff' : 'var(--text-primary)';
  const mutedColor = light ? '#94a3b8' : 'var(--text-muted)';

  if (variant === 'header') {
    // Navigasyon çubuğu için kompakt tipografik logo
    return (
      <div className={`logo-header-compact ${className}`} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
      }}>
        {/* Sol kırmızı dikey çizgi aksan */}
        <div style={{
          width: '4px',
          height: '28px',
          backgroundColor: redColor,
          borderRadius: '2px',
          flexShrink: 0,
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: '17px',
            letterSpacing: '-0.5px',
            color: textColor,
            textTransform: 'uppercase',
          }}>
            SÖZ<span style={{ color: redColor }}>.</span>MİLLETİN
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '8.5px',
            letterSpacing: '2px',
            color: mutedColor,
            textTransform: 'uppercase',
          }}>
            MEDYA HABER
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    // Grid/footer için kısa metin logosu
    return (
      <div className={`logo-compact ${className}`} style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 900,
        fontSize: '22px',
        textTransform: 'uppercase',
        color: textColor,
        letterSpacing: '-0.5px',
        cursor: 'pointer',
      }}>
        SÖZ<span style={{ color: redColor }}>.</span>MİLLETİN
      </div>
    );
  }

  // === FULL – Ana Sayfa Manşet Logosu ===
  // Büyük, premium gazete başlığı stili (NYT / BBC tarzı)
  return (
    <div className={`logo-full ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      gap: '6px',
    }}>
      {/* Üst dekoratif çizgi + tarih bandı */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        justifyContent: 'center',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', maxWidth: '120px' }} />
        <span style={{
          fontSize: '10px',
          letterSpacing: '3px',
          color: mutedColor,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          textTransform: 'uppercase',
        }}>
          Bağımsız · Tarafsız · Güvenilir
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', maxWidth: '120px' }} />
      </div>

      {/* Ana Logo Metni */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px' }}>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(44px, 8vw, 72px)',
          letterSpacing: '-3px',
          color: textColor,
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          SÖZ
        </span>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(44px, 8vw, 72px)',
          letterSpacing: '-3px',
          color: redColor,
          lineHeight: 1,
        }}>
          .
        </span>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 300,
          fontSize: 'clamp(44px, 8vw, 72px)',
          letterSpacing: '-2px',
          color: textColor,
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          MİLLETİN
        </span>
      </div>

      {/* Alt etiket */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '30px', height: '1px', background: redColor }} />
        <span style={{
          fontSize: '10px',
          letterSpacing: '4px',
          color: mutedColor,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          MEDYA HABER
        </span>
        <div style={{ width: '30px', height: '1px', background: redColor }} />
      </div>
    </div>
  );
};
