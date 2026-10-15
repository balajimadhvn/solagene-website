import { forwardRef } from 'react';
import { Link as RouterLink, NavLink as RouterNavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';

/**
 * Every public URL ends with a slash. GitHub Pages serves /path/ straight from path/index.html, while /path costs a
 * redirect, so internal links always point at the slash form (and canonical URLs, the sitemap and structured data
 * use it too). Files (anything with an extension) and in-page anchors are left alone.
 */
export function slash(to: string): string {
  if (!to.startsWith('/')) return to;
  const m = /^([^?#]*)(.*)$/.exec(to)!;
  let p = m[1];
  if (p !== '/' && !p.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(p)) p += '/';
  return p + m[2];
}
/** Path without the trailing slash, for comparisons ('/' stays '/'). */
export const bare = (p: string) => p.replace(/\/+$/, '') || '/';

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  return <RouterLink ref={ref} to={typeof to === 'string' ? slash(to) : to} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  return <RouterNavLink ref={ref} to={typeof to === 'string' ? slash(to) : to} {...rest} />;
});
