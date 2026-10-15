import { useSearchParams } from 'react-router-dom';
import { BRAND } from '@/core/brand';
import { LICENSING, PLATFORMS, PRODUCTS } from '../../data/products';
import Form, { F } from '../../Form';
import { I } from '../../icons';
import { Link } from '../../Link';
import { Accordion, FaqSection, PageHeader, Reveal, useScrollSpy } from '../../primitives';

const crumbs = (name: string, path: string) => [{ name: 'Home', path: '/' }, { name: 'Nayancode', path: '/nayancode' }, { name, path }];

const FORMATS: [string, string, string][] = [
  ['FASTA / multi-FASTA', '.fa, .fasta, .fna, .faa', 'Sequence, Phylogenetics, Genome Studios'],
  ['FASTQ (plain or gzip)', '.fq, .fastq, .gz', 'Genome Studio (QC, mapping)'],
  ['SAM / BAM', '.sam, .bam', 'Genome Studio (produced and viewed)'],
  ['VCF', '.vcf, .vcf.gz', 'Variant Studio; produced by Genome Studio'],
  ['BED / GFF / GTF', '.bed, .gff, .gff3, .gtf', 'Genome Studio'],
  ['Count matrix + sample sheet', '.csv, .tsv', 'Expression Studio'],
  ['10x matrix (via Import)', 'matrix.mtx, barcodes, features', 'Single-Cell Studio'],
  ['Feature table + metadata', '.csv, .tsv, Newick', 'Microbiome Studio'],
  ['SMILES / compound tables', '.smi, .csv', 'Chemistry Studio'],
  ['Structures', 'PDB ID, UniProt ID, .pdb, .cif', 'Structure Studio'],
  ['Sanger traces', '.ab1', 'Sequence Studio'],
  ['Trees', 'Newick (.nwk, .tree)', 'Phylogenetics Studio'],
];
const DOC_SECTIONS: [string, string][] = [['start', 'Getting started'], ['requirements', 'System requirements'], ['privacy', 'Privacy model'], ['formats', 'File formats'], ['products', 'Product reference'], ['reproducibility', 'Reproducibility'], ['citing', 'Citing Nayancode'], ['troubleshooting', 'Troubleshooting'], ['support', 'Support']];

