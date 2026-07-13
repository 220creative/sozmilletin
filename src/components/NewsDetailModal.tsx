import React, { useState, useEffect } from 'react';
import type { NewsItem, Comment } from '../data/mockData';
import { X, Bookmark, Send, Heart, Flame, ThumbsUp, Frown, MessageSquare, Clock, Eye, Share2 } from 'lucide-react';

interface NewsDetailModalProps {
  news: NewsItem;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

// Habere özel kullanıcı yorumlarını localStorage'da saklamak için anahtar üretici
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

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  news,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  // Habere ait varsayılan (RSS/mock) yorumların üstüne, kullanıcının daha önce
  // eklediği ve localStorage'da saklanan yorumları getiriyoruz.
  const [comments, setComments] = useState<Comment[]>(() => [
    ...loadStoredComments(news.id),
    ...(news.comments || []),
  ]);
  const [commentUser, setCommentUser] = useState<string>('');
  const [commentContent, setCommentContent] = useState<string>('');
  const [selectedReaction, setSelectedReaction] = useState<string | null>(() => {
    try {
      return localStorage.getItem(reactionKey(news.id));
    } catch {
      return null;
    }
  });
  const [reactionCounts, setReactionCounts] = useState(() => {
    // Kullanıcının önceki tepkisi varsa sayaca yansıtılmış halde başlat.
    const base = { ...news.reactions };
    try {
      const prev = localStorage.getItem(reactionKey(news.id));
      if (prev && prev in base) base[prev as keyof typeof base] += 1;
    } catch {
      // yok say
    }
    return base;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

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
    // Sadece kullanıcının eklediği yorumları kalıcı olarak sakla (varsayılanlar hariç).
    try {
      const stored = [newComment, ...loadStoredComments(news.id)];
      localStorage.setItem(commentsKey(news.id), JSON.stringify(stored));
    } catch {
      // localStorage kullanılamıyorsa sessizce geç
    }
    setCommentUser('');
    setCommentContent('');
  };

  const persistReaction = (value: string | null) => {
    try {
      if (value) localStorage.setItem(reactionKey(news.id), value);
      else localStorage.removeItem(reactionKey(news.id));
    } catch {
      // yok say
    }
  };

  const handleReactionClick = (type: 'like' | 'heart' | 'sad' | 'fire') => {
    if (selectedReaction === type) {
      setSelectedReaction(null);
      setReactionCounts(prev => ({ ...prev, [type]: prev[type] - 1 }));
      persistReaction(null);
    } else {
      setReactionCounts(prev => {
        const next = { ...prev, [type]: prev[type] + 1 };
        if (selectedReaction) {
          next[selectedReaction as keyof typeof next] -= 1;
        }
        return next;
      });
      setSelectedReaction(type);
      persistReaction(type);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="classic-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Kapat (ESC)">
          <X size={20} />
        </button>

        <div style={{ padding: '48px 32px 32px', maxWidth: '720px', margin: '0 auto' }}>
          
          {/* Kategori Rozeti */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span className="category-tag" style={{ marginBottom: 0 }}>
              {news.category}
            </span>
          </div>

          {/* Başlık */}
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: 'clamp(28px, 4vw, 38px)', 
            fontWeight: 900, 
            lineHeight: 1.2, 
            color: 'var(--text-primary)', 
            textAlign: 'center',
            marginBottom: '20px',
            letterSpacing: '-0.8px'
          }}>
            {news.title}
          </h1>

          {/* Özet */}
          <p style={{ 
            fontSize: '17px', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6, 
            textAlign: 'center',
            marginBottom: '24px',
            fontWeight: 500
          }}>
            {news.summary}
          </p>

          {/* Meta Bilgileri */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px', 
            fontSize: '12px', 
            color: 'var(--text-muted)',
            marginBottom: '32px',
            fontWeight: 600
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {news.readTime}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={13} /> {news.views.toLocaleString('tr-TR')} Görüntülenme</span>
          </div>

          {/* Yazar Bilgisi ve İşlem Butonları */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 0', 
            borderTop: '1px solid var(--border-color)', 
            borderBottom: '1px solid var(--border-color)', 
            marginBottom: '32px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={news.author.avatar} alt={news.author.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{news.author.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{news.date}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="icon-btn" title="Paylaş">
                <Share2 size={16} />
              </button>
              <button 
                onClick={onToggleSave}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--border-radius-tag)', 
                  background: isSaved ? 'var(--text-primary)' : 'transparent', 
                  color: isSaved ? 'var(--bg-secondary)' : 'var(--text-primary)', 
                  border: `1px solid ${isSaved ? 'var(--text-primary)' : 'var(--border-strong)'}`,
                  cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'var(--transition-smooth)'
                }}
              >
                <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Kaydedildi' : 'Kaydet'}
              </button>
            </div>
          </div>

          {/* Ana Görsel */}
          <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
            <img src={news.image} alt={news.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          {/* İçerik Metni */}
          <div style={{ 
            fontSize: '17px', 
            lineHeight: 1.8, 
            color: 'var(--text-secondary)', 
            fontFamily: 'var(--font-body)', 
            paddingBottom: '32px', 
            borderBottom: '1px solid var(--border-color)' 
          }}>
            {news.content.map((paragraph, index) => (
              <p key={index} style={{ marginBottom: '20px' }}>{paragraph}</p>
            ))}
          </div>

          {/* Tepki Paneli */}
          <div style={{ marginTop: '32px', marginBottom: '48px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'center', letterSpacing: '0.5px' }}>
              BU HABERE TEPKİNİZ
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { id: 'like', icon: ThumbsUp, count: reactionCounts.like, color: 'var(--accent-blue)', bg: 'rgba(2, 132, 199, 0.08)' },
                { id: 'heart', icon: Heart, count: reactionCounts.heart, color: 'var(--accent-red)', bg: 'rgba(185, 28, 28, 0.08)' },
                { id: 'sad', icon: Frown, count: reactionCounts.sad, color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)' },
                { id: 'fire', icon: Flame, count: reactionCounts.fire, color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' }
              ].map((reaction) => {
                const Icon = reaction.icon;
                const isSelected = selectedReaction === reaction.id;
                return (
                  <button
                    key={reaction.id}
                    onClick={() => handleReactionClick(reaction.id as any)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '30px',
                      background: isSelected ? reaction.color : 'var(--bg-primary)',
                      color: isSelected ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                      border: `1px solid ${isSelected ? reaction.color : 'var(--border-color)'}`,
                      cursor: 'pointer', transition: 'var(--transition-smooth)', fontWeight: 700, fontSize: '13px'
                    }}
                  >
                    <Icon size={14} fill={isSelected ? 'currentColor' : 'none'} />
                    <span>{reaction.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Yorumlar Bölümü */}
          <div>
            <h3 className="section-heading" style={{ fontSize: '18px' }}>
              Yorumlar ({comments.length})
            </h3>

            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '32px', background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <input
                type="text"
                placeholder="İsim veya rumuz"
                value={commentUser}
                onChange={(e) => setCommentUser(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-tag)', 
                  color: 'var(--text-primary)', marginBottom: '12px', outline: 'none', 
                  fontFamily: 'var(--font-body)', fontSize: '14px' 
                }}
                required
              />
              <textarea
                placeholder="Haber hakkındaki düşünceleriniz..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-tag)', 
                  color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical', 
                  marginBottom: '12px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' 
                }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--text-primary)', color: 'var(--bg-secondary)', border: 'none', padding: '8px 18px', borderRadius: 'var(--border-radius-tag)', fontWeight: 700, cursor: 'pointer', transition: 'var(--transition-smooth)', fontSize: '13px' }}>
                  <Send size={14} /> Gönder
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{comment.user}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{comment.date}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>{comment.content}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px' }}>Bu habere henüz yorum yapılmamış.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
