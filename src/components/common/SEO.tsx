import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'property';
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website', 
  structuredData
}) => {
  const fullTitle = title.includes('ElijahRealtor') ? title : `${title} | ElijahRealtor`;
  const defaultImage = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
  const defaultKeywords = 'real estate, property, Kenya, Nairobi, buy, sell, rent, apartments, houses, commercial';

  // Organization structured data
  const orgStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ElijahRealtor',
    url: url || window.location.href,
    logo: image || defaultImage,
    sameAs: [
      'https://www.facebook.com/',
      'https://www.instagram.com/',
      'https://www.linkedin.com/'
    ],
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: '+254700000000',
      contactType: 'customer service',
      areaServed: 'KE',
      availableLanguage: ['English', 'Swahili']
    }]
  };

  // WebSite structured data
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ElijahRealtor',
    url: url || window.location.href,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url || window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || window.location.href} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ElijahRealtor" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="ElijahRealtor" />
      <link rel="canonical" href={url || window.location.href} />
      {/* Structured Data: Organization */}
      <script type="application/ld+json">{JSON.stringify(orgStructuredData)}</script>
      {/* Structured Data: WebSite */}
      <script type="application/ld+json">{JSON.stringify(websiteStructuredData)}</script>
      {/* Additional Structured Data if provided */}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
};

export default SEO;