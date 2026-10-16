import { BRAND, DIVISIONS, type DivisionId } from '@/core/brand';
import { I } from './icons';
import { Link } from './Link';
import { WORDMARK } from './wordmark';

/*
 * Solagene brand. Solagene is the company; Vedicgen (its school) and Nayancode (its software) are sub-brands that
 * always appear under the Solagene logo. The mark is the official Solagene logo (a DNA double-helix ribbon in an "S", with two
 * dots). public/brand/solagene-mark.svg keeps the exact artwork: a traced vector outline clipping the original colours; the
 * site shows a light WebP render of it (public/brand/solagene-mark.webp, and solagene-mark-sm.webp, 132 px tall, for marks up
 * to 44 px so small logos don't download the full image). The wordmark is drawn as outlines so it can take
 * any colour. To update the logo, replace those files and src/site/wordmark.ts, then run `npm run og`.
 */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;

export function SolageneMark({ size = 32, className = '', alt = '' }: { size?: number; className?: string; alt?: string }) {
  return <img src={asset(size <= 44 ? '/brand/solagene-mark-sm.webp' : '/brand/solagene-mark.webp')} width={Math.round(size * 0.6225)} height={size} alt={alt} className={`mark ${className}`} decoding="async" />;
}

export function Wordmark({ height = 16, className = '' }: { height?: number; className?: string }) {
  return (
    <svg className={`wordmark ${className}`} viewBox={`0 -${WORDMARK.h} ${WORDMARK.w} ${WORDMARK.h}`} height={height} width={Math.round((height * WORDMARK.w) / WORDMARK.h)} aria-hidden="true" focusable="false">
      <path d={WORDMARK.d} fill="currentColor" />
    </svg>
  );
}

const SUB_ICON = { vedicgen: I.Book, nayancode: I.Code } as const;
export function SubMark({ div, size = 16 }: { div: DivisionId; size?: number }) { const Ic = SUB_ICON[div]; return <span className={`submark submark--${div}`}><Ic width={size} height={size} /></span>; }

/**
 * Logo lockup: mark + SOLAGENE wordmark. With `div`, the sub-brand name follows a divider ("SOLAGENE | Vedicgen").
 * `tagline` shows "Research · Education · Innovation" under the wordmark, as in the official logo.
 */
export function Logo({ size = 34, to, div, tagline, className = '' }: { size?: number; to?: string; div?: DivisionId; tagline?: boolean; className?: string }) {
  const inner = (
    <>
      <SolageneMark size={size} />
      <span className="logo-text">
        <Wordmark height={Math.round(size * 0.4)} />
        {tagline && !div && <span className="logo-tag">Research · Education · Innovation</span>}
      </span>
      {div && <span className={`logo-sub logo-sub--${div}`}><span className="logo-sub-name">{DIVISIONS[div].name}</span><span className="logo-sub-role">{div === 'vedicgen' ? 'School' : 'Software'}</span></span>}
    </>
  );
  const cls = `logo ${div ? `logo--${div}` : ''} ${className}`;
  const label = div ? `${BRAND.name} ${DIVISIONS[div].name}, ${DIVISIONS[div].role}` : `${BRAND.name}, home`;
  return to ? <Link to={to} className={cls} aria-label={label}>{inner}</Link> : <span className={cls} role="img" aria-label={label}>{inner}</span>;
}
