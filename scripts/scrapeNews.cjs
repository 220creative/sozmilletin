const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const crypto = require('crypto');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const parser = new Parser({
  // Takılan/engelli kaynaklar 15 saniyede pes etsin (varsayılan 60sn çok uzun)
  timeout: 15000,
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['image', 'imageTag'],
    ]
  },
  headers: { 'User-Agent': UA }
});

const FEEDS = [
  { name: 'Özgür Kocaeli', url: 'https://www.ozgurkocaeli.com.tr/rss', maxItems: 30 },
  { name: 'Çağdaş Kocaeli', url: 'https://www.cagdaskocaeli.com.tr/rss', maxItems: 30 },
  { name: 'Kocaeli Gazetesi', url: 'https://www.kocaeligazetesi.com.tr/rss', maxItems: 30 },
  { name: 'Darıca Gazetesi', url: 'https://www.daricagazetesi.com.tr/rss', maxItems: 30 },
  { name: 'Gebze Hürses', url: 'https://www.gebzehurses.com/rss.xml', maxItems: 30 },
  { name: 'Hürriyet', url: 'https://www.hurriyet.com.tr/rss/gundem', maxItems: 15 },
  { name: 'Ensonhaber', url: 'https://www.ensonhaber.com/rss/ensonhaber.xml', maxItems: 15 },
  { name: 'Haberler.com', url: 'http://rss.haberler.com/rss.asp', maxItems: 15 },
  { name: 'Haberler.com Darıca', url: 'https://rss.haberler.com/rss.asp?ilce=darica', maxItems: 25 },
  { name: 'Haberler.com Gebze', url: 'https://rss.haberler.com/rss.asp?ilce=gebze', maxItems: 25 },
  { name: 'Mynet', url: 'https://www.mynet.com/haber/rss/sondakika', maxItems: 15 },
  { name: 'A Spor', url: 'https://www.aspor.com.tr/rss/anasayfa.xml', maxItems: 15 },
  { name: 'Fotomaç', url: 'https://www.fotomac.com.tr/rss/anasayfa.xml', maxItems: 15 }
];

const OUTPUT_FILE = path.join(__dirname, '../src/data/scrapedNews.json');

// Görseli hiç bulunamayan haberler için markalı yer tutucu (stok/demo değil).
const PLACEHOLDER_IMAGE = '/haber-placeholder.svg';

// Kategori kelime eşleme haritası
const CATEGORY_KEYWORDS = {
  Siyaset: ['siyaset', 'politika', 'meclis', 'belediye', 'ak parti', 'akp', 'chp', 'mhp', 'seçim', 'aday', 'başkan', 'bakan', 'vali', 'kaymakam', 'parti', 'imar'],
  Asayiş: ['asayiş', 'polis', 'kaza', 'yangın', 'cinayet', 'hırsızlık', 'gözaltı', 'adliye', 'jandarma', 'baskın', 'tutuklama', 'operasyon', 'narkotik', 'öldü', 'yaralı'],
  Spor: ['spor', 'futbol', 'kocaelispor', 'gebzespor', 'darıcaspor', 'maç', 'gol', 'lig', 'transfer', 'basketbol', 'voleybol', 'stad', 'antrenman'],
  Magazin: ['magazin', 'ünlüler', 'sanat', 'konser', 'etkinlik', 'sinema', 'tiyatro', 'oyuncu', 'dizi', 'şarkıcı', 'festival', 'sergi']
};

// Kategori belirleme mantığı
function determineCategory(item) {
  const title = (item.title || '').toLowerCase();
  const summary = (item.contentSnippet || item.content || '').toLowerCase();
  const feedCategories = (item.categories || []).map(c => {
    if (typeof c === 'string') return c.toLowerCase();
    if (c && typeof c === 'object' && c._) return c._.toLowerCase();
    if (c && typeof c === 'object' && c.name) return c.name.toLowerCase();
    return '';
  }).filter(Boolean);

  for (const cat of feedCategories) {
    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => cat.includes(kw))) return key;
    }
  }
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => title.includes(kw))) return key;
  }
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => summary.includes(kw))) return key;
  }
  return 'Siyaset';
}

// --- Görsel yardımcıları ---

