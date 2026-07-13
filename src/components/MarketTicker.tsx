import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

// Döviz / borsa şeridi — Türk haber portallarının imza öğesi.
// Değerler gerçekçi başlangıç seviyeleriyle küçük bir rastgele yürüyüşle canlı hissettirilir
// (backend olmadığı için simülasyon; ileride bir API'ye bağlanabilir).
interface Market {
  label: string;
  value: number;
  prev: number;
  decimals: number;
  prefix?: string;
}

const INITIAL: Market[] = [
  { label: 'DOLAR', value: 47.02, prev: 47.02, decimals: 2, prefix: '₺' },
  { label: 'EURO', value: 53.68, prev: 53.68, decimals: 2, prefix: '₺' },
  { label: 'ALTIN', value: 6126.9, prev: 6126.9, decimals: 1, prefix: '₺' },
  { label: 'BIST 100', value: 14321.19, prev: 14321.19, decimals: 2 },
  { label: 'BITCOIN', value: 62722, prev: 62722, decimals: 0, prefix: '$' },
];

const formatValue = (m: Market) =>
  (m.prefix ?? '') +
  m.value.toLocaleString('tr-TR', {
    minimumFractionDigits: m.decimals,
    maximumFractionDigits: m.decimals,
  });

export const MarketTicker: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>(INITIAL);
  const [time, setTime] = useState<string>(() =>
    new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Canlı saat
  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Kurlarda hafif dalgalanma (±%0.15) — canlı piyasa hissi
  useEffect(() => {
    const t = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const drift = m.value * (Math.random() - 0.5) * 0.003;
          const next = Math.max(0, m.value + drift);
          return { ...m, prev: m.value, value: parseFloat(next.toFixed(m.decimals)) };
        })
      );
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="market-ticker">
      <div className="market-ticker-inner">
        <div className="market-clock">
          <Clock size={13} />
          <span>{time}</span>
        </div>

        <div className="market-list">
          {markets.map((m) => {
            const up = m.value >= m.prev;
            return (
              <div key={m.label} className="market-item">
                <span className="market-label">{m.label}</span>
                <span className={`market-value ${up ? 'up' : 'down'}`}>
                  {formatValue(m)}
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
