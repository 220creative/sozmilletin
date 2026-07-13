export interface Comment {
  id: string;
  user: string;
  content: string;
  date: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: string;
  image: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  views: number;
  likes: number;
  comments: Comment[];
  isBreaking?: boolean;
  isHero?: boolean;
  readTime: string;
  reactions: {
    like: number;
    heart: number;
    sad: number;
    fire: number;
  };
}

export interface AdCampaign {
  id: string;
  type: 'leaderboard' | 'sidebar-rect' | 'sidebar-tall' | 'native';
  title: string;
  description?: string;
  imageUrl?: string;
  destinationUrl: string;
  ctaText?: string;
}

export const CATEGORIES = [
  'Tümü',
  'Siyaset',
  'Magazin',
  'Asayiş',
  'Spor'
];

export const mockNews: NewsItem[] = [
  {
    id: 'hero-1',
    title: 'Milletin Sesi Kürsüde: Yeni Demokratik Katılım Platformu Söz Milletin Yayında!',
    summary: 'Türkiye genelinde vatandaşların fikirlerini doğrudan paylaşabileceği, yerel ve ulusal sorunları dile getirebileceği yeni nesil bağımsız medya platformu Söz Milletin bugün kapılarını açtı.',
    content: [
      'Geleneksel medya kanallarının ötesinde, doğrudan halkın sesini yansıtmayı amaçlayan "Söz Milletin" platformu, bugün itibarıyla yayın hayatına başladı. Haber sitesi olmanın ötesinde demokratik bir kürsü görevi görecek olan portal, vatandaşların kendi çevrelerindeki gelişmeleri aktarmalarına ve kamuoyu oluşturmalarına olanak sağlıyor.',
      'Platformun kurucu ekibi, "Söz Milletin, sadece haberleri okuduğunuz değil, aynı zamanda o haberlerin bir parçası olduğunuz bir yapıdır. Amacımız, halkın gerçek gündemini hiçbir filtreye uğratmadan, tarafsız ve şeffaf bir şekilde kamuoyuna sunmaktır" açıklamasında bulundu.',
      'Sitede yer alan özel oylama ve yorum sistemleri sayesinde, okuyucular haberlere sadece pasif birer takipçi olarak kalmayıp, fikirlerini paylaşabiliyor ve tepkilerini dile getirebiliyorlar. Tamamen mobil uyumlu tasarlanan platform, akıllı telefonlardan anlık haber takibi ve içerik üretimi yapılmasına imkan tanıyor.'
    ],
    category: 'Gündem',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
    date: '27 Haziran 2026',
    author: {
      name: 'Ahmet Yılmaz',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
    },
    views: 12450,
    likes: 382,
    isHero: true,
    isBreaking: true,
    readTime: '3 dk',
    reactions: { like: 120, heart: 85, sad: 2, fire: 64 },
    comments: [
      { id: 'c1', user: 'Mehmet Kaya', content: 'Sonunda halkın sesini duyurabileceği bağımsız bir platform kurulmuş. Hayırlı olsun!', date: 'Bugün, 12:45' },
      { id: 'c2', user: 'Zeynep Demir', content: 'Tasarımı çok modern ve akıcı olmuş, özellikle mobil görünümü harika görünüyor.', date: 'Bugün, 13:10' }
    ]
  },
  {
    id: 'news-2',
    title: 'Merkez Bankası Yıl Ortası Enflasyon ve Büyüme Raporunu Açıkladı',
    summary: 'Para Politikası Kurulu toplantısının ardından yapılan açıklamada, yılın ikinci yarısı için ekonomik istikrar ve enflasyon hedefleri revize edildi.',
    content: [
      'Merkez Bankası, bugün düzenlediği basın toplantısıyla 2026 yılı ortası enflasyon ve büyüme tahminlerini kamuoyuyla paylaştı. Sunumda, küresel piyasalardaki dalgalanmaların iç piyasaya etkileri ve alınan sıkılaşma tedbirlerinin meyveleri masaya yatırıldı.',
      'Banka Başkanı, enflasyonla mücadelenin kararlılıkla süreceğini vurgulayarak, "Orta vadeli program hedeflerimize bağlıyız. Cari dengedeki iyileşme ve rezervlerimizdeki artış, ekonomimizin dayanıklılığını artırmaktadır" dedi.',
      'Ekonomistler, açıklanan verilerin piyasa beklentileriyle uyumlu olduğunu belirtirken, önümüzdeki aylarda faiz politikalarında radikal bir değişiklik beklenmediğini ifade ediyorlar.'
    ],
    category: 'Ekonomi',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    date: '27 Haziran 2026',
    author: {
      name: 'Selin Doğan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    },
    views: 8920,
    likes: 194,
    isBreaking: true,
    readTime: '4 dk',
    reactions: { like: 75, heart: 12, sad: 18, fire: 8 },
    comments: [
      { id: 'c3', user: 'Ekonomist_34', content: 'Sıkı para politikası devam etmeli ama esnafın durumu da göz önünde bulundurulmalı.', date: 'Bugün, 11:30' }
    ]
  },
  {
    id: 'news-3',
    title: 'Yerli Yapay Zeka Modelimiz "MilliZeka 2.0" Tanıtıldı',
    summary: 'TÜBİTAK ve yerli teknoloji firmalarının iş birliğiyle geliştirilen Türkçe dil modeli, yüksek doğruluk oranı ve sektörel çözümleriyle göz dolduruyor.',
    content: [
      'Yerli yapay zeka ekosisteminde tarihi bir gün yaşandı. Tamamen Türkçe veri kümeleriyle eğitilen ve ülkemizin dilsel normlarına uygun olarak tasarlanan "MilliZeka 2.0", geniş katılımlı bir lansmanla duyuruldu.',
      'Yapay zeka modeli, tıptan hukuka, eğitimden finansa kadar birçok alanda özelleşmiş alt modeller sunuyor. Güvenli veri işleme altyapısı sayesinde kamu kurumlarının ve özel şirketlerin veri gizliliği korunarak entegrasyon sağlanabilecek.',
      'Lansmanda yapılan canlı demoda, MilliZeka 2.0 karmaşık hukuki metinleri analiz etti ve Türkçe edebi metinleri yüksek doğrulukla özetledi. Projenin açık kaynak kodlu sürümünün yakında geliştiricilerle paylaşılacağı müjdelendi.'
    ],
    category: 'Teknoloji',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    date: '26 Haziran 2026',
    author: {
      name: 'Murat Koç',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'
    },
    views: 11200,
    likes: 512,
    readTime: '3 dk',
    reactions: { like: 240, heart: 180, sad: 1, fire: 220 },
    comments: [
      { id: 'c4', user: 'TechLover', content: 'Harika bir gelişme! Açık kaynak kodlu olmasını sabırsızlıkla bekliyorum.', date: 'Dün, 17:40' }
    ]
  },
  {
    id: 'news-4',
    title: 'Milli Sporcumuzdan Atletizmde Altın Madalya!',
    summary: 'Avrupa Atletizm Şampiyonası erkekler 110 metre engellide yarışan temsilcimiz, müthiş bir deparla altın madalyanın sahibi oldu ve rekor kırdı.',
    content: [
      'Milli atletimiz, Avrupa Atletizm Şampiyonası finalinde göğsümüzü kabarttı. Zorlu rakiplerinin arasından sıyrılarak 13.08\'lik derecesiyle hem Türkiye rekorunu yeniledi hem de Avrupa şampiyonu oldu.',
      'Yarış sonrası bayrağımızla tur atan şampiyon sporcu, gözyaşları içinde "Bu madalyayı beni her zaman destekleyen aziz milletime armağan ediyorum. Çok çalıştık, inandık ve başardık" dedi.',
      'Gençlik ve Spor Bakanlığı şampiyon sporcu için tebrik mesajı yayınlarken, sporcunun memleketinde büyük sevinç gösterileri düzenlendi.'
    ],
    category: 'Spor',
    image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&q=80&w=800',
    date: '26 Haziran 2026',
    author: {
      name: 'Can Arslan',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100'
    },
    views: 15400,
    likes: 890,
    isBreaking: true,
    readTime: '2 dk',
    reactions: { like: 450, heart: 320, sad: 0, fire: 400 },
    comments: [
      { id: 'c5', user: 'BayrakAşığı', content: 'Tüylerim diken diken oldu, helal olsun sana aslan parçası!', date: 'Dün, 20:15' }
    ]
  },
  {
    id: 'news-5',
    title: 'Uzay Ajansı: "Ay Üssü Projesi İlk Aşama Çalışmaları Başarıyla Tamamlandı"',
    summary: 'Uluslararası ortaklıkla yürütülen Ay yüzeyi araştırma istasyonu projesinde, yerli ekipmanların vakum ve sıcaklık testleri başarıyla sonuçlandı.',
    content: [
      'Türkiye Uzay Ajansı (TUA), uluslararası ortak projeler kapsamında Ay yüzeyinde kurulacak bilimsel araştırma üssü projesinin kritik aşamalarının başarıyla tamamlandığını duyurdu.',
      'Geliştirilen yüksek mukavemetli yerli kompozit malzemeler ve sensör sistemleri, uzay koşullarını simüle eden vakum odalarında test edildi. Ekipmanların -180 ile +120 derece arasındaki ekstrem sıcaklıklarda tam kararlılıkla çalıştığı belgelendi.',
      'Projenin ikinci aşamasında, prototiplerin gelecek yıl fırlatılması planlanan insansız test kapsülüne entegre edilmesi ve yörünge testlerinin yapılması hedefleniyor.'
    ],
    category: 'Teknoloji',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    date: '25 Haziran 2026',
    author: {
      name: 'Murat Koç',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'
    },
    views: 7420,
    likes: 310,
    readTime: '3 dk',
    reactions: { like: 180, heart: 95, sad: 1, fire: 110 },
    comments: []
  },
  {
    id: 'news-6',
    title: 'Yeni İklim Yasası Meclis Komisyonundan Geçti: Karbon Vergisi Geliyor',
    summary: 'Çevre koruma ve yeşil enerji dönüşümünü hızlandırmayı hedefleyen yeni yasa teklifi, sanayi tesislerine kademeli emisyon sınırlandırması getiriyor.',
    content: [
      'Türkiye Büyük Millet Meclisi Çevre Komisyonu, uzun süredir üzerinde çalışılan İklim Değişikliğiyle Mücadele Kanun Teklifi\'ni kabul etti. Yasa, özellikle yüksek karbon salınımı yapan sanayi kollarına yönelik sıkı yaptırımlar içeriyor.',
      'Yeni düzenlemeye göre, sınırda karbon düzenlemesine uyum sağlamak amacıyla yerli bir emisyon ticaret sistemi (ETS) kurulacak. Tesisler, yıllık bazda belirledikleri emisyon kotalarını aştıklarında karbon vergisi ödemekle yükümlü olacak.',
      'Yeşil STK\'lar yasayı olumlu karşılamakla birlikte, hedeflerin daha da agresifleştirilmesi gerektiğini savunuyor. Sanayi odaları ise geçiş sürecinin KOBİ\'lere mali yük getirmemesi için devlet desteklerinin artırılmasını talep ediyor.'
    ],
    category: 'Politika',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800',
    date: '25 Haziran 2026',
    author: {
      name: 'Selin Doğan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    },
    views: 6500,
    likes: 120,
    readTime: '4 dk',
    reactions: { like: 60, heart: 20, sad: 15, fire: 10 },
    comments: []
  },
  {
    id: 'news-7',
    title: 'Dünya Genelinde Enerji Krizine Karşı Nükleer Enerjiye Yönelim Artıyor',
    summary: 'Avrupa ve Asya ülkeleri, fosil yakıtlardan çıkış sürecinde baz yük elektrik ihtiyacını karşılamak için yeni nesil reaktör projelerini onaylıyor.',
    content: [
      'Küresel jeopolitik gerilimler ve enerji arz güvenliği kaygıları, birçok ülkeyi temiz ve kesintisiz enerji alternatiflerini yeniden değerlendirmeye zorluyor. Bu doğrultuda, nükleer enerji yatırımları küresel ölçekte ivme kazanıyor.',
      'Fransa, İngiltere ve Çin gibi devler, mevcut reaktör ömürlerini uzatmanın yanı sıra "Küçük Modüler Reaktörler" (SMR) olarak adlandırılan yeni nesil, daha güvenli ve düşük maliyetli nükleer ünitelerin inşası için fon ayırdı.',
      'Çevreci gruplar nükleer atık yönetimi ve potansiyel kaza riskleri nedeniyle projelere karşı çıkmaya devam etse de, hükümetler sıfır karbon salınımı ile kesintisiz elektrik üretimi sağlamanın tek yolunun nükleerden geçtiğini belirtiyor.'
    ],
    category: 'Dünya',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
    date: '24 Haziran 2026',
    author: {
      name: 'Ahmet Yılmaz',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
    },
    views: 5900,
    likes: 140,
    readTime: '3 dk',
    reactions: { like: 82, heart: 15, sad: 12, fire: 5 },
    comments: []
  }
];

export const mockAds: AdCampaign[] = [
  {
    id: 'ad-top-leaderboard',
    type: 'leaderboard',
    title: 'YILDIZ PROMOSYON',
    description: 'Tüm Kurumsal ve Bireysel Promosyon Ürünlerinde Yaz Sezonuna Özel %30 İndirim Fırsatını Kaçırmayın! Tıklayın ve Katalogu İnceleyin.',
    destinationUrl: 'https://yildizpromosyon.com.tr',
    ctaText: 'Fırsatı Yakala'
  },
  {
    id: 'ad-sidebar-rect-1',
    type: 'sidebar-rect',
    title: '220 Creative Digital Agency',
    description: 'Profesyonel Web Tasarım, SEO ve Sosyal Medya Yönetimi ile İşinizi Dijital Dünyada Zirveye Taşıyın!',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
    destinationUrl: 'https://220creative.com.tr'
  },
  {
    id: 'ad-sidebar-tall-1',
    type: 'sidebar-tall',
    title: 'Söz Milletin Premium Katılım',
    description: 'Haberlerinizi ve taleplerinizi editörlerimizin incelemesine doğrudan sunmak, öncelikli yayın hakkı kazanmak ve reklamsız deneyim yaşamak için Premium üye olun. Halkın sesi bağımsız kalsın!',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=300',
    destinationUrl: '#'
  },
  {
    id: 'ad-native-1',
    type: 'native',
    title: 'Modern İş Dünyasında Tanıtımın Gücü: Promosyon Ürünlerinin Satışa Etkisi Nedir?',
    description: 'Yıldız Promosyon sponsorluğunda hazırlanan bu makalede, markaların müşteri sadakatini artırmak için kullandığı promosyonel stratejilerin geri dönüş oranları analiz ediliyor.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=200',
    destinationUrl: 'https://yildizpromosyon.com.tr',
    ctaText: 'Daha Fazla Bilgi Al'
  }
];
