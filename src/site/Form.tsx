import { useId, useState, type ReactNode } from 'react';
import { BRAND, INTEGRATIONS } from '@/core/brand';
import { I } from './icons';
import { Link } from './Link';
import { SCHEDULES } from './data/course-types';

/**
 * Forms for applications, enquiries and demo requests. Static-hosting friendly (GitHub Pages):
 *  • With a form backend configured (Formspree or Web3Forms, see src/core/brand.ts → INTEGRATIONS or the
 *    VITE_FORM_ENDPOINT build variable), submissions are posted as JSON and the visitor sees a confirmation.
 *  • Without one, the form opens the visitor's e-mail app with the completed application addressed to the right
 *    Solagene inbox (help@ for admissions, support@ for software, contact@ for everything else).
 * Inline validation with accessible messages, a honeypot against bots, consent capture and clear states.
 */
export type Inbox = 'general' | 'help' | 'support';
export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'section';
  options?: string[];
  groups?: { label: string; options: string[] }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  half?: boolean;
  minLength?: number;
  rows?: number;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const backendReady = () => !!INTEGRATIONS.formEndpoint || INTEGRATIONS.formProvider === 'formsubmit';
export const inboxOf = (i: Inbox) => BRAND.emails[i];

async function send(subject: string, data: Record<string, string>, inbox: Inbox) {
  const body: Record<string, string> = { subject, _subject: subject, from_name: `${BRAND.name} website`, inbox: inboxOf(inbox), ...data };
  if (data.email) body._replyto = data.email;
  if (INTEGRATIONS.formAccessKey) body.access_key = INTEGRATIONS.formAccessKey;
  // FormSubmit: one endpoint per inbox, so every message lands directly in contact@, help@ or support@.
  const fs = !INTEGRATIONS.formEndpoint;
  if (fs) { body._template = 'table'; body._captcha = 'false'; }
  const url = fs ? `https://formsubmit.co/ajax/${inboxOf(inbox)}` : INTEGRATIONS.formEndpoint;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  // FormSubmit answers 200 with { success: "false" } when the inbox has not been activated yet: treat that as a failure
  // so the visitor is shown the e-mail fallback instead of a false "sent".
  const j = await r.json().catch(() => null) as { success?: unknown } | null;
  if (j && 'success' in j && String(j.success) !== 'true') throw new Error('not delivered');
}

