import type { NewsItem, AdCampaign } from '../data/mockData';
import { mockAds } from '../data/mockData';

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

/* ---- Kimlik doğrulama (basit, istemci tarafı — sadece deneme paneli için) ---- */
export function getPassword(): string {
  return localStorage.getItem(K.password) || DEFAULT_PASSWORD;
}
export function setPassword(p: string) {
  if (p.trim()) localStorage.setItem(K.password, p.trim());
}
export function isAuthed(): boolean {
  return sessionStorage.getItem(K.session) === '1';
}
export function login(p: string): boolean {
  if (p === getPassword()) { sessionStorage.setItem(K.session, '1'); return true; }
  return false;
}
export function logout() { sessionStorage.removeItem(K.session); }

/* ---- Manuel (elle eklenen) haberler ---- */
export function getManualNews(): NewsItem[] { return read<NewsItem[]>(K.manual, []); }
export function saveManualNews(list: NewsItem[]) { write(K.manual, list); }
export function upsertManualNews(item: NewsItem) {
  const list = getManualNews();
  const i = list.findIndex(n => n.id === item.id);
  if (i >= 0) list[i] = item; else list.unshift(item);
  saveManualNews(list);
}
export function deleteManualNews(id: string) {
  saveManualNews(getManualNews().filter(n => n.id !== id));
}
export function isManual(id: string): boolean {
  return getManualNews().some(n => n.id === id);
}

/* ---- Taban (otomatik çekilen) haberler üzerinde düzenlemeler ---- */
export function getEdits(): Record<string, Partial<NewsItem>> { return read(K.edits, {}); }
export function setEdit(id: string, patch: Partial<NewsItem>) {
  const e = getEdits();
  e[id] = { ...e[id], ...patch };
  write(K.edits, e);
}
export function clearEdit(id: string) {
  const e = getEdits();
  delete e[id];
  write(K.edits, e);
}

/* ---- Gizleme ---- */
export function getHidden(): string[] { return read<string[]>(K.hidden, []); }
export function toggleHidden(id: string) {
  const h = getHidden();
  write(K.hidden, h.includes(id) ? h.filter(x => x !== id) : [...h, id]);
}
export function isHidden(id: string): boolean { return getHidden().includes(id); }

/* ---- Manşet (tek haber) ---- */
export function getHeroId(): string | null { return localStorage.getItem(K.heroId); }
export function setHeroId(id: string | null) {
  if (id) localStorage.setItem(K.heroId, id); else localStorage.removeItem(K.heroId);
}

/* ---- Öne çıkarma (sıralamada üste taşıma) ---- */
export function getPinned(): string[] { return read<string[]>(K.pinned, []); }
export function togglePinned(id: string) {
  const p = getPinned();
  write(K.pinned, p.includes(id) ? p.filter(x => x !== id) : [id, ...p]);
}
export function isPinned(id: string): boolean { return getPinned().includes(id); }

/* ---- Reklamlar ---- */
export function getAds(): AdCampaign[] {
  const override = read<AdCampaign[] | null>(K.ads, null);
  return override && override.length ? override : mockAds;
}
export function saveAds(ads: AdCampaign[]) { write(K.ads, ads); }

/* ---- Tüm admin verisini sıfırla ---- */
export function resetAll() {
  Object.values(K).forEach(k => { try { localStorage.removeItem(k); } catch { /* yok say */ } });
  logout();
}

/* ---- Yeni/güncel haber nesnesi üret ---- */
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export function todayTR(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function makeNewsItem(input: {
  id?: string; title: string; summary?: string; content: string[];
  category?: string; image?: string; author?: string; date?: string;
  isBreaking?: boolean; isHero?: boolean;
}): NewsItem {
  const words = input.content.join(' ').split(/\s+/).filter(Boolean).length;
  return {
    id: input.id || 'manual-' + Date.now(),
    title: input.title.trim(),
    summary: (input.summary || input.content[0] || input.title).slice(0, 220),
    content: input.content.length ? input.content : [input.title],
    category: input.category || 'Gündem',
    image: input.image?.trim() || '/haber-placeholder.svg',
    date: input.date || todayTR(),
    author: { name: input.author?.trim() || 'Söz Milletin', avatar: '/haber-placeholder.svg' },
    views: 0,
    likes: 0,
    comments: [],
    isBreaking: input.isBreaking,
    isHero: input.isHero,
    readTime: `${Math.max(1, Math.ceil(words / 200))} dk`,
    reactions: { like: 0, heart: 0, sad: 0, fire: 0 },
  };
}

/* ---- Taban haberlere admin katmanını uygula (herkese açık sitede kullanılır) ---- */
export function getMergedNews(base: NewsItem[]): NewsItem[] {
  const manual = getManualNews();
  const edits = getEdits();
  const hidden = new Set(getHidden());
  const pinned = getPinned();
  const heroId = getHeroId();

  const map = new Map<string, NewsItem>();
  for (const n of [...manual, ...base]) if (!map.has(n.id)) map.set(n.id, n);

  let list = Array.from(map.values()).map(n => (edits[n.id] ? ({ ...n, ...edits[n.id] } as NewsItem) : n));
  list = list.filter(n => !hidden.has(n.id));

  const pinnedSet = new Set(pinned);
  const heroArr = heroId ? list.filter(n => n.id === heroId) : [];
  const pinnedArr = pinned
    .map(id => list.find(n => n.id === id))
    .filter((n): n is NewsItem => !!n && n.id !== heroId);
  const restArr = list.filter(n => n.id !== heroId && !pinnedSet.has(n.id));
  return [...heroArr, ...pinnedArr, ...restArr];
}