// URL'yi temizle ve doğrula; geçersiz/işe yaramaz görselleri ele.
function cleanImageUrl(url, base) {
  if (!url || typeof url !== 'string') return null;
  url = url.trim().replace(/&amp;/g, '&');
  if (!url || url.startsWith('data:')) return null;
  if (url.startsWith('//')) url = 'https:' + url;
  else if (url.startsWith('/') && base) {
    try { url = new URL(url, base).href; } catch { return null; }
  }
  if (!/^https?:\/\//i.test(url)) return null;
  // İkon/piksel/logo gibi işe yaramaz küçük görselleri ele
  if (/(1x1|pixel|spacer|blank\.(gif|png)|loader|loading|placeholder|default-)/i.test(url)) return null;
  return url;
}

function firstImgFromHtml(html) {
  if (!html) return null;
  const matches = html.matchAll(/<img[^>]+src=["']([^"'>]+)["']/gi);
  for (const m of matches) {
    const cleaned = cleanImageUrl(m[1]);
    if (cleaned) return cleaned;
  }
  return null;
}

function pickMedia(arr) {
  if (!arr) return null;
  const list = Array.isArray(arr) ? arr : [arr];
  for (const m of list) {
    const url = (m && m.$ && m.$.url) || (m && m.url);
    const cleaned = cleanImageUrl(url);
    if (cleaned) return cleaned;
  }
  return null;
}

// RSS öğesinden görsel URL'si çıkar (yoksa null döner — stok görsel YOK).
function extractImageFromItem(item) {
  if (item.enclosure && item.enclosure.url) {
    const c = cleanImageUrl(item.enclosure.url);
    if (c) return c;
  }
  const media = pickMedia(item.mediaContent) || pickMedia(item.mediaThumbnail) ||
                pickMedia(item['media:content']) || pickMedia(item['media:thumbnail']);
  if (media) return media;
  if (item.imageTag) {
    const c = cleanImageUrl(typeof item.imageTag === 'string' ? item.imageTag : (item.imageTag.url || (item.imageTag.$ && item.imageTag.$.url)));
    if (c) return c;
  }
  const html = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
  return firstImgFromHtml(html);
}

// Makale sayfasından tam metin + görsel çıkaran kütüphaneyi (ESM) tembel yükle
let _extractor = null;
async function getExtractor() {
  if (!_extractor) {
    const mod = await import('@extractus/article-extractor');
    _extractor = mod.extract;
  }
  return _extractor;
}

// HTML varlık kodlarını (&apos; &#39; &uuml; vb.) gerçek karakterlere çevir
function decodeEntities(str) {
  if (!str) return str;
  return String(str)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch { return _; } })
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCodePoint(parseInt(d, 10)); } catch { return _; } })
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
    .replace(/&quot;/g, '"').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&hellip;/g, '…').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&'); // &amp; en sona (çift kodlamayı doğru çözmek için)
}

// İçerik HTML'ini temiz paragraflara çevir
function htmlToParagraphs(html) {
  if (!html) return [];
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
      .replace(/<[^>]*>/g, '')
  )
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 50);
}

// Bir haberi makale sayfasından zenginleştir: tam metin + gerçek görsel.
// Başarısız olursa RSS'ten gelen içerik/görsel korunur.
async function enrichArticle(news) {
  if (!news.link) return;
  try {
    const extract = await getExtractor();
    const article = await extract(news.link, {}, { signal: AbortSignal.timeout(12000) });
    if (!article) return;
    if (article.content) {
      const paras = htmlToParagraphs(article.content);
      if (paras.length > 0) {
        news.content = paras.slice(0, 40);
        news.readTime = calculateReadTime(paras.join(' '));
      }
    }
    if (!news.image || news.image === PLACEHOLDER) {
      const img = cleanImageUrl(article.image, news.link);
      if (img) news.image = img;
    }
  } catch {
    // çıkarma başarısız — RSS içeriği/görseli kalır
  }
}

// Sınırlı eşzamanlılıkla async map (og:image istekleri sunucuyu boğmasın)
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx++;
      results[cur] = await fn(items[cur], cur);
    }
  });
  await Promise.all(workers);
  return results;
}

// Tarih formatlama
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Bugün';
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return 'Bugün';
  }
}

