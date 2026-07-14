import { Helmet } from 'react-helmet-async';

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
    authorName: string;
    section: string;
  };
}

export const SEO = ({
  title = 'SÖZ MİLLETİN — Son Dakika Haberler, Kocaeli ve Türkiye Gündemi',
  description = 'Kocaeli ve Türkiye gündeminden son dakika haberleri, siyaset, spor, asayiş ve magazin. Bağımsız ve tarafsız habercilik.',
  keywords = 'haber, son dakika, kocaeli, gündem, siyaset, spor, asayiş',
  image = 'https://sozmilletin.com/haber-placeholder.svg', // Ideal to use absolute URL
  url = 'https://sozmilletin.com',
  type = 'website',
  articleData
}: SEOProps) => {
  // Ensure absolute image URL
  const absoluteImage = image.startsWith('http') ? image : `https://sozmilletin.com${image.startsWith('/') ? image : `/${image}`}`;

  // Structured Data (JSON-LD)
  const schemaOrgJSONLD: any = [
    {
      '@context': 'http://schema.org',
      '@type': 'Organization',
      name: 'Söz Milletin',
      url: 'https://sozmilletin.com',
      logo: 'https://sozmilletin.com/favicon.svg'
    }
  ];

  if (type === 'article' && articleData) {
    schemaOrgJSONLD.push({
      '@context': 'http://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      },
      headline: title,
      image: [absoluteImage],
      datePublished: articleData.publishedTime,
      dateModified: articleData.publishedTime,
      author: {
        '@type': 'Person',
        name: articleData.authorName
      },
      publisher: {
        '@type': 'Organization',
        name: 'Söz Milletin',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sozmilletin.com/favicon.svg'
        }
      },
      description: description
    });
  }

  return (
    <Helmet>
      {/* Standart Meta Etiketleri */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* OpenGraph / Facebook Meta Etiketleri */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content="Söz Milletin" />

      {/* Twitter Card Meta Etiketleri */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Article Meta Etiketleri */}
      {type === 'article' && articleData && (
        <>
          <meta property="article:published_time" content={articleData.publishedTime} />
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
