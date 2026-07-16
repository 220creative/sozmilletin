import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME, absoluteUrl } from '../config';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  // Article specific JSON-LD fields
  articleData?: {
    publishedTime: string;
    modifiedTime?: string;
    authorName: string;
    section: string;
  };
}

export const SEO = ({
  title = 'SÖZ MİLLETİN — Son Dakika Haberler, Kocaeli ve Türkiye Gündemi',
  description = 'Kocaeli ve Türkiye gündeminden son dakika haberleri, siyaset, spor, asayiş ve magazin. Bağımsız ve tarafsız habercilik.',
  keywords = 'haber, son dakika, kocaeli, gündem, siyaset, spor, asayiş',
  image = `${SITE_URL}/haber-placeholder.svg`,
  url = SITE_URL,
  type = 'website',
  articleData
}: SEOProps) => {
  // Mutlak görsel URL'si (OG/Twitter kartları mutlak adres ister)
  const absoluteImage = absoluteUrl(image);

  // Structured Data (JSON-LD)
  const schemaOrgJSONLD: any = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`
    }
  ];

  if (type === 'article' && articleData) {
    schemaOrgJSONLD.push({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      },
      headline: title.length > 110 ? title.slice(0, 107) + '…' : title,
      image: [absoluteImage],
      datePublished: articleData.publishedTime,
      dateModified: articleData.modifiedTime || articleData.publishedTime,
      author: {
        '@type': 'Organization',
        name: articleData.authorName,
        url: SITE_URL
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/favicon.svg`
        }
      },
      description: description
    });
  }

  return (
    <Helmet>
      {/* Standart Meta Etiketleri */}
      <html lang="tr" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* OpenGraph / Facebook Meta Etiketleri */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card Meta Etiketleri */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Article Meta Etiketleri */}
      {type === 'article' && articleData && (
        <>
          <meta property="article:published_time" content={articleData.publishedTime} />
          <meta property="article:modified_time" content={articleData.modifiedTime || articleData.publishedTime} />
          <meta property="article:author" content={articleData.authorName} />
          <meta property="article:section" content={articleData.section} />
        </>
      )}

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
    </Helmet>
  );
};
