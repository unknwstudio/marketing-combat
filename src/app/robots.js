import { SITE_URL } from '@/lib/site'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // NOTE: /play is intentionally NOT disallowed here. It carries a page-level
      // `noindex` (see src/app/play/page.jsx); a robots.txt Disallow would stop
      // crawlers from ever FETCHING the page, so they'd never see that noindex and
      // the URL could still surface as a bare "blocked" result. Allowing the crawl
      // lets the noindex actually take effect.
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
