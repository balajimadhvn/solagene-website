import { Link } from '../Link';
import { I } from '../icons';

export default function NotFound() {
  const links: [string, string, string][] = [['/vedicgen/courses', 'Vedicgen courses', 'Wet-lab, bioinformatics, computing and life-science courses'], ['/vedicgen/internships', 'Internships', 'Mentored wet-lab and dry-lab internships'], ['/nayancode', 'Nayancode software', 'Scientific software that runs in your browser'], ['/services', 'Research services', 'Genomics, drug discovery, Bio-IT and more'], ['/learn', 'Knowledge hub', 'Tutorials and guides'], ['/contact', 'Contact', 'Ask us directly']];
  return (
    <section className="nf">
      <div className="container split-5-7 align-start">
        <div className="stack-md intro-rise">
          <p className="nf-code">Error 404</p>
          <h1>This page could not be found.</h1>
          <p className="lede">The link may be out of date, or the page may have moved. These are good places to continue.</p>
          <div className="inline"><Link to="/" className="button button--primary">Go to the home page <I.Arrow /></Link></div>
        </div>
        <nav aria-label="Suggested pages" className="linkgrid" style={{ ['--cols' as string]: 1 }}>
          {links.map(([to, t, d]) => <Link key={to} to={to}><b>{t}</b><span>{d}</span><I.Arrow width={16} height={16} /></Link>)}
        </nav>
      </div>
    </section>
  );
}
