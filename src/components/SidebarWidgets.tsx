import React, { useState, useEffect } from 'react';
import { Sun, Cloud, Moon, MapPin, Clock } from 'lucide-react';

// --- Hava Durumu Widget ---
export const WeatherWidget: React.FC = () => {
  return (
    <div className="widget-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-premium)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9, fontSize: '12px', marginBottom: '8px' }}>
            <MapPin size={14} />
            <span>Kocaeli</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>32°</div>
          <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>Açık / Güneşli</div>
        </div>
        <Sun size={48} color="white" strokeWidth={1.5} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Yarın</div>
          <Sun size={20} style={{ margin: '4px auto' }} />
          <div style={{ fontSize: '13px', fontWeight: 600 }}>34°</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Çarşamba</div>
          <Sun size={20} style={{ margin: '4px auto' }} />
          <div style={{ fontSize: '13px', fontWeight: 600 }}>31°</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Perşembe</div>
          <Cloud size={20} style={{ margin: '4px auto' }} />
          <div style={{ fontSize: '13px', fontWeight: 600 }}>29°</div>
        </div>
      </div>
    </div>
  );
};

// --- Namaz Vakitleri Widget ---
export const PrayerTimesWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const times = [
    { name: 'İmsak', time: '05:42' },
    { name: 'Güneş', time: '07:05' },
    { name: 'Öğle', time: '13:14' },
    { name: 'İkindi', time: '16:48', active: true },
    { name: 'Akşam', time: '19:12' },
    { name: 'Yatsı', time: '20:28' }
  ];

  return (
    <div className="widget-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-premium)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Moon size={18} color="var(--accent-gold)" />
          Namaz Vakitleri
        </h4>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {times.map((t, idx) => (
          <div key={idx} style={{ 
            background: t.active ? 'var(--accent-green)' : 'var(--bg-tertiary)', 
            color: t.active ? 'white' : 'var(--text-primary)',
            padding: '10px 5px', 
            borderRadius: '8px', 
            textAlign: 'center',
            transition: 'transform 0.2s',
            transform: t.active ? 'scale(1.05)' : 'none',
            boxShadow: t.active ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none'
          }}>
            <div style={{ fontSize: '11px', opacity: t.active ? 0.9 : 0.6, marginBottom: '2px' }}>{t.name}</div>
            <div style={{ fontSize: '14px', fontWeight: t.active ? 800 : 600 }}>{t.time}</div>
          </div>
        ))}
      </div>
      
      {/* Vakit sayacı */}
      <div style={{ marginTop: '15px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px', fontSize: '12px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Clock size={14} color="var(--accent-red)" />
        Akşam vaktine <strong>02:24:15</strong> kaldı
      </div>
    </div>
  );
};

// --- Puan Durumu Widget (Trendyol Süper Lig) ---
export const LeagueTableWidget: React.FC = () => {
  const tableData = [
    { pos: 1, team: 'Galatasaray', p: 34, pts: 85 },
    { pos: 2, team: 'Fenerbahçe', p: 34, pts: 82 },
    { pos: 3, team: 'Beşiktaş', p: 34, pts: 68 },
    { pos: 4, team: 'Trabzonspor', p: 34, pts: 64 },
    { pos: 5, team: 'Kocaelispor', p: 34, pts: 61, highlight: true },
    { pos: 6, team: 'Başakşehir', p: 34, pts: 55 },
  ];

  return (
    <div className="widget-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
      <div style={{ background: '#1d4ed8', color: 'white', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Trendyol Süper Lig</h4>
        <span style={{ fontSize: '11px', opacity: 0.8 }}>34. Hafta</span>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '11px', textAlign: 'left' }}>
            <th style={{ padding: '8px 15px', fontWeight: 600 }}>S</th>
            <th style={{ padding: '8px 10px', fontWeight: 600 }}>TAKIM</th>
            <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'center' }}>O</th>
            <th style={{ padding: '8px 15px', fontWeight: 600, textAlign: 'center' }}>P</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.pos} style={{ 
              borderBottom: '1px solid var(--border-color)',
              background: row.highlight ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              fontWeight: row.highlight ? 700 : 500,
              color: row.highlight ? 'var(--accent-green)' : 'var(--text-primary)'
            }}>
              <td style={{ padding: '10px 15px' }}>{row.pos}</td>
              <td style={{ padding: '10px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Kulüp Renkleri İkonu */}
                <div style={{ 
                  width: '12px', height: '12px', borderRadius: '50%', 
                  background: row.highlight ? 'linear-gradient(135deg, #008000 50%, #000000 50%)' : '#ccc' 
                }}></div>
                {row.team}
              </td>
              <td style={{ padding: '10px 10px', textAlign: 'center' }}>{row.p}</td>
              <td style={{ padding: '10px 15px', textAlign: 'center', fontWeight: 700 }}>{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <a href="#" style={{ color: '#1d4ed8', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>Tüm Fikstür ve Puan Durumu &rarr;</a>
      </div>
    </div>
  );
};
