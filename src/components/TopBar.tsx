import React, { useState } from 'react';

// Üst yardımcı şerit: kurumsal bağlantılar (sol), canlı tarih (orta) ve sosyal medya (sağ).
// Profesyonel Türk haber portallarının klasik üst bandı.
const UTILITY_LINKS = ['Künye', 'Çerez Politikası', 'Gizlilik İlkeleri', 'İletişim', 'Reklam'];

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const formatToday = () => {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} ${DAYS[d.getDay()]}`;
};

// lucide-react bu sürümde marka ikonlarını içermediği için inline SVG marka logoları kullanıyoruz.
const BRAND_ICONS: Record<string, React.ReactNode> = {
  Facebook: <path d="M9.2 8.5H7.5v2.2h1.7V17h2.7v-6.3h1.9l.3-2.2h-2.2V7.3c0-.6.2-1 1.1-1h1.2V4.3c-.2 0-.9-.1-1.7-.1-1.7 0-2.9 1-2.9 2.9v1.4Z" />,
  X: <path d="M13.7 10.6 18.9 4.5h-1.7l-4.3 5-3.4-5H4.4l5.5 8-5.5 6.4h1.7l4.6-5.4 3.7 5.4h5.1l-5.8-8.3Zm-1.6 1.9-.6-.8-4.4-6.3h1.9l3.5 5 .6.8 4.5 6.5h-1.9l-3.7-5.2Z" />,
  Instagram: <path d="M12 6.9A5.1 5.1 0 1 0 12 17.1 5.1 5.1 0 0 0 12 6.9Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm5.3-8.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM8 4.2h8a3.8 3.8 0 0 1 3.8 3.8v8a3.8 3.8 0 0 1-3.8 3.8H8A3.8 3.8 0 0 1 4.2 16V8A3.8 3.8 0 0 1 8 4.2Zm0 1.7A2.1 2.1 0 0 0 5.9 8v8A2.1 2.1 0 0 0 8 18.1h8a2.1 2.1 0 0 0 2.1-2.1V8A2.1 2.1 0 0 0 16 5.9H8Z" />,
  YouTube: <path d="M20 8.4a2.1 2.1 0 0 0-1.5-1.5C17.2 6.6 12 6.6 12 6.6s-5.2 0-6.5.3A2.1 2.1 0 0 0 4 8.4 22 22 0 0 0 3.7 12 22 22 0 0 0 4 15.6a2.1 2.1 0 0 0 1.5 1.5c1.3.3 6.5.3 6.5.3s5.2 0 6.5-.3a2.1 2.1 0 0 0 1.5-1.5A22 22 0 0 0 20.3 12 22 22 0 0 0 20 8.4ZM10.4 14.4V9.6l4.2 2.4-4.2 2.4Z" />,
};

export const TopBar: React.FC = () => {
  const [today] = useState<string>(formatToday);
  const socials = ['Facebook', 'X', 'Instagram', 'YouTube'];

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-links">
          {UTILITY_LINKS.map((link) => (
            <a key={link} href="#" className="topbar-link">{link}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Türk Bayrağı */}
          <svg width="28" height="19" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '2px', flexShrink: 0 }}>
            <rect width="30" height="20" fill="#E30A17"/>
            <circle cx="11" cy="10" r="5.5" fill="white"/>
            <circle cx="12.8" cy="10" r="4.3" fill="#E30A17"/>
            <polygon points="17.5,10 20.5,8.2 19.7,11.5 22.5,13.5 19.1,13.5 17.5,16.5 15.9,13.5 12.5,13.5 15.3,11.5 14.5,8.2" fill="white" transform="translate(-2.5, -3) scale(0.85)"/>
          </svg>
          <div className="topbar-date">{today}</div>
        </div>

        <div className="topbar-socials">
          {socials.map((label) => (
            <a key={label} href="#" className="topbar-social" title={label} aria-label={label}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                {BRAND_ICONS[label]}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
