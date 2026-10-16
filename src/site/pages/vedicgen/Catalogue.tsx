import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inr, LEVELS, SCHOOLS, type Format, type Level, type LiteCourse, type School } from '../../data/course-types';
import { COURSES, courseBySlug, fromFee } from '../../data/lite';
import { PROGRAMS } from '../../data/programs';
import { I } from '../../icons';
import { Link } from '../../Link';
import { FaqSection, PageHeader, Reveal, tabKeys } from '../../primitives';
import { CourseCard, ProgramCard, SCHOOL_ICON } from '../../ui';

type Disc = 'all' | 'dry' | 'wet';
const FORMATS: [Format | 'all', string][] = [['all', 'Any format'], ['live', 'Live online'], ['self-paced', 'Self-paced'], ['in-person', 'In-person lab']];
const SORTS = [['relevance', 'Recommended'], ['fee-asc', 'Fee: low to high'], ['fee-desc', 'Fee: high to low'], ['level', 'Level']] as const;
type Sort = (typeof SORTS)[number][0];

const FAQ = [
  { q: 'Which course should I take first?', a: 'Use the course finder on this page. Most biology students start with Bioinformatics Foundations or Essential Laboratory Skills; computing students often start with Scientific Computing with Python or Molecular & Cell Biology Essentials.' },
  { q: 'What is the difference between live and self-paced?', a: 'Live cohorts meet online with an instructor three times a week for four weeks at most (intensive and weekend-only schedules on request), with a weekly lab clinic and recordings. Self-paced courses use the same lessons and labs with six months of access and mentor review of your project, at a lower fee.' },
  { q: 'Are wet-lab courses available online?', a: 'No. Bench skills need a bench, so wet-lab courses run in person at our laboratory. Their theory is supported by online pre-reading, and hybrid programmes combine bench and online analysis.' },
  { q: 'Do fees include GST?', a: 'No. Fees are shown exclusive of 18% GST, which is added at payment. The pricing page lists totals including GST.' },
  { q: 'Can my department book a course for a group?', a: 'Yes. Any course can run as a private cohort, workshop or semester-long certificate course for your institution. See the institutions page.' },
];

