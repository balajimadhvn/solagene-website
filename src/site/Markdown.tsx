import { Fragment, type ReactNode } from 'react';
import { Link } from './Link';
import { I } from './icons';
import { useCopy } from './primitives';

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [ok, copy] = useCopy();
  return (
    <div className="md-code">
      <div className="md-code-head"><span>{lang || 'text'}</span><button type="button" className="copy" onClick={() => copy(code)} aria-label={`Copy ${lang || 'code'} example`}>{ok ? <><I.Check width={13} height={13} />Copied</> : <><I.Copy width={13} height={13} />Copy</>}</button></div>
      <pre tabIndex={0}><code>{code}</code></pre>
    </div>
  );
}

/** Minimal Markdown renderer for our own articles: ## / ### headings, paragraphs, lists, fenced code, tables,
 *  block quotes, **bold**, *italic*, `code` and [links](url). Produces React elements, so it renders on the
 *  server and needs no HTML injection. */
export const slugify = (s: string) => s.toLowerCase().replace(/[`*]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m: RegExpExecArray | null, k = key;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('`')) out.push(<code key={k++}>{t.slice(1, -1).replace(/\\\|/g, '|')}</code>);
    else if (t.startsWith('**')) out.push(<strong key={k++}>{inline(t.slice(2, -2), k * 10)}</strong>);
    else if (t.startsWith('*')) out.push(<em key={k++}>{inline(t.slice(1, -1), k * 10)}</em>);
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      out.push(href.startsWith('/') ? <Link key={k++} to={href}>{label}</Link> : <a key={k++} href={href} target="_blank" rel="noopener noreferrer">{label}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last).replace(/\\\|/g, '|'));
  return out;
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim());

export function headings(md: string) {
  return md.split('\n').filter((l) => /^##\s/.test(l)).map((l) => { const t = l.replace(/^##\s+/, ''); return { id: slugify(t), text: t }; });
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0, key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i++;
      blocks.push(<CodeBlock key={key++} lang={lang} code={body.join('\n')} />);
      continue;
    }
    const h = /^(#{2,4})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = h[1].length, t = h[2];
      blocks.push(lvl === 2 ? <h2 key={key++} id={slugify(t)}>{inline(t)}</h2> : lvl === 3 ? <h3 key={key++} id={slugify(t)}>{inline(t)}</h3> : <h4 key={key++}>{inline(t)}</h4>);
      i++; continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      blocks.push(<div key={key++} className="md-table" tabIndex={0}><table><thead><tr>{cells(head).map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead><tbody>{body.map((r, ri) => <tr key={ri}>{cells(r).map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (/^(\s*[-*]\s|\s*\d+\.\s)/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '')); i++; }
      const L = ordered ? 'ol' : 'ul';
      blocks.push(<L key={key++}>{items.map((it, j) => <li key={j}>{inline(it)}</li>)}</L>);
      continue;
    }
    if (line.startsWith('>')) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={key++}>{inline(q.join(' '))}</blockquote>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,4}\s|\||\s*[-*]\s|\s*\d+\.\s|>)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={key++}>{inline(para.join(' '))}</p>);
  }
  return <Fragment>{blocks}</Fragment>;
}
