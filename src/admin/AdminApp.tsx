import React, { useState } from 'react';
import type { NewsItem } from '../data/mockData';
import { mockNews } from '../data/mockData';
import scrapedNewsData from '../data/scrapedNews.json';
import * as store from './adminStore';
import type { AdSlot, SiteSettings } from './adminStore';
import {
  Lock, LogOut, Plus, Search, Pencil, Trash2, Eye, EyeOff, Star, Pin, Newspaper,
  Megaphone, Settings, ArrowLeft, Save, Home, LayoutDashboard, Tag, Palette,
  Search as SeoIcon, Clock, Download, Upload, RotateCcw, FileText, Calendar, UploadCloud, Menu, X
} from 'lucide-react';

const BASE_NEWS: NewsItem[] = (scrapedNewsData && (scrapedNewsData as NewsItem[]).length > 0)
  ? (scrapedNewsData as NewsItem[]) : mockNews;

type View = 'dash' | 'list' | 'form' | 'ads' | 'cats' | 'seo' | 'look' | 'backup' | 'publish';

const toLocalInput = (ts?: number) => {
  if (!ts) return '';
  const d = new Date(ts - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};

/* ================= Giriş ================= */
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (store.login(pw)) onLogin(); else { setErr(true); setPw(''); } };
  return (
    <div className="admin-login">
      <form className="admin-login-box" onSubmit={submit}>
        <div className="admin-login-icon"><Lock size={26} /></div>
        <h1>Yönetim Paneli</h1>
        <p className="admin-muted">SÖZ MİLLETİN — İçerik Yönetimi</p>
        <input type="password" autoFocus placeholder="Parola" value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }} className={err ? 'admin-input err' : 'admin-input'} />
        {err && <div className="admin-err-text">Parola hatalı.</div>}
        <button type="submit" className="admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Giriş Yap</button>
        <p className="admin-hint">Varsayılan parola: <b>sozmilletin2026</b></p>
      </form>
    </div>
  );
};