/* ---------- course finder: three questions → a recommended programme or course order ---------- */
const QS = [
  { q: 'What is your background?', o: [['bio', 'Biology, biotechnology, microbiology or medicine'], ['pharma', 'Pharmacy or chemistry'], ['cs', 'Computer science, engineering or mathematics'], ['env', 'Agriculture, environment or public health']] },
  { q: 'What do you want to do?', o: [['bench', 'Work in a wet lab (molecular biology, cell culture, microbiology)'], ['omics', 'Analyse sequencing data (NGS, RNA-seq, single-cell)'], ['drug', 'Work in drug discovery (docking, QSAR, MD)'], ['ai', 'Build AI, cloud or software for biology']] },
  { q: 'How much programming have you done?', o: [['none', 'None yet'], ['some', 'Some scripts in Python or R'], ['comfortable', 'I am comfortable programming']] },
] as const;
function recommend(a: string[]) {
  const [bg, goal, code] = a;
  const slug = goal === 'bench' ? (bg === 'pharma' ? 'cell-biology-assays-lab' : 'molecular-biotechnology-lab') : goal === 'drug' ? 'computational-drug-discovery' : goal === 'ai' ? (code === 'none' ? 'ai-for-life-sciences' : bg === 'cs' ? 'bio-it-cloud-engineering' : 'ai-for-life-sciences') : bg === 'env' ? 'geoinformatics' : code === 'none' && bg !== 'cs' ? 'bench-to-bioinformatics' : 'genomics-data-science';
  const p = PROGRAMS.find((x) => x.slug === slug)!;
  const skip = new Set<string>();
  if (code === 'comfortable') ['python-for-bioinformatics', 'linux-hpc-for-bioinformatics', 'r-for-bioinformatics'].forEach((s) => skip.add(s));
  const steps = p.steps.filter((s) => !skip.has(s));
  const extra = bg === 'cs' && goal !== 'ai' ? ['molecular-cell-biology-essentials'] : [];
  return { p, steps: [...extra, ...steps], skipped: p.steps.filter((s) => skip.has(s)) };
}
function CourseFinder() {
  const [ans, setAns] = useState<string[]>([]);
  const step = Math.min(ans.length, QS.length - 1);
  const done = ans.length === QS.length;
  const rec = useMemo(() => (done ? recommend(ans) : null), [ans, done]);
  const choose = (k: string) => setAns((a) => [...a.slice(0, step), k]);
  return (
    <div className="finder" id="finder">
      <div className="finder-q">
        <div className="finder-prog" aria-hidden>{QS.map((_, i) => <i key={i} className={i < ans.length ? 'on' : ''} />)}</div>
        <p className="label">Question {step + 1} of {QS.length}</p>
        <h3 id="finder-q">{QS[step].q}</h3>
        <div className="opts" role="group" aria-labelledby="finder-q" key={step}>
          {QS[step].o.map(([k, label], i) => <button type="button" key={k} className="opt" style={{ ['--i' as string]: i }} aria-pressed={ans[step] === k} onClick={() => choose(k)}><span className="k" aria-hidden>{String.fromCharCode(65 + i)}</span>{label}</button>)}
        </div>
        <div className="finder-nav">
          <button type="button" className="button button--ghost button--sm" disabled={ans.length === 0} onClick={() => setAns((a) => a.slice(0, Math.max(0, (done ? QS.length : step) - 1)))}><I.ArrowLeft width={15} height={15} />Back</button>
          {ans.length > 0 && <button type="button" className="button button--ghost button--sm" onClick={() => setAns([])}>Start again</button>}
        </div>
      </div>
      <div className="finder-r" aria-live="polite">
        {rec ? <>
          <p className="label">Recommended for you</p>
          <h3>{rec.p.title}</h3>
          <p>{rec.p.outcome}{rec.skipped.length > 0 && <> Skipped because of your experience: {rec.skipped.map((s) => courseBySlug(s)!.title).join(', ')}.</>}</p>
          <ol className="finder-path">{rec.steps.map((s, i) => { const c = courseBySlug(s)!; return <li key={s}><Link to={`/vedicgen/courses/${s}`} style={{ ['--i' as string]: i }}>{c.title}<span>{c.level}</span></Link></li>; })}</ol>
          <div className="inline"><Link to={`/vedicgen/programs/${rec.p.slug}`} className="button button--accent">View the programme <I.Arrow /></Link><Link to={`/vedicgen/courses/${rec.steps[0]}`} className="button button--secondary">Start with one course</Link></div>
        </> : <>
          <p className="label">Course finder</p>
          <h3>Three questions, one recommended path.</h3>
          <p>Tell us where you are starting and where you want to go. The finder recommends a programme and the order of courses, and skips what you already know.</p>
          <ol className="finder-path ghost" aria-hidden>{['Foundations', 'Core method', 'Specialisation'].map((t) => <li key={t}><span className="finder-ghost">{t}<span>—</span></span></li>)}</ol>
        </>}
      </div>
    </div>
  );
}

