// Sitenin kanonik adresi. Canlı domain Türkçe 'sözmilletin.com' — crawler'lar
// ve tutarlılık için Punycode (ASCII) biçimini kullanıyoruz. Tek kaynak burası;
// SEO, canonical, OpenGraph, JSON-LD ve sitemap hep bunu kullanır.
export const SITE_URL = 'https://xn--szmilletin-ecb.com';

export const SITE_NAME = 'Söz Milletin';

// Disqus yorum sistemi kısa adı (shortname). Disqus hesabı açıp forum
// oluşturduktan sonra buraya kısa adı yaz (ör. 'sozmilletin'). Boş kaldığı
// sürece site yerel (tarayıcıya özel) yorum sistemine düşer.
export const DISQUS_SHORTNAME = '';

// Bir haberin tam (mutlak) adresini üretir.
export const articleUrl = (id: string) => `${SITE_URL}/haber/${id}`;

// Göreli bir yolu mutlak adrese çevirir (OG görselleri için).
export const absoluteUrl = (path: string) =>
  path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
