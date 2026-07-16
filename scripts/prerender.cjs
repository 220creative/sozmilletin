/**
 * Build sonrası (postbuild) prerender.
 * dist/index.html şablonunu alır ve her haber için OG/Twitter/canonical/JSON-LD
 * etiketleri <head>'e gömülü statik bir dist/haber/{id}/index.html üretir.
 *
 * Neden: Site istemci-render'lı SPA. Facebook/WhatsApp/X/Telegram botları JS
 * çalıştırmaz; react-helmet ile basılan etiketleri göremez. Bu script sayesinde
 * paylaşılan her haber linkinde doğru başlık + görsel + açıklama önizlemesi çıkar
 * ve Googlebot da metaları anında görür. Kullanıcı SPA'yı normal şekilde alır
 * (aynı sayfa yüklenince React devralır).
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://xn--szmilletin-ecb.com';
const SITE_NAME = 'Söz Milletin';
const DIST = path.join(__dirname, '..', 'dist');
const TEMPLATE = path.join(DIST, 'index.html');
const NEWS_FILE = path.join(__dirname, '..', 'src', 'data', 'scrapedNews.json');

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function absImage(img) {
  if (!img) return `${SITE_URL}/haber-placeholder.svg`;
  return String(img).startsWith('http') ? img : `${SITE_URL}${String(img).startsWith('/') ? '' : '/'}${img}`;
}

function isoDate(ts) {
  const d = ts ? new Date(Number(ts)) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function headFor(item) {
  const url = `${SITE_URL}/haber/${item.id}`;
  const title = (item.seoTitle && item.seoTitle.trim()) || `${item.title} — SÖZ MİLLETİN`;
  const descRaw = (item.seoDescription && item.seoDescription.trim()) || item.summary || item.title || '';
  const desc = descRaw.length > 200 ? descRaw.slice(0, 197) + '…' : descRaw;
  const image = absImage(item.image);
  const published = isoDate(item.timestamp);
  const author = (item.author && item.author.name) || SITE_NAME;
  const section = item.category || 'Gündem';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: item.title && item.title.length > 110 ? item.title.slice(0, 107) + '…' : item.title,
    image: [image],
    datePublished: published,
    dateModified: published,
    author: { '@type': 'Organization', name: author, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    description: desc,
  };

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="tr_TR" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta property="article:published_time" content="${esc(published)}" />`,
    `<meta property="article:author" content="${esc(author)}" />`,
    `<meta property="article:section" content="${esc(section)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join('\n    ');
}

// --- Ana akış ---
if (!fs.existsSync(TEMPLATE)) {
  console.error('prerender: dist/index.html bulunamadı, build çalıştı mı?');
  process.exit(0);
}

const template = fs.readFileSync(TEMPLATE, 'utf-8');
const MARKER = /<!--SEO_START-->[\s\S]*?<!--SEO_END-->/;

if (!MARKER.test(template)) {
  console.error('prerender: SEO_START/SEO_END marker bulunamadı, atlanıyor.');
  process.exit(0);
}

let news = [];
try {
  news = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf-8'));
} catch (e) {
  console.error('prerender: haber dosyası okunamadı:', e.message);
  process.exit(0);
}

let count = 0;
for (const item of news) {
  if (!item || !item.id) continue;
  const html = template.replace(MARKER, headFor(item));
  const dir = path.join(DIST, 'haber', item.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  count++;
}

console.log(`prerender: ${count} haber sayfası üretildi (dist/haber/{id}/index.html).`);