export default function CourseCatalogue() {
  const [params, setParams] = useSearchParams();
  const [school, setSchool] = useState<'all' | School>('all');
  const [disc, setDisc] = useState<Disc>('all');
  const [level, setLevel] = useState<'all' | Level>('all');
  const [format, setFormat] = useState<'all' | Format>('all');
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('relevance');
  const synced = useRef(false);
  useEffect(() => {
    const s = params.get('school'), d = params.get('lab'), l = params.get('level'), f = params.get('format'), c = params.get('topic'), qq = params.get('q');
    if (s && SCHOOLS.some((x) => x.id === s)) setSchool(s as School);
    if (d === 'dry' || d === 'wet') setDisc(d);
    if (l && (LEVELS as string[]).includes(l)) setLevel(l as Level);
    if (f && FORMATS.some(([k]) => k === f)) setFormat(f as Format);
    if (c) setCat(c);
    if (qq) setQ(qq);
    synced.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!synced.current) return;
    const n = new URLSearchParams();
    if (school !== 'all') n.set('school', school);
    if (disc !== 'all') n.set('lab', disc);
    if (level !== 'all') n.set('level', level);
    if (format !== 'all') n.set('format', format);
    if (cat !== 'all') n.set('topic', cat);
    if (q.trim()) n.set('q', q.trim());
    if (n.toString() !== params.toString()) setParams(n, { replace: true, preventScrollReset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school, disc, level, format, cat, q]);

  const cats = school === 'all' ? [] : SCHOOLS.find((s) => s.id === school)!.categories;
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const terms = s.split(/\s+/).filter(Boolean);
    const out = COURSES.filter((c) => (school === 'all' || c.school === school) && (disc === 'all' || (disc === 'wet' ? c.discipline !== 'dry' : c.discipline === 'dry')) && (level === 'all' || c.level === level) && (format === 'all' || c.formats.includes(format)) && (cat === 'all' || c.category === cat)
      && (!terms.length || terms.every((t) => c.search.includes(t))));
    const lv = { Beginner: 0, Intermediate: 1, Advanced: 2 };
    if (sort === 'fee-asc') out.sort((a, b) => fromFee(a) - fromFee(b));
    if (sort === 'fee-desc') out.sort((a, b) => fromFee(b) - fromFee(a));
    if (sort === 'level') out.sort((a, b) => lv[a.level] - lv[b.level]);
    return out;
  }, [school, disc, level, format, cat, q, sort]);
  const filtered = school !== 'all' || disc !== 'all' || level !== 'all' || format !== 'all' || cat !== 'all' || q.trim() !== '';
  const reset = () => { setSchool('all'); setDisc('all'); setLevel('all'); setFormat('all'); setCat('all'); setQ(''); setSort('relevance'); };
  const ids = ['all', ...SCHOOLS.map((s) => s.id)] as ('all' | School)[];
  const grouped: [School, LiteCourse[]][] = SCHOOLS.map((s) => [s.id, list.filter((c) => c.school === s.id)]);

  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Courses', path: '/vedicgen/courses' }]} label="Solagene Vedicgen · Course catalogue" title="Bioinformatics, biotechnology and computing courses in India"
        lede={`${COURSES.length} courses of up to four weeks with published syllabi and fees: in-person wet-lab bench training, live online cohorts and self-paced online study, each ending in assessed work and a certificate you can verify online.`}
        actions={<><a href="#catalogue" className="button button--accent button--lg">Browse the catalogue <I.Arrow /></a><a href="#finder" className="button button--secondary button--lg">Find my course</a></>} />

      <section className="section" id="catalogue" aria-labelledby="catalogue-h" style={{ paddingTop: 'clamp(32px, 4vw, 56px)' }}>
        <div className="container">
          <h2 id="catalogue-h" className="sr-only">Catalogue</h2>
          <div className="ptabs" role="tablist" aria-label="Schools">
            {ids.map((id) => { const S = SCHOOLS.find((s) => s.id === id); const Ic = S ? SCHOOL_ICON[S.id] : I.Grid; return <button key={id} type="button" role="tab" aria-selected={school === id} tabIndex={school === id ? 0 : -1} onClick={() => { setSchool(id); setCat('all'); }} onKeyDown={(e) => tabKeys(e, ids, school, (v) => { setSchool(v); setCat('all'); })}><Ic width={16} height={16} />{S ? S.short : 'All schools'}<span className="ct">{id === 'all' ? COURSES.length : COURSES.filter((c) => c.school === id).length}</span></button>; })}
          </div>
          <div className="filters">
            <label className="searchbox"><span className="sr-only">Search courses</span><I.Search width={17} height={17} /><input type="search" placeholder="Search topic, tool or technique, e.g. DESeq2, ELISA, Docker" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search courses" />{q && <button type="button" className="clear" onClick={() => setQ('')} aria-label="Clear search"><I.X width={14} height={14} /></button>}</label>
            <div className="seg" role="group" aria-label="Wet or dry lab">{([['all', 'Wet & dry'], ['wet', 'Wet lab'], ['dry', 'Dry lab']] as const).map(([k, t]) => <button type="button" key={k} aria-pressed={disc === k} onClick={() => setDisc(k)}>{t}</button>)}</div>
            <label className="select-pill"><span className="sr-only">Level</span><select value={level} onChange={(e) => setLevel(e.target.value as Level | 'all')}><option value="all">Any level</option>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></label>
            <label className="select-pill"><span className="sr-only">Format</span><select value={format} onChange={(e) => setFormat(e.target.value as Format | 'all')}>{FORMATS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
            <label className="select-pill"><span className="sr-only">Sort</span><select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>{SORTS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
          </div>
          {cats.length > 0 && <div className="chips-row" role="group" aria-label="Topic" style={{ marginTop: 14 }}>{['all', ...cats].map((k) => <button type="button" key={k} className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>{k === 'all' ? 'All topics' : k}<span className="ct">{k === 'all' ? COURSES.filter((c) => c.school === school).length : COURSES.filter((c) => c.category === k).length}</span></button>)}</div>}
          <div className="results-bar" aria-live="polite"><span><b>{list.length}</b> of {COURSES.length} courses{list.length ? ` · from ${inr(Math.min(...list.map(fromFee)))} + GST` : ''}</span>{filtered && <button type="button" className="button button--ghost button--sm" onClick={reset}><I.X width={14} height={14} />Clear filters</button>}</div>

          {list.length === 0 ? (
            <div className="empty"><b>No course matches these filters.</b><span>Try a broader search, or clear the filters to see all {COURSES.length} courses.</span><button type="button" className="button button--secondary button--sm" onClick={reset}>Clear filters</button></div>
          ) : filtered || sort !== 'relevance' ? (
            <div className="cgrid" key={list.map((c) => c.slug).join('|').length + school + disc}>{list.map((c, i) => <CourseCard key={c.slug} c={c} index={i} />)}</div>
          ) : grouped.map(([sid, cs]) => {
            const S = SCHOOLS.find((s) => s.id === sid)!; const Ic = SCHOOL_ICON[sid];
            return cs.length ? (
              <div key={sid} className="school-group">
                <div className="school-head"><span className="icon-tile"><Ic width={22} height={22} /></span><div><h3>{S.name}</h3><p>{S.line}</p></div><button type="button" className="button button--secondary button--sm" onClick={() => { setSchool(sid); document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' }); }}>Only this school</button></div>
                <div className="cgrid">{cs.map((c, i) => <CourseCard key={c.slug} c={c} index={i} />)}</div>
              </div>
            ) : null;
          })}
        </div>
      </section>

      <section className="section section--grad" aria-labelledby="finder-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Course finder</p><h2 id="finder-h">Not sure where to start?</h2></div><p className="lede">Answer three questions and the finder recommends a professional programme and the order of courses, skipping what you already know.</p></Reveal>
          <Reveal><CourseFinder /></Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="progs-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Save with a programme</p><h2 id="progs-h">Professional programmes</h2></div><Link to="/vedicgen/programs" className="button button--secondary">All {PROGRAMS.length} programmes <I.Arrow /></Link></Reveal>
          <div className="cgrid">{PROGRAMS.slice(0, 3).map((p, i) => <ProgramCard key={p.slug} p={p} index={i} />)}</div>
        </div>
      </section>

      <FaqSection items={FAQ} alt />
    </>
  );
}
