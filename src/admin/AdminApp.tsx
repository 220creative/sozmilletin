import React, { useState } from 'react';
import type { NewsItem, AdCampaign } from '../data/mockData';
import { mockNews } from '../data/mockData';
import scrapedNewsData from '../data/scrapedNews.json';
import * as store from './adminStore';
import {
  Lock, LogOut, Plus, Search, Pencil, Trash2, Eye, EyeOff, Star,
  Pin, Newspaper, Megaphone, Settings, ArrowLeft, Save, Home
} from 'lucide-react';

const BASE_NEWS: NewsItem[] = (scrapedNewsData && (scrapedNewsData as NewsItem[]).length > 0)
  ? (scrapedNewsData as NewsItem[])
  : mockNews;

type View = 'list' | 'form' | 'ads' | 'settings';

/* ---------------- Giriş ekranı ---------------- */
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.login(pw)) onLogin();
    else { setErr(true); setPw(''); }
  };
  return (
    <div className="admin-login">
      <form className="admin-login-box" onSubmit={submit}>
        <div className="admin-login-icon"><Lock size={26} /></div>
        <h1>Yönetim Paneli</h1>
        <p className="admin-muted">SÖZ MİLLETİN — İçerik Yönetimi</p>
        <input
          type="password" autoFocus placeholder="Parola"
          value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }}
          className={err ? 'admin-input err' : 'admin-input'}
        />
        {err && <div className="admin-err-text">Parola hatalı.</div>}
        <button type="submit" className="admin-btn-primary">Giriş Yap</button>
        <p className="admin-hint">Varsayılan parola: <b>sozmilletin2026</b> (Ayarlar'dan değiştirebilirsiniz)</p>
      </form>
    </div>
  );
};

/* ---------------- Haber formu (yeni / düzenle) ---------------- */
const NewsForm: React.FC<{ editing: NewsItem | null; onDone: () => void; onCancel: () => void }> = ({ editing, onDone, onCancel }) => {
  const isBase = editing ? !store.isManual(editing.id) && !editing.id.startsWith('manual-') : false;
  const [title, setTitle] = useState(editing?.title || '');
  const [summary, setSummary] = useState(editing?.summary || '');
  const [body, setBody] = useState((editing?.content || []).join('\n\n'));
  const [category, setCategory] = useState(editing?.category || 'Gündem');
  const [image, setImage] = useState(editing?.image && editing.image !== '/haber-placeholder.svg' ? editing.image : '');
  const [author, setAuthor] = useState(editing?.author?.name || 'Söz Milletin');
  const [isBreaking, setIsBreaking] = useState(!!editing?.isBreaking);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const content = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    if (editing && isBase) {
      // Otomatik habere düzenleme katmanı uygula
      store.setEdit(editing.id, {
        title: title.trim(), summary: summary.trim() || content[0],
        content, category, image: image.trim() || editing.image,
        author: { name: author.trim() || editing.author.name, avatar: editing.author.avatar },
        isBreaking,
      });
    } else {
      // Manuel haber ekle/güncelle
      const item = store.makeNewsItem({
        id: editing?.id, title, summary, content, category, image, author, isBreaking,
        date: editing?.date,
      });
      store.upsertManualNews(item);
    }
    onDone();
  };

  return (
    <form className="admin-form" onSubmit={save}>
      <div className="admin-form-head">
        <button type="button" className="admin-btn-ghost" onClick={onCancel}><ArrowLeft size={16} /> Geri</button>
        <h2>{editing ? 'Haberi Düzenle' : 'Yeni Haber'}</h2>
      </div>

      <label className="admin-label">Başlık *</label>
      <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Haber başlığı" />

      <label className="admin-label">Özet (kısa)</label>
      <textarea className="admin-input" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Boş bırakılırsa ilk paragraf kullanılır" />

      <label className="admin-label">İçerik * <span className="admin-muted">(paragrafları boş satırla ayırın)</span></label>
      <textarea className="admin-input" rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder={'Birinci paragraf...\n\nİkinci paragraf...'} />

      <div className="admin-form-row">
        <div style={{ flex: 1 }}>
          <label className="admin-label">Kategori</label>
          <select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {store.MANUAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="admin-label">Yazar / Kaynak</label>
          <input className="admin-input" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
      </div>

      <label className="admin-label">Görsel URL (boşsa markalı yer tutucu)</label>
      <input className="admin-input" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
      {image.trim() && <img src={image} alt="önizleme" className="admin-img-preview" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />}

      <label className="admin-check">
        <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} />
        Son dakika olarak işaretle
      </label>

      <div className="admin-form-actions">
        <button type="button" className="admin-btn-ghost" onClick={onCancel}>Vazgeç</button>
        <button type="submit" className="admin-btn-primary"><Save size={16} /> Kaydet</button>
      </div>
    </form>
  );
};

