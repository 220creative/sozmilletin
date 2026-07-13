import React from 'react';
import { Clock, Eye } from 'lucide-react';
import type { NewsItem } from '../data/mockData';

interface NewsCardProps {
  news: NewsItem;
  onClick: () => void;
  className?: string;
  variant?: 'hero' | 'standard' | 'sidebar';
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onClick, className = '', variant = 'standard' }) => {

  if (variant === 'hero') {
    // Manşet: görselin üstüne binen başlık (profesyonel portal stili)
    return (
      <div className={`hero-card ${className}`} onClick={onClick}>
        <img src={news.image} alt={news.title} className="hero-card-img" loading="eager" />
        <div className="hero-card-overlay">
          <span className="hero-kicker">{news.category}</span>
          <h2 className="hero-card-title">{news.title}</h2>
          <p className="hero-card-summary">{news.summary}</p>
          <div className="hero-card-meta">
            <span style={{ fontWeight: 700 }}>{news.author.name}</span>
            <span className="dot">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {news.readTime}</span>
            <span className="dot">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {news.views.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`sidebar-list-item ${className}`} onClick={onClick}>
        <img src={news.image} alt={news.title} className="sidebar-list-img" />
        <div className="sidebar-list-content">
          <div>
            <span className="category-tag" style={{ fontSize: '9px', padding: '2px 6px', marginBottom: '6px' }}>
              {news.category}
            </span>
            <h4 className="sidebar-list-title">{news.title}</h4>
          </div>
          <div className="classic-card-meta" style={{ fontSize: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {news.readTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`classic-card ${className}`} onClick={onClick}>
      <div className="classic-card-img-wrapper">
        <img src={news.image} alt={news.title} className="classic-card-img" />
      </div>
      <div className="classic-card-content">
        <span className="category-tag">{news.category}</span>
        <h3 className="classic-card-title">{news.title}</h3>
        <p className="classic-card-desc">{news.summary}</p>
        
        <div className="classic-card-meta">
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{news.author.name}</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {news.readTime}</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {news.views.toLocaleString('tr-TR')}</span>
        </div>
      </div>
    </div>
  );
};
