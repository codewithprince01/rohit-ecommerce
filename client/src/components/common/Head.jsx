import { Helmet } from 'react-helmet-async';

const Head = ({ title, description, keywords, image, url }) => {
    const siteTitle = 'Agrawal General Store';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = 'Your trusted local grocery store offering a wide range of products including daily improvements, bakery, cleaning items, and more. Quality products at best prices.';
    const defaultKeywords = 'grocery, online grocery, daily needs, bakery, cleaning items, snacks, beverages, sabalgarh, morena';
    const siteUrl = window.location.origin;
    const defaultImage = `${siteUrl}/og-image.jpg`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || window.location.href} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url || window.location.href} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={image || defaultImage} />
            
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <link rel="canonical" href={url || window.location.href} />
        </Helmet>
    );
};

export default Head;