export function Docs() {
  const active = useScrollSpy(DOC_SECTIONS.map(([id]) => id));
  return (
    <>
      <PageHeader crumbs={crumbs('Documentation', '/nayancode/docs')} label="Vivofold Nayancode · Documentation" title="Nayancode documentation" lede="Everything you need to use Nayancode software: getting started, requirements, the privacy model, supported formats, a reference for every product, reproducibility, citation and support." />
      <section className="section">
        <div className="container reading reading--left">
          <nav className="toc" aria-label="Documentation sections"><p className="label">Contents</p>{DOC_SECTIONS.map(([id, t]) => <a key={id} href={`#${id}`} className={active === id ? 'is-active' : ''}>{t}</a>)}</nav>
          <article className="prose docs">
            <section id="start"><h2>Getting started</h2><ol><li>Open the <Link to="/workbench">Nayancode Workbench</Link> (or any product page and press <b>Open</b>). There is nothing to install and no account.</li><li>Choose a studio from the sidebar. Each studio offers a <b>labelled synthetic demo</b>; load it to see what the analysis produces.</li><li>Drag your own files onto the studio, or paste sequences. Files are read by your browser and never uploaded.</li><li>Adjust parameters, run, and explore the interactive results. Use the camera button on any chart to collect it for a report.</li><li>Open the <Link to="/report">Report Builder</Link> to export figures with an auto-written methods section.</li></ol></section>
            <section id="requirements"><h2>System requirements</h2><ul>{PLATFORMS.map((p) => <li key={p}>{p}</li>)}<li>At least 8 GB of RAM is recommended for genome mapping and single-cell analysis; 4 GB is enough for sequence, chemistry and structure work.</li><li>WebAssembly and Web Workers must be enabled (they are by default in modern browsers).</li><li>Structure Studio needs WebGL for 3D views.</li></ul></section>
            <section id="privacy"><h2>Privacy model</h2><p>Nayancode analyses your data on your own device using Web Workers and WebAssembly. Your files are not sent to Vivofold or anyone else. A network meter in the Workbench shows the total bytes sent, so you can confirm it.</p><p>Some features query public databases on request: for example, variant evidence (ClinVar, CIViC, gnomAD, Open Targets), compound import (PubChem, ChEMBL), structures (RCSB PDB, AlphaFold DB) and gene cards. Only the identifiers you look up are sent, and only when you press the button. Data sources and their licences are listed on the <Link to="/licenses">open-source licences page</Link>.</p></section>
            <section id="formats"><h2>Supported file formats</h2><div className="table-wrap not-prose" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable"><thead><tr><th scope="col">Data</th><th scope="col">Extensions</th><th scope="col">Used in</th></tr></thead><tbody>{FORMATS.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td className="mono">{b}</td><td>{c}</td></tr>)}</tbody></table></div></section>
            <section id="products"><h2>Product reference</h2><p>Inputs, outputs, engine and limits for every product.</p>
              <div className="not-prose"><Accordion defaultOpen={[]} items={PRODUCTS.map((p) => ({ q: p.name, a: <dl className="kv"><div><dt>What it does</dt><dd>{p.short}</dd></div><div><dt>Inputs</dt><dd>{p.inputs.join(' · ')}</dd></div><div><dt>Outputs</dt><dd>{p.outputs.join(' · ')}</dd></div><div><dt>Engine</dt><dd>{p.engine}</dd></div><div><dt>Limits</dt><dd>{p.limits}</dd></div><div><dt>Open</dt><dd><Link to={p.app} className="ulink">{p.app}</Link> · <Link to={`/nayancode/products/${p.slug}`} className="ulink">product page</Link></dd></div></dl> }))} /></div>
            </section>
            <section id="reproducibility"><h2>Reproducibility and provenance</h2><p>Every analysis records the tool, its version, the parameters and a checksum of each input. The Methods drawer turns these records into a paragraph you can paste into a manuscript, with citations to the underlying methods. Re-running with the same inputs and parameters gives the same result; stochastic methods (such as UMAP or bootstrap trees) record their random seed.</p></section>
            <section id="citing"><h2>Citing Nayancode</h2><p>If Nayancode contributed to published work, please cite the methods listed in the auto-written methods paragraph, and the software as:</p><blockquote>{BRAND.name} Nayancode Workbench, version {BRAND.version}. {BRAND.name}, India. {BRAND.siteUrl}/nayancode/</blockquote></section>
            <section id="troubleshooting"><h2>Troubleshooting</h2><ul><li><b>A studio does not load:</b> refresh the page; if you use strict privacy extensions, allow scripts and workers for this site.</li><li><b>Large files are slow or fail:</b> browser memory is the limit; subsample reads or use a cluster pipeline and import the results.</li><li><b>3D structures do not appear:</b> check that WebGL is enabled and hardware acceleration is on.</li><li><b>Results differ from another tool:</b> check parameters and versions in the Methods drawer; differences in defaults are the most common cause.</li></ul></section>
            <section id="support"><h2>Support</h2><p>Write to <a href={`mailto:${BRAND.emails.support}`}>{BRAND.emails.support}</a> or use the <Link to="/nayancode/demo">request form</Link>. Include your browser, operating system and, if possible, a small example file.</p></section>
          </article>
        </div>
      </section>
    </>
  );
}

