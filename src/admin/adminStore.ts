import type { NewsItem } from '../data/mockData';
import { mockAds, CATEGORIES } from '../data/mockData';

// Admin paneli tüm değişiklikleri tarayıcının localStorage'ında saklar (backend yok).
// Herkese açık site, bu katmanı taban haberlerin üstüne uygulayarak gösterir.

const K = {
  password: 'admin_password',
  session: 'admin_session',
  manual: 'admin_manual_news',
  edits: 'admin_edits',
  hidden: 'admin_hidden',
  heroId: 'admin_hero_id',
  pinned: 'admin_pinned',
  ads: 'admin_ads',
  settings: 'admin_settings',
  categories: 'admin_categories',
};

const DEFAULT_PASSWORD = 'sozmilletin2026';

export const MANUAL_CATEGORIES = ['Kocaeli', 'Siyaset', 'Asayiş', 'Spor', 'Magazin', 'Gündem', 'Ekonomi', 'Teknoloji', 'Dünya'];

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* kota dolu vb. */ }
}

/* ================= Kimlik doğrulama ================= */
export function getPassword(): string { return localStorage.getItem(K.password) || DEFAULT_PASSWORD; }
export function setPassword(p: string) { if (p.trim()) localStorage.setItem(K.password, p.trim()); }
export function isAuthed(): boolean { return sessionStorage.getItem(K.session) === '1'; }
export function login(p: string): boolean {
  if (p === getPassword()) { sessionStorage.setItem(K.session, '1'); return true; }
  return false;
}
export function logout() { sessionStorage.removeItem(K.session); }

/* ================= Site Ayarları / SEO / Görünüm ================= */
export interface SiteSettings {
  siteName: string;
  slogan: string;
  contactEmail: string;
  footerText: string;
  accentColor: string;
  social: { facebook: string; twitter: string; instagram: string; youtube: string };
  showMarketTicker: boolean;
  showBreaking: boolean;
  showWeather: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  gaId: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'SÖZ MİLLETİN',
  slogan: 'MEDYA HABER',
  contactEmail: 'info@sozmilletin.com',
  footerText: "Söz Milletin, Türkiye'nin bağımsız ve ilkeli haber kaynağı. Doğru, tarafsız ve hızlı haberciliğin dijital adresi.",
  accentColor: '#b91c1c',
  social: { facebook: '', twitter: '', instagram: '', youtube: '' },
  showMarketTicker: true,
  showBreaking: true,
  showWeather: true,
  seoTitle: 'SÖZ MİLLETİN — Son Dakika Haberler, Kocaeli ve Türkiye Gündemi',
  seoDescription: 'Kocaeli ve Türkiye gündeminden son dakika haberleri, siyaset, spor, asayiş ve magazin. Bağımsız ve tarafsız habercilik.',
  seoKeywords: 'haber, son dakika, kocaeli, gündem, siyaset, spor, asayiş',
  ogImage: '/haber-placeholder.svg',
  gaId: '',
};

export function getSettings(): SiteSettings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<SiteSettings>>(K.settings, {}) };
}
export function saveSettings(s: Partial<SiteSettings>) {
  write(K.settings, { ...getSettings(), ...s });
  applyTheme();
}

// Tema rengini canlı uygula
export function applyTheme() {
  try {
    const s = getSettings();
    const root = document.documentElement;
    root.style.setProperty('--accent-red', s.accentColor);
    // basit koyulaştırma (hover)
    root.style.setProperty('--accent-red-hover', s.accentColor);
  } catch { /* yok say */ }
}

// SEO meta etiketlerini uygula
export function setDocumentSeo(opts: { title?: string; description?: string; image?: string }) {
  try {
    if (opts.title) document.title = opts.title;
    const ensure = (selector: string, attr: string, key: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      return el;
    };
    if (opts.description) ensure('meta[name="description"]', 'name', 'description').setAttribute('content', opts.description);
    if (opts.title) ensure('meta[property="og:title"]', 'property', 'og:title').setAttribute('content', opts.title);
    if (opts.description) ensure('meta[property="og:description"]', 'property', 'og:description').setAttribute('content', opts.description);
    if (opts.image) ensure('meta[property="og:image"]', 'property', 'og:image').setAttribute('content', opts.image);
    ensure('meta[name="twitter:card"]', 'name', 'twitter:card').setAttribute('content', 'summary_large_image');
  } catch { /* yok say */ }
}