/* ---------------- Reklam yönetimi ---------------- */
const AdsManager: React.FC = () => {
  const [ads, setAds] = useState<AdCampaign[]>(() => store.getAds().map(a => ({ ...a })));
  const [saved, setSaved] = useState(false);
  const update = (i: number, patch: Partial<AdCampaign>) => {
    setAds(prev => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
    setSaved(false);
  };
  const persist = () => { store.saveAds(ads); setSaved(true); };
  return (
    <div className="admin-ads">
      <div className="admin-section-head">
        <h2>Reklam Yönetimi</h2>
        <button className="admin-btn-primary" onClick={persist}><Save size={16} /> Kaydet</button>
      </div>
      {saved && <div className="admin-ok">Reklamlar kaydedildi. Siteyi yenileyince görünür.</div>}
      {ads.map((ad, i) => (
        <div key={ad.id} className="admin-ad-card">
          <div className="admin-ad-type">{ad.type}</div>
          <label className="admin-label">Başlık</label>
          <input className="admin-input" value={ad.title} onChange={(e) => update(i, { title: e.target.value })} />
          <label className="admin-label">Açıklama</label>
          <input className="admin-input" value={ad.description || ''} onChange={(e) => update(i, { description: e.target.value })} />
          <div className="admin-form-row">
            <div style={{ flex: 1 }}>
              <label className="admin-label">Görsel URL</label>
              <input className="admin-input" value={ad.imageUrl || ''} onChange={(e) => update(i, { imageUrl: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="admin-label">Hedef Link</label>
              <input className="admin-input" value={ad.destinationUrl} onChange={(e) => update(i, { destinationUrl: e.target.value })} />
            </div>
          </div>
          <label className="admin-label">Buton Metni</label>
          <input className="admin-input" value={ad.ctaText || ''} onChange={(e) => update(i, { ctaText: e.target.value })} />
        </div>
      ))}
    </div>
  );
};

/* ---------------- Ayarlar ---------------- */
const SettingsPanel: React.FC = () => {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <div className="admin-settings">
      <h2>Ayarlar</h2>
      <div className="admin-ad-card">
        <label className="admin-label">Yeni Parola</label>
        <input className="admin-input" type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Yeni parola" />
        <button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={() => { store.setPassword(pw); setPw(''); setMsg('Parola güncellendi.'); }}>Parolayı Değiştir</button>
        {msg && <div className="admin-ok" style={{ marginTop: 10 }}>{msg}</div>}
      </div>
      <div className="admin-ad-card">
        <h3 style={{ marginBottom: 8 }}>Tehlikeli Bölge</h3>
        <p className="admin-muted" style={{ marginBottom: 12 }}>Tüm elle eklenen haberleri, düzenlemeleri, gizlemeleri ve reklam değişikliklerini siler.</p>
        <button className="admin-btn-danger" onClick={() => { if (confirm('Tüm admin verileri silinsin mi?')) { store.resetAll(); location.reload(); } }}>
          <Trash2 size={16} /> Tüm Admin Verilerini Sıfırla
        </button>
      </div>
    </div>
  );
};

/* ---------------- Ana panel ---------------- */
export const AdminApp: React.FC = () => {
  const [authed, setAuthed] = useState(store.isAuthed());
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [query, setQuery] = useState('');
  const [, force] = useState(0);
  const refresh = () => force(x => x + 1);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const merged = store.getMergedNews(BASE_NEWS);
  const heroId = store.getHeroId();
  const filtered = query.trim()
    ? merged.filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
    : merged;
  const visible = filtered.slice(0, 60);

  const openNew = () => { setEditing(null); setView('form'); };
  const openEdit = (n: NewsItem) => { setEditing(n); setView('form'); };
  const afterForm = () => { setView('list'); refresh(); };

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">SÖZ<span>.</span>MİLLETİN</div>
        <div className="admin-logo-sub">YÖNETİM</div>
        <nav>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Newspaper size={17} /> Haberler</button>
          <button onClick={openNew}><Plus size={17} /> Yeni Haber</button>
          <button className={view === 'ads' ? 'active' : ''} onClick={() => setView('ads')}><Megaphone size={17} /> Reklamlar</button>
          <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}><Settings size={17} /> Ayarlar</button>
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" className="admin-side-link"><Home size={16} /> Siteyi Gör</a>
          <button className="admin-side-link" onClick={() => { store.logout(); setAuthed(false); }}><LogOut size={16} /> Çıkış</button>
        </div>
      </aside>

      <main className="admin-main">
        {view === 'list' && (
          <>
            <div className="admin-section-head">
              <h2>Haberler <span className="admin-count">{merged.length}</span></h2>
              <button className="admin-btn-primary" onClick={openNew}><Plus size={16} /> Yeni Haber</button>
            </div>
            <div className="admin-search">
              <Search size={16} />
              <input placeholder="Başlıkta ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            <div className="admin-news-list">
              {visible.map(n => {
                const manual = n.id.startsWith('manual-') || store.isManual(n.id);
                const hidden = store.isHidden(n.id);
                const pinned = store.isPinned(n.id);
                const isHero = heroId === n.id;
                return (
                  <div key={n.id} className={`admin-news-row ${hidden ? 'is-hidden' : ''}`}>
                    <img src={n.image} alt="" className="admin-news-thumb" onError={(e) => (e.currentTarget.src = '/haber-placeholder.svg')} />
                    <div className="admin-news-info">
                      <div className="admin-news-title">{n.title}</div>
                      <div className="admin-news-badges">
                        <span className="badge cat">{n.category}</span>
                        {manual ? <span className="badge manual">Manuel</span> : <span className="badge auto">Otomatik</span>}
                        {isHero && <span className="badge hero">Manşet</span>}
                        {pinned && <span className="badge pin">Öne Çıkan</span>}
                        {hidden && <span className="badge hidden">Gizli</span>}
                      </div>
                    </div>
                    <div className="admin-news-actions">
                      <button title="Düzenle" onClick={() => openEdit(n)}><Pencil size={15} /></button>
                      <button title="Manşet yap" className={isHero ? 'on' : ''} onClick={() => { store.setHeroId(isHero ? null : n.id); refresh(); }}><Star size={15} /></button>
                      <button title="Öne çıkar" className={pinned ? 'on' : ''} onClick={() => { store.togglePinned(n.id); refresh(); }}><Pin size={15} /></button>
                      <button title={hidden ? 'Göster' : 'Gizle'} onClick={() => { store.toggleHidden(n.id); refresh(); }}>{hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                      {manual && <button title="Sil" className="danger" onClick={() => { if (confirm('Bu haber silinsin mi?')) { store.deleteManualNews(n.id); refresh(); } }}><Trash2 size={15} /></button>}
                    </div>
                  </div>
                );
              })}
              {filtered.length > 60 && <div className="admin-muted" style={{ textAlign: 'center', padding: 16 }}>İlk 60 haber gösteriliyor. Aramayı daraltın.</div>}
            </div>
          </>
        )}

        {view === 'form' && <NewsForm editing={editing} onDone={afterForm} onCancel={() => setView('list')} />}
        {view === 'ads' && <AdsManager />}
        {view === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
};

export default AdminApp;