/* ================= Haber Formu ================= */
const NewsForm: React.FC<{ editing: NewsItem | null; onDone: () => void; onCancel: () => void }> = ({ editing, onDone, onCancel }) => {
  const isBase = editing ? !editing.id.startsWith('manual-') && !store.isManual(editing.id) : false;
  const [title, setTitle] = useState(editing?.title || '');
  const [summary, setSummary] = useState(editing?.summary || '');
  const [body, setBody] = useState((editing?.content || []).join('\n\n'));
  const [category, setCategory] = useState(editing?.category || 'Gündem');
  const [image, setImage] = useState(editing?.image && editing.image !== '/haber-placeholder.svg' ? editing.image : '');
  const [author, setAuthor] = useState(editing?.author?.name || 'Söz Milletin');
  const [tags, setTags] = useState((editing?.tags || []).join(', '));
  const [isBreaking, setIsBreaking] = useState(!!editing?.isBreaking);
  const [makeHero, setMakeHero] = useState(editing ? store.getHeroId() === editing.id : false);
  const [pin, setPin] = useState(editing ? store.isPinned(editing.id) : false);
  const [publishAt, setPublishAt] = useState(toLocalInput(editing?.publishAt));
  const [seoTitle, setSeoTitle] = useState(editing?.seoTitle || '');
  const [seoDesc, setSeoDesc] = useState(editing?.seoDescription || '');
  const cats = store.getCategories().filter(c => c !== 'Tümü');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const content = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    const pubTs = publishAt ? new Date(publishAt).getTime() : undefined;
    let id = editing?.id;

    if (editing && isBase) {
      store.setEdit(editing.id, {
        title: title.trim(), summary: summary.trim() || content[0], content, category,
        image: image.trim() || editing.image,
        author: { name: author.trim() || editing.author.name, avatar: editing.author.avatar },
        isBreaking, tags: tagArr, seoTitle: seoTitle.trim(), seoDescription: seoDesc.trim(), publishAt: pubTs,
      });
    } else {
      const item = store.makeNewsItem({ id, title, summary, content, category, image, author, isBreaking, tags: tagArr, seoTitle, seoDescription: seoDesc, publishAt: pubTs, date: editing?.date });
      store.upsertManualNews(item);
      id = item.id;
    }
    if (id) {
      store.setHeroId(makeHero ? id : (store.getHeroId() === id ? null : store.getHeroId()));
      if (pin !== store.isPinned(id)) store.togglePinned(id);
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
      {title && <div className="admin-slug">Bağlantı: /haber/... · <b>{store.slugify(title)}</b></div>}

      <label className="admin-label">Özet</label>
      <textarea className="admin-input" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Boş bırakılırsa ilk paragraf kullanılır" />

      <label className="admin-label">İçerik * <span className="admin-muted">(paragrafları boş satırla ayırın)</span></label>
      <textarea className="admin-input" rows={9} value={body} onChange={(e) => setBody(e.target.value)} placeholder={'Birinci paragraf...\n\nİkinci paragraf...'} />

      <div className="admin-form-row">
        <div style={{ flex: 1 }}>
          <label className="admin-label">Kategori</label>
          <select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="admin-label">Yazar / Kaynak</label>
          <input className="admin-input" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
      </div>

      <label className="admin-label">Görsel URL</label>
      <input className="admin-input" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://... (boşsa markalı yer tutucu)" />
      {image.trim() && <img src={image} alt="" className="admin-img-preview" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />}

      <label className="admin-label">Etiketler <span className="admin-muted">(virgülle ayırın)</span></label>
      <input className="admin-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kocaeli, belediye, gündem" />

      <div className="admin-fieldset">
        <div className="admin-fieldset-title"><Clock size={14} /> Yayın Zamanlaması</div>
        <label className="admin-label">Yayın tarihi/saati <span className="admin-muted">(boşsa hemen yayınlanır; ileri tarih girerseniz o saate kadar gizli kalır)</span></label>
        <input className="admin-input" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
      </div>

      <div className="admin-fieldset">
        <div className="admin-fieldset-title"><SeoIcon size={14} /> SEO</div>
        <label className="admin-label">SEO Başlık <span className="admin-muted">({seoTitle.length}/60)</span></label>
        <input className="admin-input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Boşsa haber başlığı kullanılır" />
        <label className="admin-label">SEO Açıklama <span className="admin-muted">({seoDesc.length}/160)</span></label>
        <textarea className="admin-input" rows={2} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Boşsa haber özeti kullanılır" />
      </div>

      <div className="admin-toggles">
        <label className="admin-check"><input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} /> Son dakika</label>
        <label className="admin-check"><input type="checkbox" checked={makeHero} onChange={(e) => setMakeHero(e.target.checked)} /> Manşet yap</label>
        <label className="admin-check"><input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} /> Öne çıkar</label>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="admin-btn-ghost" onClick={onCancel}>Vazgeç</button>
        <button type="submit" className="admin-btn-primary"><Save size={16} /> Kaydet</button>
      </div>
    </form>
  );
};

/* ================= Reklam Yönetimi (PRO) ================= */
const AD_SPECS: Record<string, { size: string; sizeMobile: string; where: string; ratio: number; previewW: number }> = {
  leaderboard: { size: '728 × 90', sizeMobile: '320 × 100', where: 'Sayfa altında, tam genişlik banner', ratio: 728 / 90, previewW: 468 },
  'sidebar-rect': { size: '300 × 250', sizeMobile: '300 × 250', where: 'Kenar sütun / haber yanı (Medium Rectangle)', ratio: 300 / 250, previewW: 300 },
  'sidebar-tall': { size: '300 × 600', sizeMobile: 'gizli', where: 'Kenar sütun (Half Page / Gökdelen)', ratio: 300 / 600, previewW: 200 },
  native: { size: 'Esnek', sizeMobile: 'Esnek', where: 'İçerik arası sponsorlu kart', ratio: 3.4, previewW: 320 },
};

