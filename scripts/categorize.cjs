/**
 * Kategori belirleme mantığı — tek kaynak.
 * Hem canlı scraper (scrapeNews.cjs) hem de tek seferlik yeniden-kategorize
 * betiği (recategorize.cjs) buradan kullanır; böylece mantık iki yerde
 * ayrışmaz (drift olmaz).
 *
 * Not: "Siyaset" listesi 'başkan', 'bakan', 'parti' gibi çok genel kelimeler
 * içerdiğinden, eşlemede bilinçli olarak EN SONA konur. Böylece "Bakan X
 * ekonomi açıklaması" gibi haberler önce daha spesifik kategoriye (Ekonomi)
 * düşer, generic kelime yüzünden Siyaset'e kaçmaz.
 */

// Kategori kelime eşleme haritası (Siyaset kasıtlı olarak en sonda)
const CATEGORY_KEYWORDS = {
  Asayiş: ['asayiş', 'polis', 'kaza', 'yangın', 'cinayet', 'hırsızlık', 'gözaltı', 'adliye', 'jandarma', 'baskın', 'tutuklama', 'operasyon', 'narkotik', 'öldü', 'yaralı'],
  Spor: ['spor', 'futbol', 'kocaelispor', 'gebzespor', 'darıcaspor', 'maç', 'gol', 'lig', 'transfer', 'basketbol', 'voleybol', 'stad', 'antrenman'],
  Ekonomi: ['ekonomi', 'döviz', 'altın', 'dolar', 'euro', 'borsa', 'faiz', 'merkez bankası', 'enflasyon', 'zam', 'fiyat', 'piyasa', 'ihracat', 'ithalat', 'şirket', 'kredi'],
  Magazin: ['magazin', 'ünlüler', 'sanat', 'konser', 'etkinlik', 'sinema', 'tiyatro', 'oyuncu', 'dizi', 'şarkıcı', 'festival', 'sergi', 'aşk', 'evlilik', 'boşanma'],
  Siyaset: ['siyaset', 'politika', 'meclis', 'belediye', 'ak parti', 'akp', 'chp', 'mhp', 'seçim', 'aday', 'başkan', 'bakan', 'vali', 'kaymakam', 'parti', 'imar'],
};

// Kategori belirleme mantığı
function determineCategory(item) {
  const title = String(item.title || '').toLowerCase();
  // content, canlı scraper'da string; kaydedilmiş veride paragraf dizisi olabilir.
  const rawSummary = item.contentSnippet || item.summary || item.content || '';
  const summary = (Array.isArray(rawSummary) ? rawSummary.join(' ') : String(rawSummary)).toLowerCase();
  const feedCategories = (item.categories || []).map(c => {
    if (typeof c === 'string') return c.toLowerCase();
    if (c && typeof c === 'object' && c._) return c._.toLowerCase();
    if (c && typeof c === 'object' && c.name) return c.name.toLowerCase();
    return '';
  }).filter(Boolean);

  // Hassas konuları koruma altına al
  if (title.includes('15 temmuz') || summary.includes('15 temmuz') || title.includes('şehit')) {
    return 'Gündem';
  }

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
  // Hiçbir kelime eşleşmezse tarafsız "Gündem"e düşer (eskiden yanlışlıkla "Siyaset"ti).
  return 'Gündem';
}

module.exports = { CATEGORY_KEYWORDS, determineCategory };
