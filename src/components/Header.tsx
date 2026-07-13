import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { CATEGORIES } from '../data/mockData';
import { Sun, Moon, Search, Bookmark } from 'lucide-react';

interface HeaderProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  savedCount: number;
  showSavedOnly: boolean;
  setShowSavedOnly: (show: boolean) => void;
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  setActiveCategory,
  savedCount,
  showSavedOnly,
  setShowSavedOnly,
  onSearchOpen,
}) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="header-wrapper">
      <div className="header-container">
        
        {/* Sol: Logo */}
        <div 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
          onClick={() => { setActiveCategory('Tümü'); setShowSavedOnly(false); }}
        >
          <Logo variant="compact" />
        </div>

        {/* Orta: Kategoriler */}
        <ul className="nav-links">
          {CATEGORIES.map(category => (
            <li key={category}>
              <button
                className={`nav-link ${activeCategory === category && !showSavedOnly ? 'active' : ''}`}
                onClick={() => { setActiveCategory(category); setShowSavedOnly(false); }}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>

        {/* Sağ: Arama, Kaydetme ve Karanlık Mod */}
        <div className="header-actions">
          <button className="icon-btn" onClick={onSearchOpen} title="Haber Ara">
            <Search size={18} />
          </button>
          
          <button
            className={`icon-btn ${showSavedOnly ? 'active' : ''}`}
            onClick={() => { setShowSavedOnly(!showSavedOnly); }}
            title="Kaydedilenler"
            style={{ position: 'relative', color: showSavedOnly ? 'var(--accent-red)' : 'var(--text-secondary)' }}
          >
            <Bookmark size={18} fill={showSavedOnly ? 'var(--accent-red)' : 'none'} />
            {savedCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                backgroundColor: 'var(--accent-red)', color: 'white',
                fontSize: '9px', fontWeight: 'bold', borderRadius: '50%',
                width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {savedCount}
              </span>
            )}
          </button>

          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
};