// Reklamın sitede nasıl görüneceğini gösteren canlı önizleme
const AdPreview: React.FC<{ ad: AdSlot }> = ({ ad }) => {
  const spec = AD_SPECS[ad.type];
  const w = spec.previewW;
  const h = ad.type === 'native' ? undefined : Math.round(w / spec.ratio);
  const box: React.CSSProperties = {
    width: w, maxWidth: '100%', height: h, minHeight: ad.type === 'native' ? 96 : undefined,
    border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden',
    position: 'relative', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-premium)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  if (ad.mode === 'code') {
    return ad.code.trim()
      ? <div style={box} dangerouslySetInnerHTML={{ __html: ad.code }} />
      : <div style={{ ...box, color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 10 }}>Kod girildiğinde burada görünür</div>;
  }
  if (ad.imageUrl.trim()) {
    return (
      <div style={box}>
        <img src={ad.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.currentTarget.style.display = 'none'); }} />
        {(ad.title || ad.ctaText) && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85), transparent)', padding: '8px 10px', color: '#fff', textAlign: 'left' }}>
            {ad.title && <div style={{ fontSize: 12, fontWeight: 800 }}>{ad.title}</div>}
            {ad.ctaText && <div style={{ fontSize: 10, color: '#ffd54a', fontWeight: 700 }}>{ad.ctaText} →</div>}
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ ...box, flexDirection: 'column', gap: 3, color: 'var(--text-muted)', textAlign: 'center', padding: 10 }}>
      {ad.title ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ad.title}</div>
          {ad.description && <div style={{ fontSize: 11 }}>{ad.description}</div>}
          {ad.ctaText && <div style={{ fontSize: 11, color: 'var(--accent-red)', fontWeight: 700 }}>{ad.ctaText} →</div>}
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, opacity: .6 }}>REKLAM ALANI</div>
          <div style={{ fontSize: 11, opacity: .5 }}>{spec.size}</div>
        </>
      )}
    </div>
  );
};

