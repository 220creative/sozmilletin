/**
 * Dinamik sitemap üreticisi.
 * src/data/scrapedNews.json'daki tüm haberleri okuyup public/sitemap.xml üretir.
 * Her build öncesi (prebuild) ve her 3 saatlik scrape sonrası tazelenir.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://xn--szmilletin-ecb.com';
const NEWS_FILE = path.join(__dirname, '..', 'src', 'data', 'scrapedNews.json');
const OUT_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function isoDate(ts) {
  const d = ts ? new Date(Number(ts)) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

let news = [];
try {
  news = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf-8'));
} catch (e) {
  console.error('sitemap: haber dosyası okunamadı:', e.message);
}

const now = new Date().toISOString();
const urls = [];

// Ana sayfa
urls.push(`  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>`);

// Haberler
for (const item of news) {
  if (!item || !item.id) continue;
  urls.push(
    `  <url>\n    <loc>${SITE_URL}/haber/${xmlEscape(item.id)}</loc>\n    <lastmod>${isoDate(item.timestamp)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

fs.writeFileSync(OUT_FILE, xml, 'utf-8');
console.log(`sitemap.xml üretildi: ${urls.length} URL (${OUT_FILE})`);
