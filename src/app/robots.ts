import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://kokyo-ethics.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/chemistry/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
