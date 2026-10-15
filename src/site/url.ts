import { BRAND } from '@/core/brand';
/** Absolute canonical URL for a site path (always with a trailing slash). */
export const abs = (path: string) => { const p = path.replace(/\/+$/, '') || '/'; return BRAND.siteUrl + (p === '/' ? '/' : `${p}/`); };
