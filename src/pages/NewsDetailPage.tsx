import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { NewsItem, Comment } from '../data/mockData';
import { NewsCard } from '../components/NewsCard';
import { AdZone } from '../components/AdZone';
import { SEO } from '../components/SEO';
import {
  ChevronLeft, Bookmark, Send, Heart, Flame, ThumbsUp, Frown,
  MessageSquare, Clock, Eye, Share2, Calendar
} from 'lucide-react';

const PLACEHOLDER = '/haber-placeholder.svg';

interface NewsDetailPageProps {
  newsList: NewsItem[];
  savedNewsIds: string[];
  onToggleSave: (id: string) => void;
  onView: (id: string) => void;
}

const commentsKey = (id: string) => `comments_${id}`;
const reactionKey = (id: string) => `reaction_${id}`;

const loadStoredComments = (id: string): Comment[] => {
  try {
    const raw = localStorage.getItem(commentsKey(id));
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
};

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ newsList, savedNewsIds, onToggleSave, onView }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const news = newsList.find(n => n.id === id);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUser, setCommentUser] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState({ like: 0, heart: 0, sad: 0, fire: 0 });

  // Haber değişince: en üste kaydır, görüntülenmeyi artır, yorum/tepkileri yükle
  useEffect(() => {
    if (!id || !news) return;
    window.scrollTo(0, 0);
    onView(id);

    setComments([...loadStoredComments(id), ...(news.comments || [])]);
    let prevReaction: string | null = null;
    try { prevReaction = localStorage.getItem(reactionKey(id)); } catch { /* yok say */ }
    setSelectedReaction(prevReaction);
    const base = { ...news.reactions };
    if (prevReaction && prevReaction in base) base[prevReaction as keyof typeof base] += 1;
    setReactionCounts(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!news) {
    return (
      <main className="main-content" style={{ textAlign: 'center', padding: '120px 20px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '12px' }}>Haber bulunamadı</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Aradığınız haber kaldırılmış ya da bağlantı hatalı olabilir.</p>
        <Link to="/" className="back-btn"><ChevronLeft size={16} /> Ana sayfaya dön</Link>
      </main>
    );
  }

  const isSaved = savedNewsIds.includes(news.id);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentUser.trim() || !commentContent.trim()) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      user: commentUser.trim(),
      content: commentContent.trim(),
      date: 'Az önce',
    };
    setComments([newComment, ...comments]);
    try {
      localStorage.setItem(commentsKey(news.id), JSON.stringify([newComment, ...loadStoredComments(news.id)]));
    } catch { /* yok say */ }
    setCommentUser('');
    setCommentContent('');
  };

  const persistReaction = (value: string | null) => {
    try {
      if (value) localStorage.setItem(reactionKey(news.id), value);
      else localStorage.removeItem(reactionKey(news.id));
    } catch { /* yok say */ }
  };

  const handleReactionClick = (type: 'like' | 'heart' | 'sad' | 'fire') => {
    if (selectedReaction === type) {
      setSelectedReaction(null);
      setReactionCounts(prev => ({ ...prev, [type]: prev[type] - 1 }));
      persistReaction(null);
    } else {
      setReactionCounts(prev => {
        const next = { ...prev, [type]: prev[type] + 1 };
        if (selectedReaction) next[selectedReaction as keyof typeof next] -= 1;
        return next;
      });
      setSelectedReaction(type);
      persistReaction(type);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: news.title, url });
      else { await navigator.clipboard.writeText(url); alert('Bağlantı kopyalandı'); }
    } catch { /* iptal edildi */ }
  };

  const related = newsList.filter(n => n.category === news.category && n.id !== news.id).slice(0, 4);
  const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!e.currentTarget.src.endsWith(PLACEHOLDER)) e.currentTarget.src = PLACEHOLDER;
  };

  return (
    <>
      <SEO 
        title={news.seoTitle?.trim() || `${news.title} — SÖZ MİLLETİN`}
        description={news.seoDescription?.trim() || news.summary}
        image={news.image}
        type="article"
        url={`https://sozmilletin.com/haber/${news.id}`}
        articleData={{
          publishedTime: new Date(news.timestamp || Date.now()).toISOString(),
          authorName: news.author.name,
          section: news.category,
        }}
      />
      <main className="main-content article-page">
        <button onClick={() => navigate(-1)} className="back-btn"><ChevronLeft size={16} /> Geri</button>

      <div className="article-layout">
        <article className="article-body">
          <span className="category-tag" style={{ marginBottom: '16px' }}>{news.category}</span>
          <h1 className="article-title">{news.title}</h1>
          <p className="article-summary">{news.summary}</p>

          <div className="article-meta">
            <span className="article-author">{news.author.name}</span>
            <span className="dot">•</span>
            <span><Calendar size={13} /> {news.date}</span>
            <span className="dot">•</span>
            <span><Clock size={13} /> {news.readTime}</span>
            <span className="dot">•</span>
            <span><Eye size={13} /> {news.views.toLocaleString('tr-TR')}</span>
            <div className="article-actions">
              <button className="icon-btn" title="Paylaş" onClick={handleShare}><Share2 size={16} /></button>
              <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={() => onToggleSave(news.id)}>
                <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Kaydedildi' : 'Kaydet'}
              </button>
            </div>
          </div>

          <div className="article-hero">
            <img src={news.image} alt={news.title} onError={imgFallback} loading="eager" />
          </div>

          <div className="article-content">
            {news.content.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {news.link && (
            <a href={news.link} target="_blank" rel="noopener noreferrer" className="source-link">
              Haberin kaynağına git →
            </a>
          )}

          {/* Tepkiler */}
          <div className="reactions">
            <h3 className="reactions-title">BU HABERE TEPKİNİZ</h3>
            <div className="reactions-row">
              {[
                { id: 'like', icon: ThumbsUp, count: reactionCounts.like, color: 'var(--accent-blue)' },
                { id: 'heart', icon: Heart, count: reactionCounts.heart, color: 'var(--accent-red)' },
                { id: 'sad', icon: Frown, count: reactionCounts.sad, color: '#eab308' },
                { id: 'fire', icon: Flame, count: reactionCounts.fire, color: '#f97316' },
              ].map((r) => {
                const Icon = r.icon;
                const active = selectedReaction === r.id;
                return (
                  <button key={r.id} onClick={() => handleReactionClick(r.id as 'like' | 'heart' | 'sad' | 'fire')}
                    className="reaction-btn" style={active ? { background: r.color, color: '#fff', borderColor: r.color } : undefined}>
                    <Icon size={15} fill={active ? 'currentColor' : 'none'} /><span>{r.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Yorumlar */}
          <div className="comments">
            <h3 className="section-heading" style={{ fontSize: '18px' }}>Yorumlar ({comments.length})</h3>
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input type="text" placeholder="İsim veya rumuz" value={commentUser} onChange={(e) => setCommentUser(e.target.value)} required />
              <textarea placeholder="Haber hakkındaki düşünceleriniz..." value={commentContent} onChange={(e) => setCommentContent(e.target.value)} required />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="comment-submit"><Send size={14} /> Gönder</button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {comments.length > 0 ? comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-head">
                    <span className="comment-user">{c.user}</span>
                    <span className="comment-date">{c.date}</span>
                  </div>
                  <p className="comment-text">{c.content}</p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px' }}>Bu habere henüz yorum yapılmamış.</p>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Yan sütun: ilgili haberler + reklam */}
        <aside className="article-sidebar">
          <AdZone type="sidebar-rect" page="article" />
          {related.length > 0 && (
            <div>
              <h3 className="section-heading">İlgili Haberler</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {related.map(n => (
                  <NewsCard key={`rel-${n.id}`} news={n} variant="sidebar" onClick={() => { onView(n.id); navigate(`/haber/${n.id}`); }} />
                ))}
              </div>
            </div>
          )}
          <AdZone type="sidebar-tall" className="ad-sticky" page="article" />
        </aside>
      </div>
    </main>
    </>
  );
};
