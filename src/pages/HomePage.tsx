import React from 'react';
import { SEO } from '../components/SEO';
import { NewsCard } from '../components/NewsCard';
import { BreakingNews } from '../components/BreakingNews';
import { AdZone } from '../components/AdZone';
import { WeatherWidget, PrayerTimesWidget, LeagueTableWidget } from '../components/SidebarWidgets';
import { getSettings } from '../admin/adminStore';
import type { NewsItem } from '../data/mockData';
import { Bookmark } from 'lucide-react';

interface HomePageProps {
  newsList: NewsItem[];
  savedNewsIds: string[];
  activeCategory: string;
  showSavedOnly: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  newsList,
  savedNewsIds,
  activeCategory,
  showSavedOnly,
  searchQuery,
  setSearchQuery,
}) => {
  const breakingNews = newsList.slice(0, 4);

  const filteredNews = newsList.filter(news => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return news.title.toLowerCase().includes(query) || news.summary.toLowerCase().includes(query);
    }
    if (showSavedOnly && !savedNewsIds.includes(news.id)) return false;
    
    if (activeCategory === 'Kocaeli') {
      const qTokens = ['kocaeli', 'gebze', 'darıca', 'izmit', 'körfez', 'derince', 'çayırova', 'gölcük', 'kartepe', 'başiskele', 'kandıra', 'karamürsel', 'dilovası'];
      const textToSearch = (news.title + ' ' + news.summary + ' ' + news.author.name).toLowerCase();
      const isLocal = qTokens.some(token => textToSearch.includes(token));
      if (!isLocal) return false;
    } else if (activeCategory === 'Spor Kocaeli') {
      const isSportCategory = news.category.toLowerCase().includes('spor');
      const qTokens = ['kocaeli', 'gebze', 'darıca', 'izmit', 'körfez', 'derince', 'çayırova', 'gölcük', 'kartepe', 'başiskele', 'kandıra', 'karamürsel', 'dilovası', 'kocaelispor', 'körfez sk', 'derincespor', 'gebzespor', 'gölcükspor'];
      const textToSearch = (news.title + ' ' + news.summary + ' ' + news.author.name).toLowerCase();
      const isLocalSport = isSportCategory && qTokens.some(token => textToSearch.includes(token));
      if (!isLocalSport) return false;
    } else if (activeCategory !== 'Tümü' && news.category !== activeCategory) {
      return false;
    }
    
    return true;
  });

  const heroNews = filteredNews[0];
  const gridNews = filteredNews.slice(1);
  const trendingNews = [...newsList].sort((a, b) => b.views - a.views).slice(0, 5);

  const settings = getSettings();
  
  // SEO Başlığı Belirleme
  let pageTitle = settings.seoTitle;
  if (showSavedOnly) pageTitle = `Kaydedilen Haberler - Söz Milletin`;
  else if (searchQuery.trim() !== '') pageTitle = `"${searchQuery}" Arama Sonuçları - Söz Milletin`;
  else if (activeCategory !== 'Tümü') pageTitle = `${activeCategory} Haberleri - Söz Milletin`;

  return (
    <>
      <SEO 
        title={pageTitle}
        description={settings.seoDescription}
        image={settings.ogImage}
      />
      {settings.showBreaking && <BreakingNews newsItems={breakingNews} />}

      <main className="main-content">
        <h1 className="sr-only">Söz Milletin — Kocaeli ve Türkiye Son Dakika Haberleri</h1>
        <AdZone type="leaderboard" className="ad-leaderboard" />

        {(showSavedOnly || searchQuery.trim() !== '') && (
          <div className="section-heading" style={{ marginBottom: '30px' }}>
            <h2>{showSavedOnly ? 'Kaydedilen Haberler' : 'Arama Sonuçları'}</h2>
            {searchQuery.trim() !== '' && (
              <button onClick={() => setSearchQuery('')} className="icon-btn" style={{ marginLeft: 'auto', background: 'var(--bg-tertiary)', padding: '5px 15px', borderRadius: '4px', fontSize: '12px' }}>
                Temizle
              </button>
            )}
          </div>
        )}

        {filteredNews.length > 0 ? (
          <div className="portal-layout">
            <div className="main-column">
              {!showSavedOnly && searchQuery.trim() === '' && heroNews && (
                <NewsCard news={heroNews} variant="hero" />
              )}

              <div className="news-grid-2col">
                {gridNews.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </div>
            </div>

            <div className="sidebar-column">
              <AdZone type="sidebar-rect" />

              <div>
                <h3 className="section-heading">En Çok Okunanlar</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {trendingNews.map((news) => (
                    <NewsCard key={`trend-${news.id}`} news={news} variant="sidebar" />
                  ))}
                </div>
              </div>

              {getSettings().showWeather && <><WeatherWidget /><PrayerTimesWidget /><LeagueTableWidget /></>}

              <div style={{ position: 'sticky', top: '90px' }}>
                <h3 className="section-heading">Öne Çıkanlar</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {newsList.slice(6, 11).map((news) => (
                    <NewsCard key={`featured-${news.id}`} news={news} variant="sidebar" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
            <Bookmark size={48} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)' }}>İçerik Bulunamadı</h3>
            <p>Aradığınız kriterlere uygun haber yok.</p>
          </div>
        )}
      </main>
    </>
  );
};
