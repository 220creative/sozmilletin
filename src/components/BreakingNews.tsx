import React, { useState, useEffect } from 'react';
import type { NewsItem } from '../data/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface BreakingNewsProps {
  newsItems: NewsItem[];
  onNewsClick: (news: NewsItem) => void;
}

export const BreakingNews: React.FC<BreakingNewsProps> = ({ newsItems, onNewsClick }) => {
  const [index, setIndex] = useState(0);

  // 5 saniyede bir sonraki son dakika haberine geç (otomatik döngü)
  useEffect(() => {
    if (newsItems.length === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(t);
  }, [newsItems.length]);

  if (newsItems.length === 0) return null;

  const current = newsItems[index % newsItems.length];
  const prev = () => setIndex((i) => (i - 1 + newsItems.length) % newsItems.length);
  const next = () => setIndex((i) => (i + 1) % newsItems.length);
  const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="breaking-bar">
      <div className="breaking-bar-inner">
        <div className="breaking-label">
          <Zap size={14} fill="currentColor" />
          SON DAKİKA
        </div>

        <div className="breaking-nav">
          <button onClick={prev} className="breaking-arrow" aria-label="Önceki">
            <ChevronLeft size={16} />
          </button>
          <button onClick={next} className="breaking-arrow" aria-label="Sonraki">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="breaking-content" onClick={() => onNewsClick(current)}>
          <span className="breaking-time">{time}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={current.id}
              className="breaking-headline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {current.title}
            </motion.span>
          </AnimatePresence>
        </div>

        <button className="breaking-all">Tümü</button>
      </div>
    </div>
  );
};