export const mailtoHref = (subject: string, body: string, inbox: Inbox = 'general') => `mailto:${inboxOf(inbox)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export interface FormProps {
  fields: FieldDef[];
  subject: (v: Record<string, string>) => string;
  submitLabel: string;
  done?: ReactNode;
  next?: string[];
  initial?: Record<string, string>;
  doneTitle?: string;
  inbox?: Inbox;
  kind?: string;
}

export default function Form({ fields, subject, submitLabel, done, next, initial = {}, doneTitle = 'Thank you. Your message has been sent.', inbox = 'general', kind = 'Enquiry' }: FormProps) {
  const uid = useId();
  const inputs = fields.filter((f) => f.type !== 'section');
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(inputs.map((f) => [f.name, initial[f.name] ?? ''])));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'mailto' | 'error'>('idle');
  const [hp, setHp] = useState('');
  const [fallback, setFallback] = useState('');
  const to = inboxOf(inbox);

  const errOf = (f: FieldDef): string | null => {
    const x = (v[f.name] ?? '').trim();
    if (f.type === 'checkbox') return f.required && x !== 'yes' ? 'Please confirm to continue.' : null;
    if (f.required && !x) return f.type === 'select' ? `Please choose ${f.label.toLowerCase()}.` : `Please enter ${f.label.toLowerCase()}.`;
    if (f.type === 'email' && x && !EMAIL.test(x)) return 'Please enter a valid e-mail address, for example name@university.edu.';
    if (f.type === 'tel' && x && !/^[+\d][\d\s()-]{6,}$/.test(x)) return 'Please enter a valid phone number, including the country code.';
    const min = f.minLength ?? (f.type === 'textarea' && f.required ? 10 : 0);
    if (x && min && x.length < min) return `Please write at least ${min} characters (currently ${x.length}).`;
    return null;
  };
  const errors = Object.fromEntries(inputs.map((f) => [f.name, errOf(f)]));
  const invalid = inputs.some((f) => errors[f.name]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.fromEntries(inputs.map((f) => [f.name, true])));
    if (invalid) { const first = inputs.find((f) => errors[f.name]); document.getElementById(`${uid}-${first?.name}`)?.focus(); return; }
    if (hp) { setState('sent'); return; }
    const data = Object.fromEntries(inputs.filter((f) => f.type !== 'checkbox' || v[f.name] === 'yes').map((f) => [f.label, f.type === 'checkbox' ? 'Yes' : (v[f.name] ?? '').trim()]).filter(([, x]) => x));
    const subj = subject(v);
    const body = [`${kind} sent from ${BRAND.siteUrl}`, '', ...Object.entries(data).map(([k, x]) => `${k}: ${x}`)].join('\n');
    if (backendReady()) {
      setState('sending');
      try { await send(subj, { 'Form': kind, ...data, email: v.email ?? '', name: v.name ?? '' }, inbox); setState('sent'); } catch { setFallback(mailtoHref(subj, body, inbox)); setState('error'); }
      return;
    }
    window.location.href = mailtoHref(subj, body, inbox);
    setState('mailto');
  };

  if (state === 'sent') return (
    <div className="form-done" role="status">
      <span className="ok"><I.Check width={22} height={22} /></span>
      <h3>{doneTitle}</h3>
      <p>{done ?? `We read every message and reply by e-mail from ${to}, usually within two working days.`}</p>
      {next && <ol className="done-steps">{next.map((n) => <li key={n}>{n}</li>)}</ol>}
      <button type="button" className="button button--secondary button--sm" onClick={() => { setState('idle'); setTouched({}); }}>Send another</button>
    </div>
  );

  const field = (f: FieldDef) => {
    const id = `${uid}-${f.name}`, err = touched[f.name] ? errors[f.name] : null;
    const describedBy = [err ? `${id}-e` : '', f.hint ? `${id}-h` : ''].filter(Boolean).join(' ') || undefined;
    const onBlur = () => setTouched((t) => ({ ...t, [f.name]: true }));
    if (f.type === 'checkbox') return (
      <div key={f.name} className={`fld fld--check ${err ? 'has-err' : ''}`}>
        <label htmlFor={id}><input id={id} name={f.name} type="checkbox" checked={v[f.name] === 'yes'} aria-invalid={err ? true : undefined} aria-describedby={describedBy} aria-required={f.required || undefined}
          onChange={(e) => { setV((s) => ({ ...s, [f.name]: e.target.checked ? 'yes' : '' })); setTouched((t) => ({ ...t, [f.name]: true })); }} onBlur={onBlur} /><span>{f.label}{f.name === 'consent' && <> See the <Link to="/privacy" className="ulink">privacy policy</Link>.</>}</span></label>
        {err && <span className="fld-err" id={`${id}-e`}><I.Alert width={14} height={14} />{err}</span>}
      </div>
    );
    const common = {
      id, name: f.name, value: v[f.name] ?? '', 'aria-invalid': err ? true : undefined, 'aria-describedby': describedBy, 'aria-required': f.required || undefined, autoComplete: f.autoComplete, className: 'control',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [f.name]: e.target.value })),
      onBlur,
    };
    const len = (v[f.name] ?? '').trim().length;
    return (
      <div key={f.name} className="fld">
        <label htmlFor={id}>{f.label}{!f.required && <span className="fld-opt"> (optional)</span>}</label>
        {f.type === 'select' ? (
          <select {...common}>
            <option value="" disabled={f.required}>{f.placeholder ?? 'Select…'}</option>
            {f.groups ? f.groups.map((g) => <optgroup key={g.label} label={g.label}>{g.options.map((o) => <option key={o}>{o}</option>)}</optgroup>) : f.options!.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : f.type === 'textarea' ? <textarea {...common} placeholder={f.placeholder} rows={f.rows ?? 5} />
          : <input {...common} type={f.type ?? 'text'} placeholder={f.placeholder} inputMode={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : undefined} />}
        {(f.hint || f.minLength) && <span className="fld-hint" id={`${id}-h`}>{f.hint}{f.minLength ? <span className={`fld-count ${len >= f.minLength ? 'ok' : ''}`}>{len}/{f.minLength}+ characters</span> : null}</span>}
        {err && <span className="fld-err" id={`${id}-e`}><I.Alert width={14} height={14} />{err}</span>}
      </div>
    );
  };

  const rows: ReactNode[] = [];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.type === 'section') { rows.push(<p key={`s-${f.name}`} className="form-sec"><span>{f.label}</span>{f.hint && <small>{f.hint}</small>}</p>); continue; }
    if (f.half && fields[i + 1]?.half && fields[i + 1].type !== 'section') { rows.push(<div key={f.name} className="form-row">{field(f)}{field(fields[i + 1])}</div>); i++; }
    else rows.push(field(f));
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      {rows}
      <div className="hp" aria-hidden="true"><label htmlFor={`${uid}-hp`}>Leave this field empty</label><input id={`${uid}-hp`} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></div>
      {state === 'error' && <div className="notice notice--err" role="alert"><I.Alert width={18} height={18} /><span>The form could not be sent. Please try again, <a className="ulink" href={fallback || `mailto:${to}`}>send it from your e-mail app</a> (everything is filled in), or write to <a className="ulink" href={`mailto:${to}`}>{to}</a>.</span></div>}
      {state === 'mailto' && <div className="notice notice--ok" role="status"><I.Mail width={18} height={18} /><span>Your e-mail app should now be open with everything filled in, addressed to <b>{to}</b>. Press send to submit. If nothing opened, write to <a className="ulink" href={`mailto:${to}`}>{to}</a>.</span></div>}
      <div className="form-foot">
        <button className="button button--primary button--lg" type="submit" disabled={state === 'sending'} aria-busy={state === 'sending' || undefined}>{state === 'sending' ? <><span className="spin" aria-hidden /> Sending…</> : <>{submitLabel} <I.Arrow /></>}</button>
        <small>{backendReady() ? `Sent securely to ${to}. Your details are used only to process this request.` : `Opens your e-mail app with the form completed, addressed to ${to}.`}</small>
      </div>
    </form>
  );
}

/** Ready-made field definitions. */
export const F = {
  name: { name: 'name', label: 'Full name', required: true, autoComplete: 'name', half: true } as FieldDef,
  email: { name: 'email', label: 'E-mail', type: 'email', required: true, autoComplete: 'email', half: true } as FieldDef,
  phone: { name: 'phone', label: 'Phone or WhatsApp', type: 'tel', autoComplete: 'tel', half: true, placeholder: '+91 …' } as FieldDef,
  phoneReq: { name: 'phone', label: 'Phone or WhatsApp', type: 'tel', autoComplete: 'tel', half: true, placeholder: '+91 …', required: true } as FieldDef,
  org: { name: 'org', label: 'University or organisation', autoComplete: 'organization', half: true } as FieldDef,
  consent: { name: 'consent', label: 'I agree that Solagene may use these details to respond to this request.', type: 'checkbox', required: true } as FieldDef,
  section: (name: string, label: string, hint?: string) => ({ name, label, hint, type: 'section' }) as FieldDef,
  message: (label = 'Message', placeholder = 'A few lines about you and what you are looking for.', required = true) => ({ name: 'message', label, type: 'textarea', required, placeholder }) as FieldDef,
};

export const QUALIFICATIONS = ['Class 12 / pre-university', 'B.Sc.', 'B.Tech. / B.E.', 'B.Pharm.', 'BCA / B.Com. / B.A.', 'M.Sc.', 'M.Tech. / M.E.', 'M.Pharm.', 'MCA', 'MBBS / BDS / B.V.Sc. / allied health', 'PhD (ongoing)', 'PhD (completed)', 'Other'];
export const STATUSES = ['Final-year student', 'Student (other years)', 'Recent graduate (within 2 years)', 'Working professional', 'Researcher or faculty member', 'Other'];

/** Application form for courses, programmes, internships and research training. */
export function ApplicationForm({ programme, options, groups, formats, durations, kind = 'Course application', minSop = 80, wet }: { programme?: string; options?: string[]; groups?: { label: string; options: string[] }[]; formats?: string[]; durations?: string[]; kind?: string; minSop?: number; wet?: boolean }) {
  const isIntern = /internship/i.test(kind);
  const fields: FieldDef[] = [
    F.section('s1', 'About you'),
    F.name, F.email, F.phoneReq, { name: 'city', label: 'City and country', autoComplete: 'address-level2', half: true, placeholder: 'City, country' },
    F.section('s2', 'Education'),
    { name: 'qualification', label: 'Highest qualification', type: 'select', required: true, options: QUALIFICATIONS, half: true },
    { name: 'field', label: 'Field of study', required: true, half: true, placeholder: 'e.g. Biotechnology' },
    { name: 'institution', label: 'Institution', required: true, autoComplete: 'organization', half: true, placeholder: 'College or university' },
    { name: 'status', label: 'Current status', type: 'select', required: true, options: STATUSES, half: true },
    F.section('s3', isIntern ? 'Internship' : 'Programme'),
    { name: 'programme', label: isIntern ? 'Internship track' : 'Course or programme of interest', type: 'select', required: true, ...(groups ? { groups } : { options: options ?? (programme ? [programme] : []) }) },
    ...(formats?.length ? [{ name: 'format', label: 'Preferred format', type: 'select', required: true, options: formats, half: true } as FieldDef] : []),
    ...(durations?.length ? [{ name: 'duration', label: 'Duration', type: 'select', required: true, options: durations, half: true } as FieldDef] : []),
    ...(!isIntern ? [{ name: 'schedule', label: 'Preferred duration and schedule', type: 'select', options: [...SCHEDULES], half: true } as FieldDef] : []),
    { name: 'start', label: 'Preferred start', type: 'select', options: ['Next available cohort', 'Within 1 month', 'In 1–3 months', 'In 3–6 months', 'Flexible'], half: true },
    { name: 'experience', label: wet ? 'Laboratory experience' : 'Relevant experience', type: 'select', required: true, half: true, options: wet ? ['None yet', 'Undergraduate practicals only', 'Project or dissertation lab work', 'Research or industry lab work'] : ['None yet', 'Coursework only', 'Personal or academic projects', 'Research or industry experience'] },
    ...(!wet ? [{ name: 'coding', label: 'Programming experience', type: 'select', half: true, options: ['None', 'Basic (some scripts)', 'Comfortable in Python or R', 'Professional developer'] } as FieldDef] : []),
    F.section('s4', isIntern ? 'Statement of purpose' : 'Your goals', isIntern ? '150–300 words: what you want to learn, why this track, and what you hope to do next.' : 'A few lines help us advise you well.'),
    { name: 'message', label: isIntern ? 'Statement of purpose' : 'Goals, research interests or questions', type: 'textarea', required: true, minLength: isIntern ? Math.max(minSop, 150) : minSop, rows: isIntern ? 8 : 5, placeholder: isIntern ? 'What draws you to this track? What have you done so far (coursework, projects, lab work)? What would you like to achieve during the internship?' : 'Your background, what you want to learn and anything we should know.' },
    { name: 'links', label: 'Links (portfolio, GitHub, LinkedIn or a project)', half: false, placeholder: 'https://…' },
    { name: 'source', label: 'How did you hear about us?', type: 'select', options: ['Search engine', 'Friend or classmate', 'Faculty or institution', 'LinkedIn', 'Instagram or YouTube', 'Event or workshop', 'Other'] },
    F.consent,
    { name: 'updates', label: 'Send me occasional e-mails about new cohorts and free resources.', type: 'checkbox' },
  ];
  const next = isIntern
    ? ['Our admissions team replies from help@solagene.com.', 'An admissions reviewer reads your application within five working days.', 'Shortlisted applicants receive a short task and an interview invitation.', 'Successful applicants receive an offer letter with the start date, mentor and fee.']
    : ['Our admissions team replies from help@solagene.com.', 'An admissions adviser reviews your application within two working days and confirms the right format and cohort.', 'You receive an admission offer with the dates, timetable and a secure payment link.', 'Your place is confirmed on payment, and onboarding details follow.'];
  return (
    <Form kind={kind} inbox="help" fields={fields} initial={{ programme: programme ?? '' }}
      subject={(x) => `[${kind}] ${x.programme || 'Vedicgen'}: ${x.name}`} submitLabel={isIntern ? 'Submit application' : 'Apply now'}
      doneTitle="Application received. Thank you." done={`We have your application and will reply by e-mail. Questions in the meantime? Write to ${BRAND.emails.help}.`} next={next} />
  );
}

export function Newsletter({ compact, id: idProp }: { compact?: boolean; id?: string }) {
  const [email, setEmail] = useState('');
  const [st, setSt] = useState<'idle' | 'sending' | 'ok' | 'err' | 'bad'>('idle');
  const gen = useId();
  const id = idProp ?? gen;
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) { setSt('bad'); return; }
    setSt('sending');
    try {
      if (INTEGRATIONS.newsletterEndpoint) { const r = await fetch(INTEGRATIONS.newsletterEndpoint, { method: 'POST', body: new URLSearchParams({ email: email.trim() }) }); if (!r.ok && r.type !== 'opaque') throw new Error(); }
      else if (backendReady()) await send('Newsletter sign-up', { email: email.trim() }, 'general');
      else { window.location.href = mailtoHref('Newsletter sign-up', `Please add ${email.trim()} to the Solagene newsletter.`); }
      setSt('ok');
    } catch { setSt('err'); }
  };
  if (st === 'ok') return <div className="notice notice--ok" role="status"><I.Check width={18} height={18} /><span>{backendReady() || INTEGRATIONS.newsletterEndpoint ? 'Thank you. You are subscribed.' : 'Thank you. Send the e-mail that has just opened to confirm.'}</span></div>;
  return (
    <form onSubmit={go} noValidate className="stack-xs news-form">
      <label htmlFor={id} className="sr-only">E-mail address</label>
      <div className="news">
        <input id={id} className="control" type="email" placeholder="you@university.edu" value={email} onChange={(e) => { setEmail(e.target.value); if (st === 'bad' || st === 'err') setSt('idle'); }} aria-invalid={st === 'bad' || undefined} aria-describedby={`${id}-m`} autoComplete="email" />
        <button className={`button ${compact ? 'button--accent' : 'button--primary'}`} style={{ height: 46 }} type="submit" disabled={st === 'sending'} aria-busy={st === 'sending' || undefined}>{st === 'sending' ? <span className="spin" aria-label="Subscribing" /> : 'Subscribe'}</button>
      </div>
      <p id={`${id}-m`} className={`news-msg ${st === 'bad' || st === 'err' ? 'is-err' : ''}`} role={st === 'bad' || st === 'err' ? 'alert' : undefined}>
        {st === 'bad' ? 'Please enter a valid e-mail address.' : st === 'err' ? 'Something went wrong. Please try again.' : 'Unsubscribe at any time.'}
      </p>
    </form>
  );
}