const AdsManager: React.FC = () => {
  const [slots, setSlots] = useState<AdSlot[]>(() => store.getAdSlots().map(a => ({ ...a })));
  const [ok, setOk] = useState(false);
  const upd = (i: number, patch: Partial<AdSlot>) => { setSlots(p => p.map((a, idx) => idx === i ? { ...a, ...patch } : a)); setOk(false); };
  const persist = () => { store.saveAdSlots(slots); setOk(true); };

  return (
    <div>
      <div className="admin-section-head"><h2>Reklam Yönetimi</h2><button className="admin-btn-primary" onClick={persist}><Save size={16} /> Kaydet</button></div>
      <p className="admin-muted" style={{ marginBottom: 16 }}>Her reklam alanının önerilen boyutu, nerede görüneceği ve nasıl görüneceği aşağıda. Sağdaki önizleme yazdıkça anlık güncellenir.</p>
      {ok && <div className="admin-ok">Reklamlar kaydedildi. Siteyi yenileyince görünür.</div>}

      {slots.map((ad, i) => {
        const spec = AD_SPECS[ad.type];
        return (
          <div key={ad.id} className="admin-ad-card">
            <div className="admin-ad-head">
              <div>
                <span className="admin-ad-type">{ad.label}</span>
                <div className="admin-ad-specs">
                  <span className="admin-spec-badge">📐 Önerilen: <b>{spec.size}</b> px</span>
                  <span className="admin-spec-badge">📱 Mobil: <b>{spec.sizeMobile}</b></span>
                  <span className="admin-spec-badge">📍 {spec.where}</span>
                </div>
              </div>
              <label className="admin-switch"><input type="checkbox" checked={ad.enabled} onChange={(e) => upd(i, { enabled: e.target.checked })} /> <span>{ad.enabled ? 'Açık' : 'Kapalı'}</span></label>
            </div>

            <div className="admin-placement">
              <span className="admin-muted">Nerede görünsün:</span>
              <label className="admin-check sm"><input type="checkbox" checked={ad.showOnHome} onChange={(e) => upd(i, { showOnHome: e.target.checked })} /> Ana sayfa</label>
              <label className="admin-check sm"><input type="checkbox" checked={ad.showOnArticle} onChange={(e) => upd(i, { showOnArticle: e.target.checked })} /> Haber sayfası</label>
            </div>

            <div className="admin-ad-grid">
              {/* Sol: form */}
              <div>
                <label className="admin-label">Reklam türü</label>
                <select className="admin-input" value={ad.mode} onChange={(e) => upd(i, { mode: e.target.value as 'image' | 'code' })}>
                  <option value="image">Görsel + link</option>
                  <option value="code">Özel kod (Google AdSense / HTML)</option>
                </select>

                {ad.mode === 'image' ? (
                  <>
                    <label className="admin-label">Görsel URL <span className="admin-muted">({spec.size} önerilir)</span></label>
                    <input className="admin-input" value={ad.imageUrl} onChange={(e) => upd(i, { imageUrl: e.target.value })} placeholder="https://..." />
                    <label className="admin-label">Hedef Link (tıklayınca gidilecek)</label>
                    <input className="admin-input" value={ad.destinationUrl} onChange={(e) => upd(i, { destinationUrl: e.target.value })} placeholder="https://..." />
                    <div className="admin-form-row">
                      <div style={{ flex: 1 }}><label className="admin-label">Başlık</label><input className="admin-input" value={ad.title} onChange={(e) => upd(i, { title: e.target.value })} /></div>
                      <div style={{ flex: 1 }}><label className="admin-label">Buton metni</label><input className="admin-input" value={ad.ctaText} onChange={(e) => upd(i, { ctaText: e.target.value })} /></div>
                    </div>
                    <label className="admin-label">Açıklama</label>
                    <input className="admin-input" value={ad.description} onChange={(e) => upd(i, { description: e.target.value })} />
                  </>
                ) : (
                  <>
                    <label className="admin-label">Reklam kodu (AdSense / HTML)</label>
                    <textarea className="admin-input" rows={6} value={ad.code} onChange={(e) => upd(i, { code: e.target.value })} placeholder="<script>...</script> veya <ins class='adsbygoogle'...></ins>" style={{ fontFamily: 'monospace', fontSize: 12 }} />
                  </>
                )}
              </div>

              {/* Sağ: canlı önizleme */}
              <div className="admin-ad-preview-col">
                <div className="admin-preview-label">CANLI ÖNİZLEME</div>
                <div className="admin-preview-stage">
                  <AdPreview ad={ad} />
                </div>
                {!ad.enabled && <div className="admin-preview-off">Bu alan kapalı — sitede görünmez.</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ================= Kategori Yönetimi ================= */
const CategoryManager: React.FC = () => {
  const [cats, setCats] = useState<string[]>(() => store.getCategories());
  const [nw, setNw] = useState(''); const [ok, setOk] = useState(false);
  const add = () => { if (nw.trim() && !cats.includes(nw.trim())) { setCats([...cats, nw.trim()]); setNw(''); setOk(false); } };
  const remove = (c: string) => { if (c !== 'Tümü') { setCats(cats.filter(x => x !== c)); setOk(false); } };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 1 || j >= cats.length) return; // Tümü hep başta
    const copy = [...cats];[copy[i], copy[j]] = [copy[j], copy[i]]; setCats(copy); setOk(false);
  };
  const persist = () => { store.saveCategories(cats); setOk(true); };
  return (
    <div>
      <div className="admin-section-head"><h2>Kategoriler</h2><button className="admin-btn-primary" onClick={persist}><Save size={16} /> Kaydet</button></div>
      <p className="admin-muted" style={{ marginBottom: 16 }}>Üst menüde görünecek kategoriler. Sıralayabilir, ekleyip çıkarabilirsiniz.</p>
      {ok && <div className="admin-ok">Kategoriler kaydedildi. Siteyi yenileyin.</div>}
      <div className="admin-cat-add">
        <input className="admin-input" value={nw} onChange={(e) => setNw(e.target.value)} placeholder="Yeni kategori adı" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
        <button className="admin-btn-primary" onClick={add}><Plus size={16} /> Ekle</button>
      </div>
      <div className="admin-cat-list">
        {cats.map((c, i) => (
          <div key={c} className="admin-cat-row">
            <span>{c}</span>
            <div className="admin-cat-actions">
              <button onClick={() => move(i, -1)} disabled={i <= 1} title="Yukarı">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === 0 || i === cats.length - 1} title="Aşağı">↓</button>
              {c !== 'Tümü' && <button className="danger" onClick={() => remove(c)} title="Sil"><Trash2 size={14} /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= SEO & Site Ayarları ================= */
const SeoSettings: React.FC = () => {
  const [s, setS] = useState<SiteSettings>(() => store.getSettings());
  const [ok, setOk] = useState(false);
  const upd = (patch: Partial<SiteSettings>) => { setS(p => ({ ...p, ...patch })); setOk(false); };
  const save = () => { store.saveSettings(s); setOk(true); };
  return (
    <div>
      <div className="admin-section-head"><h2>SEO & Site Bilgileri</h2><button className="admin-btn-primary" onClick={save}><Save size={16} /> Kaydet</button></div>
      {ok && <div className="admin-ok">Kaydedildi. Siteyi yenileyince geçerli olur.</div>}
      <div className="admin-ad-card">
        <div className="admin-fieldset-title"><FileText size={14} /> Arama Motoru (SEO)</div>
        <label className="admin-label">Site Başlığı (title)</label>
        <input className="admin-input" value={s.seoTitle} onChange={(e) => upd({ seoTitle: e.target.value })} />
        <label className="admin-label">Site Açıklaması (meta description)</label>
        <textarea className="admin-input" rows={2} value={s.seoDescription} onChange={(e) => upd({ seoDescription: e.target.value })} />
        <label className="admin-label">Anahtar Kelimeler</label>
        <input className="admin-input" value={s.seoKeywords} onChange={(e) => upd({ seoKeywords: e.target.value })} />
        <label className="admin-label">Paylaşım Görseli (OG image URL)</label>
        <input className="admin-input" value={s.ogImage} onChange={(e) => upd({ ogImage: e.target.value })} />
        <label className="admin-label">Google Analytics ID</label>
        <input className="admin-input" value={s.gaId} onChange={(e) => upd({ gaId: e.target.value })} placeholder="G-XXXXXXXXXX" />
      </div>
      <div className="admin-ad-card">
        <div className="admin-fieldset-title">İletişim & Sosyal</div>
        <label className="admin-label">İletişim E-posta</label>
        <input className="admin-input" value={s.contactEmail} onChange={(e) => upd({ contactEmail: e.target.value })} />
        <div className="admin-form-row">
          <div style={{ flex: 1 }}><label className="admin-label">Facebook</label><input className="admin-input" value={s.social.facebook} onChange={(e) => upd({ social: { ...s.social, facebook: e.target.value } })} /></div>
          <div style={{ flex: 1 }}><label className="admin-label">X (Twitter)</label><input className="admin-input" value={s.social.twitter} onChange={(e) => upd({ social: { ...s.social, twitter: e.target.value } })} /></div>
        </div>
        <div className="admin-form-row">
          <div style={{ flex: 1 }}><label className="admin-label">Instagram</label><input className="admin-input" value={s.social.instagram} onChange={(e) => upd({ social: { ...s.social, instagram: e.target.value } })} /></div>
          <div style={{ flex: 1 }}><label className="admin-label">YouTube</label><input className="admin-input" value={s.social.youtube} onChange={(e) => upd({ social: { ...s.social, youtube: e.target.value } })} /></div>
        </div>
      </div>
    </div>
  );
};

/* ================= Görünüm / Tema ================= */
const LookSettings: React.FC = () => {
  const [s, setS] = useState<SiteSettings>(() => store.getSettings());
  const [ok, setOk] = useState(false);
  const upd = (patch: Partial<SiteSettings>) => { setS(p => ({ ...p, ...patch })); setOk(false); };
  const save = () => { store.saveSettings(s); setOk(true); };
  const colors = ['#b91c1c', '#e30613', '#0284c7', '#059669', '#7c3aed', '#ea580c', '#0f172a'];
  return (
    <div>
      <div className="admin-section-head"><h2>Görünüm</h2><button className="admin-btn-primary" onClick={save}><Save size={16} /> Kaydet</button></div>
      {ok && <div className="admin-ok">Kaydedildi. Siteyi yenileyince geçerli olur.</div>}
      <div className="admin-ad-card">
        <label className="admin-label">Site Adı</label>
        <input className="admin-input" value={s.siteName} onChange={(e) => upd({ siteName: e.target.value })} />
        <label className="admin-label">Slogan</label>
        <input className="admin-input" value={s.slogan} onChange={(e) => upd({ slogan: e.target.value })} />
        <label className="admin-label">Footer Metni</label>
        <textarea className="admin-input" rows={2} value={s.footerText} onChange={(e) => upd({ footerText: e.target.value })} />
        <label className="admin-label">Ana Renk (Tema)</label>
        <div className="admin-colors">
          {colors.map(c => <button key={c} type="button" className={`admin-color ${s.accentColor === c ? 'on' : ''}`} style={{ background: c }} onClick={() => upd({ accentColor: c })} />)}
          <input type="color" value={s.accentColor} onChange={(e) => upd({ accentColor: e.target.value })} className="admin-color-input" />
        </div>
      </div>
      <div className="admin-ad-card">
        <div className="admin-fieldset-title">Bölümleri Aç / Kapat</div>
        <label className="admin-check"><input type="checkbox" checked={s.showMarketTicker} onChange={(e) => upd({ showMarketTicker: e.target.checked })} /> Döviz / Borsa şeridi</label>
        <label className="admin-check"><input type="checkbox" checked={s.showBreaking} onChange={(e) => upd({ showBreaking: e.target.checked })} /> Son dakika şeridi</label>
        <label className="admin-check"><input type="checkbox" checked={s.showWeather} onChange={(e) => upd({ showWeather: e.target.checked })} /> Hava durumu / widget'lar</label>
      </div>
    </div>
  );
};

/* ================= Yedek & Ayarlar ================= */
const BackupSettings: React.FC = () => {
  const [pw, setPw] = useState(''); const [msg, setMsg] = useState('');
  const doExport = () => {
    const blob = new Blob([store.exportAll()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `sozmilletin-yedek-${Date.now()}.json`; a.click();
  };
  const doImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { if (store.importAll(String(r.result))) { alert('Yedek geri yüklendi.'); location.reload(); } else alert('Dosya okunamadı.'); };
    r.readAsText(f);
  };
  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Yedek & Ayarlar</h2>
      <div className="admin-ad-card">
        <div className="admin-fieldset-title"><Lock size={14} /> Parola</div>
        <label className="admin-label">Yeni Parola</label>
        <input className="admin-input" type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Yeni parola" />
        <button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={() => { store.setPassword(pw); setPw(''); setMsg('Parola güncellendi.'); }}>Parolayı Değiştir</button>
        {msg && <div className="admin-ok" style={{ marginTop: 10 }}>{msg}</div>}
      </div>
      <div className="admin-ad-card">
        <div className="admin-fieldset-title"><Download size={14} /> Yedekleme</div>
        <p className="admin-muted" style={{ marginBottom: 12 }}>Tüm haberleri, ayarları ve reklamları bir dosyaya kaydedin ya da geri yükleyin.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="admin-btn-ghost" onClick={doExport}><Download size={16} /> Yedeği İndir</button>
          <label className="admin-btn-ghost" style={{ cursor: 'pointer' }}><Upload size={16} /> Yedek Yükle<input type="file" accept="application/json" hidden onChange={doImport} /></label>
        </div>
      </div>
      <div className="admin-ad-card">
        <div className="admin-fieldset-title" style={{ color: '#dc2626' }}>Tehlikeli Bölge</div>
        <p className="admin-muted" style={{ marginBottom: 12 }}>Tüm elle eklenen haberleri, düzenlemeleri, reklamları ve ayarları siler.</p>
        <button className="admin-btn-danger" onClick={() => { if (confirm('Tüm admin verileri silinsin mi?')) { store.resetAll(); location.reload(); } }}><RotateCcw size={16} /> Her Şeyi Sıfırla</button>
      </div>
    </div>
  );
};

/* ================= Yayınla ================= */
const PublishPanel: React.FC = () => {
  const [token, setTok] = useState(store.getToken());
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null);
  const doPublish = async () => {
    store.setToken(token);
    setBusy(true); setRes(null);
    setRes(await store.publish());
    setBusy(false);
  };
  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Yayınla</h2>
      <div className="admin-ad-card">
        <div className="admin-fieldset-title"><UploadCloud size={14} /> Değişiklikleri Canlıya Al</div>
        <p className="admin-muted" style={{ marginBottom: 14 }}>
          Panelde yaptığın tüm değişiklikleri (haberler, ayarlar, reklamlar, SEO...) gerçek siteye gönderir.
          Birkaç dakika içinde <b>sözmilletin.com</b>'da herkese görünür olur.
        </p>
        <label className="admin-label">GitHub Erişim Anahtarı (token)</label>
        <input className="admin-input" type="password" value={token} onChange={(e) => setTok(e.target.value)} placeholder="github_pat_... veya ghp_..." />
        <p className="admin-hint" style={{ lineHeight: 1.6 }}>
          Anahtar yalnızca senin tarayıcında saklanır. Nasıl alınır: <b>GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</b> → repo: <b>220creative/sozmilletin</b> → izinler: <b>Contents</b> ve <b>Actions</b> = "Read and write".
        </p>
        <button className="admin-btn-primary" style={{ marginTop: 14 }} disabled={busy} onClick={doPublish}>
          {busy ? 'Yayınlanıyor…' : <><UploadCloud size={16} /> Şimdi Yayınla</>}
        </button>
        {res && <div className={res.ok ? 'admin-ok' : 'admin-err-text'} style={{ marginTop: 14 }}>{res.msg}</div>}
      </div>
    </div>
  );
};

/* ================= Gösterge Paneli ================= */
const Dashboard: React.FC<{ go: (v: View, edit?: NewsItem | null) => void }> = ({ go }) => {
  const all = store.getMergedNews(BASE_NEWS, { includeScheduled: true });
  const manual = store.getManualNews().length;
  const hidden = store.getHidden().length;
  const pinned = store.getPinned().length;
  const scheduled = all.filter(n => n.publishAt && n.publishAt > Date.now()).length;
  const byCat: Record<string, number> = {};
  all.forEach(n => { byCat[n.category] = (byCat[n.category] || 0) + 1; });
  const cards = [
    { label: 'Toplam Haber', value: all.length, icon: Newspaper },
    { label: 'Elle Eklenen', value: manual, icon: Plus },
    { label: 'Gizli', value: hidden, icon: EyeOff },
    { label: 'Öne Çıkan', value: pinned, icon: Pin },
    { label: 'Zamanlanmış', value: scheduled, icon: Calendar },
  ];
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Gösterge Paneli</h2>
      <div className="admin-stats">
        {cards.map(c => { const I = c.icon; return (
          <div key={c.label} className="admin-stat"><div className="admin-stat-icon"><I size={18} /></div><div><div className="admin-stat-value">{c.value}</div><div className="admin-stat-label">{c.label}</div></div></div>
        ); })}
      </div>
      <div className="admin-quick"><button className="admin-btn-primary" onClick={() => go('form', null)}><Plus size={16} /> Yeni Haber Ekle</button></div>
      <h3 className="admin-h3">Kategori Dağılımı</h3>
      <div className="admin-catbars">
        {Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, n]) => (
          <div key={cat} className="admin-catbar"><span className="admin-catbar-label">{cat}</span><div className="admin-catbar-track"><div className="admin-catbar-fill" style={{ width: `${(n / all.length) * 100}%` }} /></div><span className="admin-catbar-n">{n}</span></div>
        ))}
      </div>
    </div>
  );
};

/* ================= Ana Panel ================= */
export const AdminApp: React.FC = () => {
  const [authed, setAuthed] = useState(store.isAuthed());
  const [view, setView] = useState<View>('dash');
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('Tümü');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, force] = useState(0);
  const refresh = () => force(x => x + 1);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const merged = store.getMergedNews(BASE_NEWS, { includeScheduled: true });
  const heroId = store.getHeroId();
  const cats = store.getCategories();
  const filtered = merged.filter(n =>
    (!query.trim() || n.title.toLowerCase().includes(query.toLowerCase())) &&
    (catFilter === 'Tümü' || n.category === catFilter));
  const visible = filtered.slice(0, 60);

  const go = (v: View, edit: NewsItem | null = null) => { setEditing(edit); setView(v); setIsMobileMenuOpen(false); };
  const afterForm = () => { setView('list'); refresh(); };

  const nav: { v: View; label: string; icon: React.ElementType }[] = [
    { v: 'dash', label: 'Panel', icon: LayoutDashboard },
    { v: 'list', label: 'Haberler', icon: Newspaper },
    { v: 'ads', label: 'Reklamlar', icon: Megaphone },
    { v: 'cats', label: 'Kategoriler', icon: Tag },
    { v: 'seo', label: 'SEO & Site', icon: SeoIcon },
    { v: 'look', label: 'Görünüm', icon: Palette },
    { v: 'backup', label: 'Yedek & Ayarlar', icon: Settings },
  ];

  return (
    <div className="admin-root">
      {/* Mobil Header */}
      <div className="admin-mobile-header">
        <div className="admin-logo">SÖZ<span>.</span>MİLLETİN</div>
        <button className="icon-btn" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} color="#fff" /></button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && <div className="admin-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-top-close" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="admin-logo">SÖZ<span>.</span>MİLLETİN</div>
          <button className="icon-btn"><X size={24} color="#fff" /></button>
        </div>
        <div className="admin-logo desktop-only">SÖZ<span>.</span>MİLLETİN</div>
        <div className="admin-logo-sub desktop-only">YÖNETİM</div>
        <button className="admin-publish-btn" onClick={() => { setView('publish'); setIsMobileMenuOpen(false); }}><UploadCloud size={16} /> <span>Yayınla</span></button>
        <nav>
          <button className="hl" onClick={() => go('form', null)}><Plus size={17} /> <span>Yeni Haber</span></button>
          {nav.map(n => { const I = n.icon; return (
            <button key={n.v} className={view === n.v ? 'active' : ''} onClick={() => go(n.v)}><I size={17} /> <span>{n.label}</span></button>
          ); })}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" className="admin-side-link"><Home size={16} /> <span>Siteyi Gör</span></a>
          <button className="admin-side-link" onClick={() => { store.logout(); setAuthed(false); }}><LogOut size={16} /> <span>Çıkış</span></button>
        </div>
      </aside>

      <main className="admin-main">
        {view === 'dash' && <Dashboard go={go} />}
        {view === 'publish' && <PublishPanel />}
        {view === 'form' && <NewsForm editing={editing} onDone={afterForm} onCancel={() => setView('list')} />}
        {view === 'ads' && <AdsManager />}
        {view === 'cats' && <CategoryManager />}
        {view === 'seo' && <SeoSettings />}
        {view === 'look' && <LookSettings />}
        {view === 'backup' && <BackupSettings />}

        {view === 'list' && (
          <>
            <div className="admin-section-head">
              <h2>Haberler <span className="admin-count">{merged.length}</span></h2>
              <button className="admin-btn-primary" onClick={() => go('form', null)}><Plus size={16} /> Yeni Haber</button>
            </div>
            <div className="admin-filters">
              <div className="admin-search"><Search size={16} /><input placeholder="Başlıkta ara..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
              <select className="admin-input" style={{ maxWidth: 180, margin: 0 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="admin-news-list">
              {visible.map(n => {
                const manual = n.id.startsWith('manual-') || store.isManual(n.id);
                const hidden = store.isHidden(n.id);
                const pinned = store.isPinned(n.id);
                const isHero = heroId === n.id;
                const scheduled = n.publishAt && n.publishAt > Date.now();
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
                        {scheduled && <span className="badge sched">Zamanlı</span>}
                        {hidden && <span className="badge hidden">Gizli</span>}
                      </div>
                    </div>
                    <div className="admin-news-actions">
                      <button title="Düzenle" onClick={() => go('form', n)}><Pencil size={15} /></button>
                      <button title="Manşet yap" className={isHero ? 'on' : ''} onClick={() => { store.setHeroId(isHero ? null : n.id); refresh(); }}><Star size={15} /></button>
                      <button title="Öne çıkar" className={pinned ? 'on' : ''} onClick={() => { store.togglePinned(n.id); refresh(); }}><Pin size={15} /></button>
                      <button title={hidden ? 'Göster' : 'Gizle'} onClick={() => { store.toggleHidden(n.id); refresh(); }}>{hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                      {manual && <button title="Sil" className="danger" onClick={() => { if (confirm('Bu haber silinsin mi?')) { store.deleteManualNews(n.id); refresh(); } }}><Trash2 size={15} /></button>}
                    </div>
                  </div>
                );
              })}
              {filtered.length > 60 && <div className="admin-muted" style={{ textAlign: 'center', padding: 16 }}>İlk 60 gösteriliyor. Aramayı daraltın.</div>}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminApp;
