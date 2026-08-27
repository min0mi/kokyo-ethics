import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://公共倫理パーフェクトマスター.com';

  const routes = [
    '',
    '/practice/speed',
    '/practice/standard',
    '/practice/matching',
    '/practice/typing',
    '/practice/recall',
    '/dictionary',
    '/ranking',
    '/badges',
    '/stats',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}