// Google Analytics (varsa) enjekte et
export function injectAnalytics() {
  try {
    const id = getSettings().gaId.trim();
    if (!id || document.getElementById('ga-script')) return;
    const s1 = document.createElement('script');
    s1.id = 'ga-script'; s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
    document.head.appendChild(s2);
  } catch { /* yok say */ }
}

/* ================= Kategoriler (navigasyon) ================= */
export function getCategories(): string[] {
  return read<string[]>(K.categories, CATEGORIES);
}
export function saveCategories(list: string[]) {
  const clean = Array.from(new Set(list.map(c => c.trim()).filter(Boolean)));
  if (clean[0] !== 'Tümü') { const i = clean.indexOf('Tümü'); if (i > 0) clean.splice(i, 1); clean.unshift('Tümü'); if (i < 0) clean.unshift('Tümü'); }
  write(K.categories, Array.from(new Set(clean)));
}

/* ================= Manuel haberler ================= */
export function getManualNews(): NewsItem[] { return read<NewsItem[]>(K.manual, []); }
export function saveManualNews(list: NewsItem[]) { write(K.manual, list); }
export function upsertManualNews(item: NewsItem) {
  const list = getManualNews();
  const i = list.findIndex(n => n.id === item.id);
  if (i >= 0) list[i] = item; else list.unshift(item);
  saveManualNews(list);
}
export function deleteManualNews(id: string) { saveManualNews(getManualNews().filter(n => n.id !== id)); }
export function isManual(id: string): boolean { return getManualNews().some(n => n.id === id); }

/* ================= Taban haber düzenlemeleri ================= */
export function getEdits(): Record<string, Partial<NewsItem>> { return read(K.edits, {}); }
export function setEdit(id: string, patch: Partial<NewsItem>) {
  const e = getEdits(); e[id] = { ...e[id], ...patch }; write(K.edits, e);
}
export function clearEdit(id: string) { const e = getEdits(); delete e[id]; write(K.edits, e); }

/* ================= Gizle / Manşet / Öne çıkar ================= */
export function getHidden(): string[] { return read<string[]>(K.hidden, []); }
export function toggleHidden(id: string) {
  const h = getHidden(); write(K.hidden, h.includes(id) ? h.filter(x => x !== id) : [...h, id]);
}
export function isHidden(id: string): boolean { return getHidden().includes(id); }
export function getHeroId(): string | null { return localStorage.getItem(K.heroId); }
export function setHeroId(id: string | null) { if (id) localStorage.setItem(K.heroId, id); else localStorage.removeItem(K.heroId); }
export function getPinned(): string[] { return read<string[]>(K.pinned, []); }
export function togglePinned(id: string) {
  const p = getPinned(); write(K.pinned, p.includes(id) ? p.filter(x => x !== id) : [id, ...p]);
}
export function isPinned(id: string): boolean { return getPinned().includes(id); }

/* ================= Reklamlar (gelişmiş yerleşim) ================= */
export interface AdSlot {
  id: string;
  type: 'leaderboard' | 'sidebar-rect' | 'sidebar-tall' | 'native';
  label: string;
  enabled: boolean;
  mode: 'image' | 'code';
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl: string;
  ctaText: string;
  code: string;
  showOnHome: boolean;
  showOnArticle: boolean;
}

function defaultAdSlots(): AdSlot[] {
  const labels: Record<string, string> = {
    leaderboard: 'Üst / Alt Banner (728x90)',
    'sidebar-rect': 'Kenar Kare (300x250)',
    'sidebar-tall': 'Kenar Uzun (300x600)',
    native: 'Sponsorlu İçerik',
  };
  return (['leaderboard', 'sidebar-rect', 'sidebar-tall', 'native'] as const).map(type => {
    const m = mockAds.find(a => a.type === type);
    return {
      id: type, type, label: labels[type], enabled: true, mode: 'image' as const,
      title: m?.title || '', description: m?.description || '', imageUrl: m?.imageUrl || '',
      destinationUrl: m?.destinationUrl || '#', ctaText: m?.ctaText || '', code: '',
      showOnHome: true, showOnArticle: true,
    };
  });
}