export function Licensing() {
  const rows: [string, string, string, string][] = [
    ['All live studios and free tools', 'Yes', 'Yes', 'Yes'], ['No account, no upload', 'Yes', 'Yes', 'Yes'], ['Teaching datasets and exercises', '—', 'Yes', 'Yes'], ['Help planning classroom use', '—', 'Yes', 'Yes'],
    ['Self-hosted deployment in your network', '—', '—', 'Yes'], ['Custom studios, integrations and branding', '—', '—', 'Yes'], ['Priority support and service levels', '—', '—', 'Yes'], ['Security and validation documentation', '—', '—', 'Yes'],
  ];
  return (
    <>
      <PageHeader crumbs={crumbs('Licensing', '/nayancode/pricing')} label="Vivofold Nayancode · Licensing" title="Free to use, ready for institutions" lede="Nayancode is free during the public preview for everyone. Classroom use is free. Institutions that need self-hosting, customisation or service levels can request a quote." />
      <section className="section">
        <div className="container">
          <div className="price-cards">{LICENSING.map((l, i) => <Reveal key={l.name} index={i} className={`price-card ${i === 0 ? 'is-feat' : ''}`}>{i === 0 && <span className="price-flag">Available now</span>}<p className="label">{l.name}</p><div className="price-row" style={{ borderTop: 0, paddingTop: 0 }}><b>{l.price}</b><small>{l.for}</small></div><ul className="checks small">{l.points.map((p) => <li key={p}>{p}</li>)}</ul><Link to={l.cta.to} className={`button ${i === 0 ? 'button--accent' : 'button--secondary'} button--sm`}>{l.cta.label} <I.Arrow width={15} height={15} /></Link></Reveal>)}</div>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)" style={{ marginTop: 40 }}><table className="ptable"><thead><tr><th scope="col">Feature</th>{LICENSING.map((l) => <th key={l.name} scope="col">{l.name}</th>)}</tr></thead><tbody>{rows.map((r) => <tr key={r[0]}><th scope="row">{r[0]}</th>{r.slice(1).map((c, k) => <td key={k}>{c === 'Yes' ? <I.Check width={16} height={16} aria-label="Included" /> : c}</td>)}</tr>)}</tbody></table></div>
          <p className="small subtle" style={{ marginTop: 12 }}>No paid plans have fixed prices yet; institutional terms are quoted individually. The public preview may change in future, with advance notice.</p>
        </div>
      </section>
      <FaqSection items={[{ q: 'Will Nayancode stay free?', a: 'The browser studios and free tools are free during the public preview. If paid plans are introduced for individuals, existing free features will be announced in advance and classroom use will remain free.' }, { q: 'Can we run Nayancode inside our institution’s network?', a: 'Yes, through a self-hosted deployment under an institutional licence. Contact us for a quote.' }, { q: 'Do you offer support contracts?', a: 'Yes, as part of institutional and enterprise licences.' }]} alt />
    </>
  );
}

export function Demo() {
  const [params] = useSearchParams();
  const t = params.get('topic');
  const topic = t === 'teaching' ? 'Classroom / teaching use' : t === 'enterprise' ? 'Self-hosted or enterprise licence' : t === 'support' ? 'Technical support' : '';
  return (
    <>
      <PageHeader crumbs={crumbs('Request a demo', '/nayancode/demo')} label="Vivofold Nayancode · Contact" title="Request a demo or talk to our software team" lede="See Nayancode with your kind of data, plan classroom use, ask about self-hosting or custom studios, or get technical support." />
      <section className="section">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker kicker--nc">What happens next</p><ol className="timeline"><li><h3>We reply</h3><p>Within two working days, from {BRAND.emails.support}.</p></li><li><h3>A short call</h3><p>30 minutes, online, focused on your use case.</p></li><li><h3>A plan</h3><p>A demo with relevant data, a classroom plan or a written proposal.</p></li></ol></div>
          <Reveal className="form-card"><Form key={topic} kind="Demo request" inbox="support" initial={{ topic }} subject={(v) => `[Nayancode demo] ${v.topic}: ${v.org} (${v.name})`} submitLabel="Request a demo" doneTitle="Thank you. We will be in touch soon."
            fields={[F.name, F.email, { name: 'org', label: 'Organisation', required: true, half: true, autoComplete: 'organization' }, { name: 'role', label: 'Role', type: 'select', half: true, options: ['Student', 'Researcher', 'Faculty / educator', 'Bioinformatician', 'Lab or IT manager', 'Industry scientist', 'Other'] }, { name: 'topic', label: 'Topic', type: 'select', required: true, options: ['Live demo', 'Classroom / teaching use', 'Self-hosted or enterprise licence', 'Custom features or integration', 'Technical support', 'Report a problem'] }, { name: 'products', label: 'Products of interest', type: 'select', options: ['Whole Workbench', ...PRODUCTS.slice(1).map((p) => p.name)] }, F.message('Tell us more', 'Your data, users and what you want to achieve.'), F.consent]} /></Reveal>
        </div>
      </section>
    </>
  );
}