function calculateReadTime(text) {
  const wordCount = (text || '').split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} dk`;
}

// Ana Scraper Fonksiyonu
async function scrapeAll() {
  console.log(`[${new Date().toISOString()}] Bot haber taramaya başladı...`);

  let allScrapedNews = [];

  for (const feedSource of FEEDS) {
    try {
      console.log(`${feedSource.name} taranıyor...`);
      const feed = await parser.parseURL(feedSource.url);
      const itemsToProcess = feedSource.maxItems ? feed.items.slice(0, feedSource.maxItems) : feed.items;
      console.log(`-> ${feedSource.name} kaynağından ${feed.items.length} haber okundu, ${itemsToProcess.length} kadarı işlenecek.`);

      itemsToProcess.forEach(item => {
        const trMap = { 'ç':'c', 'ğ':'g', 'ı':'i', 'i':'i', 'ö':'o', 'ş':'s', 'ü':'u' };
        const baseSlug = (item.title || 'haber').toLowerCase().replace(/[çğıiöşü]/g, m => trMap[m]).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 70);
        const shortHash = crypto.createHash('md5').update(item.link || item.title || '').digest('hex').substring(0, 6);
        const id = `${baseSlug}-${shortHash}`;
        const category = determineCategory(item);
        const image = extractImageFromItem(item); // yoksa null

        let authorName = item.creator || item['dc:creator'] || item.author || feedSource.name;
        authorName = String(authorName);
        if (authorName.includes('@') || authorName.length < 3) authorName = feedSource.name;

        let summary = decodeEntities((item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').substring(0, 200).trim();
        if (summary.length >= 200) summary += '...';

        // Zengin içerik: önce content:encoded (genelde tam metin), sonra diğerleri
        const rawContent = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
        const paragraphs = htmlToParagraphs(rawContent).filter(p => p.length > 40);

        if (paragraphs.length === 0 && summary) paragraphs.push(summary);

        allScrapedNews.push({
          id,
          source: feedSource.name,
          link: item.link || '',
          title: decodeEntities(item.title),
          summary: summary || item.title,
          content: paragraphs.length > 0 ? paragraphs : [item.title],
          category,
          image, // null olabilir; aşağıda og:image ile doldurulacak
          date: formatDate(item.pubDate),
          timestamp: new Date(item.pubDate || Date.now()).getTime(),
          author: { name: authorName, avatar: PLACEHOLDER_IMAGE },
          views: Math.floor(Math.random() * 1500) + 100,
          likes: Math.floor(Math.random() * 80) + 5,
          readTime: calculateReadTime(rawContent),
          reactions: {
            like: Math.floor(Math.random() * 20),
            heart: Math.floor(Math.random() * 15),
            sad: Math.floor(Math.random() * 5),
            fire: Math.floor(Math.random() * 10)
          },
          comments: []
        });
      });
    } catch (error) {
      console.error(`HATA: ${feedSource.name} taranırken sorun oluştu:`, error.message);
    }
  }

  // Mevcut haberlerle birleştir
  let existingNews = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingNews = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    } catch (e) {
      console.error('Mevcut haber dosyası okunamadı, yeniden yazılacak:', e.message);
    }
  }

  const newsMap = new Map();
  existingNews.forEach(item => newsMap.set(item.id, item));
  allScrapedNews.forEach(item => newsMap.set(item.id, item));

  const finalNewsList = Array.from(newsMap.values());
  finalNewsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const sourceCounts = {};
  const uniqueTitles = new Set();
  const candidates = [];
  for (const item of finalNewsList) {
    if (uniqueTitles.has(item.title)) continue;
    uniqueTitles.add(item.title);

    const src = item.source || item.author.name;
    const feedDef = FEEDS.find(f => f.name === src || (item.source && f.name === item.source));
    const limit = feedDef ? feedDef.maxItems : 20;

    sourceCounts[src] = sourceCounts[src] || 0;
    if (sourceCounts[src] < limit) {
      candidates.push(item);
      sourceCounts[src]++;
    }
  }

  // Makale sayfasından tam metin + gerçek görsel çek.
  // Sadece içeriği zayıf ya da görseli eksik olanları zenginleştir (zaten
  // zenginleştirilmiş eski haberler tekrar işlenmesin — sonraki turlar hızlı olsun).
  const needEnrich = candidates.filter(n => n.link && (n.content.length <= 2 || !n.image || n.image === PLACEHOLDER_IMAGE));
  if (needEnrich.length > 0) {
    console.log(`${needEnrich.length} haber için makale sayfasından tam metin + görsel çekiliyor...`);
    await mapLimit(needEnrich, 6, enrichArticle);
  }

  // Görseli hâlâ olmayanlara markalı yer tutucu ata (stok/demo değil)
  let withReal = 0;
  candidates.forEach(n => {
    if (n.image && n.image !== PLACEHOLDER_IMAGE) withReal++;
    else n.image = PLACEHOLDER_IMAGE;
  });

  const optimizedNewsList = candidates;

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(optimizedNewsList, null, 2), 'utf-8');
  console.log(`[${new Date().toISOString()}] Bot ${optimizedNewsList.length} haberi kaydetti (gerçek görselli: ${withReal}, yer tutuculu: ${candidates.length - withReal}).`);
}

if (process.argv.includes('--daemon')) {
  scrapeAll();
  console.log('Bot DAEMON modunda çalışıyor. Her 5 dakikada bir tarama yapacak...');
  setInterval(scrapeAll, 5 * 60 * 1000);
} else {
  scrapeAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Tarama sırasında beklenmeyen hata:', err);
      process.exit(1);
    });
}
