const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const crypto = require('crypto');

const parser = new Parser({
  // Takılan/engelli kaynaklar 15 saniyede pes etsin (varsayılan 60sn çok uzun)
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const FEEDS = [
  {
    name: 'Kocaeli Gündem',
    url: 'https://kocaeligundem.com/rss',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100'
  },
  {
    name: 'Darıca Gazetesi',
    url: 'https://www.daricagazetesi.com.tr/rss',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=100'
  },
  {
    name: 'Gebze Hürses',
    url: 'https://www.gebzehurses.com/rss.xml',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100'
  },
  {
    name: 'Hürriyet',
    url: 'https://www.hurriyet.com.tr/rss/gundem',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=100'
  },
  {
    name: 'Ensonhaber',
    url: 'https://www.ensonhaber.com/rss/ensonhaber.xml',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100'
  },
  {
    name: 'Haberler.com',
    url: 'http://rss.haberler.com/rss.asp',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=100'
  },
  {
    name: 'Mynet',
    url: 'https://www.mynet.com/haber/rss/sondakika',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100'
  }
];

const OUTPUT_FILE = path.join(__dirname, '../src/data/scrapedNews.json');

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

  // Önce sitenin kendi kategorilerine bak
  for (const cat of feedCategories) {
    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => cat.includes(kw))) {
        return key;
      }
    }
  }

  // Sonra başlığa bak
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => title.includes(kw))) {
      return key;
    }
  }

  // Sonra özete bak
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => summary.includes(kw))) {
      return key;
    }
  }

  // Hiçbir şey bulunamazsa varsayılan olarak "Siyaset" ata
  return 'Siyaset';
}

// Kategoriye özel varsayılan görsel havuzları.
// RSS'te görsel bulunamazsa, herkese aynı fotoğrafı vermek yerine
// haberin kimliğine göre havuzdan deterministik bir görsel seçilir.
const DEFAULT_IMAGE_POOLS = {
  Siyaset: [
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800'
  ],
  Asayiş: [
    'https://images.unsplash.com/photo-1513828742140-ccaa34f3aba0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584452006050-32c39bf60e2b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1591189863430-ab87e120f312?auto=format&fit=crop&q=80&w=800'
  ],
  Spor: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=800'
  ],
  Magazin: [
    'https://images.unsplash.com/photo-1482440308425-276ad0f28b19?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800'
  ]
};

// Görsel ayıklama mantığı
function extractImage(item, category) {
  // 1. Enclosure kontrolü
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }

  // 2. Medya içeriği kontrolü
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }

  // 3. İçerik veya description içindeki img tag'ini ara
  const htmlContent = item.content || item.description || '';
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = htmlContent.match(imgRegex);
  if (match && match[1]) {
    return match[1];
  }

  // 4. Varsayılan görsel havuzundan deterministik seçim (kategoriye özel)
  const pool = DEFAULT_IMAGE_POOLS[category] || DEFAULT_IMAGE_POOLS.Siyaset;
  // Haberin bağlantı/başlığından türeyen sabit bir hash ile havuz indeksini seç:
  // aynı haber her taramada aynı görseli alır, farklı haberler çeşitlenir.
  const seed = crypto.createHash('md5').update(item.link || item.title || '').digest('hex');
  const index = parseInt(seed.slice(0, 8), 16) % pool.length;
  return pool[index];
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

// Tahmini okuma süresi
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
      console.log(`-> ${feedSource.name} kaynağından ${feed.items.length} haber okundu.`);
      
      let sourceCount = 0;
      feed.items.forEach(item => {
        // Benzersiz kimlik (id) URL tabanlı üretilir
        const id = 'scraped-' + crypto.createHash('md5').update(item.link || item.title).digest('hex');
        
        const category = determineCategory(item);
        const image = extractImage(item, category);
        
        // Muhabir / Yazar bilgisi ayıklama
        let authorName = item.creator || item['dc:creator'] || item.author || feedSource.name;
        if (authorName.includes('@') || authorName.length < 3) {
          authorName = feedSource.name;
        }

        // HTML etiketlerinden arındırılmış temiz özet
        let summary = (item.contentSnippet || item.content || '').replace(/<[^>]*>/g, '').substring(0, 180).trim();
        if (summary.length >= 180) summary += '...';

        // Temizlenmiş haber paragrafları
        const rawContent = item.content || item.description || '';
        const paragraphs = rawContent
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .split('\n')
          .map(p => p.trim())
          .filter(p => p.length > 30);

        if (paragraphs.length === 0 && summary) {
          paragraphs.push(summary);
        }

        const newsItem = {
          id,
          title: item.title,
          summary: summary || item.title,
          content: paragraphs.length > 0 ? paragraphs : [item.title],
          category,
          image,
          date: formatDate(item.pubDate),
          timestamp: new Date(item.pubDate || Date.now()).getTime(),
          author: {
            name: authorName,
            avatar: feedSource.avatar
          },
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
        };

        allScrapedNews.push(newsItem);
      });
      
    } catch (error) {
      console.error(`HATA: ${feedSource.name} taranırken sorun oluştu:`, error.message);
    }
  }

  // Mevcut haberleri oku
  let existingNews = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingNews = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    } catch (e) {
      console.error('Mevcut haber dosyası okunamadı, yeniden yazılacak:', e.message);
    }
  }

  // Yeni haberleri mevcutlarla birleştir
  const newsMap = new Map();
  existingNews.forEach(item => newsMap.set(item.id, item));
  allScrapedNews.forEach(item => newsMap.set(item.id, item));
  
  const finalNewsList = Array.from(newsMap.values());

  // En yeni haberlerin en başta kalması için tarihe göre sıralama
  finalNewsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Performans ve SEO için sadece en güncel 200 haberi sakla
  const optimizedNewsList = finalNewsList.slice(0, 200);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(optimizedNewsList, null, 2), 'utf-8');
  console.log(`[${new Date().toISOString()}] Bot başarıyla ${optimizedNewsList.length} adet haberi (maksimum 200 limitli) kaydetti.`);
}

if (process.argv.includes('--daemon')) {
  scrapeAll();
  console.log('Bot DAEMON modunda çalışıyor. Her 5 dakikada bir tarama yapacak...');
  setInterval(scrapeAll, 5 * 60 * 1000);
} else {
  // Tek seferlik çalıştırma: iş bitince süreci hemen kapat.
  // (Engellenen kaynakların açık kalan bağlantıları node'u bekletmesin diye.)
  scrapeAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Tarama sırasında beklenmeyen hata:', err);
      process.exit(1);
    });
}