export function getAdSlots(): AdSlot[] {
  const saved = read<AdSlot[] | null>(K.ads, null);
  if (saved && saved.length) return saved;
  return defaultAdSlots();
}
export function saveAdSlots(slots: AdSlot[]) { write(K.ads, slots); }

// AdZone için: verilen tip ve sayfaya uygun aktif reklamı döndür (yoksa null)
export function getAdFor(type: string, page: 'home' | 'article' = 'home'): AdSlot | null {
  const slot = getAdSlots().find(a => a.type === type);
  if (!slot || !slot.enabled) return null;
  if (page === 'home' && !slot.showOnHome) return null;
  if (page === 'article' && !slot.showOnArticle) return null;
  return slot;
}

/* ================= Sıfırla / Yedekle / Geri yükle ================= */
export function resetAll() {
  Object.values(K).forEach(k => { try { localStorage.removeItem(k); } catch { /* yok say */ } });
  logout();
  applyTheme();
}
export function exportAll(): string {
  const data: Record<string, unknown> = {};
  Object.entries(K).forEach(([name, key]) => {
    if (name === 'session' || name === 'password') return;
    const v = localStorage.getItem(key);
    if (v != null) data[key] = v;
  });
  return JSON.stringify(data, null, 2);
}
export function importAll(json: string): boolean {
  try {
    const data = JSON.parse(json) as Record<string, string>;
    Object.entries(data).forEach(([key, val]) => localStorage.setItem(key, val));
    applyTheme();
    return true;
  } catch { return false; }
}

/* ================= Yeni haber nesnesi ================= */
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export function todayTR(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function slugify(s: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return s.toLowerCase().replace(/[çğıöşüİ]/g, c => map[c] || c)
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70);
}
export function makeNewsItem(input: {
  id?: string; title: string; summary?: string; content: string[];
  category?: string; image?: string; author?: string; date?: string;
  isBreaking?: boolean; isHero?: boolean; tags?: string[];
  seoTitle?: string; seoDescription?: string; publishAt?: number;
}): NewsItem {
  const words = input.content.join(' ').split(/\s+/).filter(Boolean).length;
  return {
    id: input.id || 'manual-' + Date.now(),
    title: input.title.trim(),
    summary: (input.summary || input.content[0] || input.title).slice(0, 240),
    content: input.content.length ? input.content : [input.title],
    category: input.category || 'Gündem',
    image: input.image?.trim() || '/haber-placeholder.svg',
    date: input.date || todayTR(),
    author: { name: input.author?.trim() || 'Söz Milletin', avatar: '/haber-placeholder.svg' },
    views: 0, likes: 0, comments: [],
    isBreaking: input.isBreaking, isHero: input.isHero,
    readTime: `${Math.max(1, Math.ceil(words / 200))} dk`,
    reactions: { like: 0, heart: 0, sad: 0, fire: 0 },
    tags: input.tags, seoTitle: input.seoTitle, seoDescription: input.seoDescription,
    slug: slugify(input.title), publishAt: input.publishAt,
  };
}

/* ================= Birleştirme (public site) ================= */
export function getMergedNews(base: NewsItem[], opts: { includeScheduled?: boolean } = {}): NewsItem[] {
  const manual = getManualNews();
  const edits = getEdits();
  const hidden = new Set(getHidden());
  const pinned = getPinned();
  const heroId = getHeroId();
  const now = Date.now();

  const map = new Map<string, NewsItem>();
  for (const n of [...manual, ...base]) if (!map.has(n.id)) map.set(n.id, n);

  let list = Array.from(map.values()).map(n => (edits[n.id] ? ({ ...n, ...edits[n.id] } as NewsItem) : n));
  list = list.filter(n => !hidden.has(n.id));
  if (!opts.includeScheduled) list = list.filter(n => !n.publishAt || n.publishAt <= now);

  const pinnedSet = new Set(pinned);
  const heroArr = heroId ? list.filter(n => n.id === heroId) : [];
  const pinnedArr = pinned.map(id => list.find(n => n.id === id)).filter((n): n is NewsItem => !!n && n.id !== heroId);
  const restArr = list.filter(n => n.id !== heroId && !pinnedSet.has(n.id));
  return [...heroArr, ...pinnedArr, ...restArr];
}
