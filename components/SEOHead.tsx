import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOHeadProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
}

const defaultSEO = {
    siteName: 'Allahu Akbar Shop',
    title: 'Allahu Akbar Shop - Productos Premium Peruanos',
    description: 'Tienda virtual con los mejores productos peruanos: ropa de algodón pima, artesanías, calzado y accesorios. Envíos a todo el Perú.',
    image: '/og-image.jpg',
    url: 'https://allahuakbarshop.pe',
    locale: 'es_PE',
    twitterHandle: '@allahuakbarshop',
};

export const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    image,
    url,
    type = 'website',
}) => {
    const pageTitle = title
        ? `${title} | ${defaultSEO.siteName}`
        : defaultSEO.title;
    const pageDescription = description || defaultSEO.description;
    const pageImage = image || defaultSEO.image;
    const pageUrl = url || defaultSEO.url;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{pageTitle}</title>
            <meta name="title" content={pageTitle} />
            <meta name="description" content={pageDescription} />
            <meta name="language" content="es-PE" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={pageImage} />
            <meta property="og:locale" content={defaultSEO.locale} />
            <meta property="og:site_name" content={defaultSEO.siteName} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={pageUrl} />
            <meta property="twitter:title" content={pageTitle} />
            <meta property="twitter:description" content={pageDescription} />
            <meta property="twitter:image" content={pageImage} />

            {/* Additional SEO */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <link rel="canonical" href={pageUrl} />

            {/* Geo Tags for Peru */}
            <meta name="geo.region" content="PE" />
            <meta name="geo.placename" content="Perú" />
        </Helmet>
    );
};

// Helmet Provider wrapper - use at app root
export const SEOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <HelmetProvider>{children}</HelmetProvider>
);

export default SEOHead;
