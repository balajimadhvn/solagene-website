import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { assetUrl } from '@/core/asset';
import { BRAND, INTEGRATIONS, addressText } from '@/core/brand';
import { I } from '../icons';
import { Link } from '../Link';
import { PageHeader } from '../primitives';

const UPDATED = '14 October 2026';
const entity = () => BRAND.legalName || BRAND.name;

function LegalPage({ title, path, lede, children }: { title: string; path: string; lede: string; children: ReactNode }) {
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: title, path }]} label="Legal" title={title} lede={lede} meta={<span><I.Calendar width={15} height={15} />Last updated {UPDATED}</span>} />
      <section className="section"><div className="container container--text prose legal">{children}</div></section>
    </>
  );
}

interface Cert { id: string; name: string; course: string; issued: string; grade?: string }
/** Certificate verification. Issued certificates are listed in public/certificates.json (no server needed). */
export function Verify() {
  const [params, setParams] = useSearchParams();
  const [id, setId] = useState('');
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'found' | 'missing' | 'error'; cert?: Cert; q?: string }>({ status: 'idle' });
  const check = async (raw: string) => {
    const q = raw.trim().toUpperCase();
    if (!q) return;
    setParams({ id: q }, { replace: true, preventScrollReset: true });
    setState({ status: 'loading', q });
    try {
      const r = await fetch(assetUrl('certificates.json'), { cache: 'no-cache' });
      if (!r.ok) throw new Error(String(r.status));
      const list = (await r.json()) as Cert[];
      const cert = list.find((c) => c.id.toUpperCase() === q);
      setState(cert ? { status: 'found', cert, q } : { status: 'missing', q });
    } catch { setState({ status: 'error', q }); }
  };
  useEffect(() => { const q = params.get('id'); if (q) { setId(q); void check(q); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Verify a certificate', path: '/verify' }]} label="Vivofold Vedicgen · Certificates" title="Verify a certificate"
        lede={`Every Vedicgen certificate issued by ${BRAND.name} carries a unique ID and QR code. Enter the ID below, or scan the QR code, to confirm that it is genuine.`} />
      <section className="section">
        <div className="container container--narrow">
          <div className="form-card">
            <form onSubmit={(e) => { e.preventDefault(); void check(id); }} className="form" role="search" aria-label="Verify a certificate">
              <div className="fld"><label htmlFor="cert-id">Certificate ID</label><div className="news"><input id="cert-id" className="control mono" value={id} onChange={(e) => setId(e.target.value)} placeholder="VG-XXXX-XXXX" autoComplete="off" spellCheck={false} aria-describedby="cert-hint" /><button className="button button--accent" type="submit" style={{ height: 46 }} disabled={state.status === 'loading'}>{state.status === 'loading' ? <span className="spin" aria-label="Checking" /> : 'Verify'}</button></div><span className="fld-hint" id="cert-hint">The ID is printed under the QR code on the certificate.</span></div>
            </form>
            <div aria-live="polite" style={{ marginTop: 20 }}>
              {state.status === 'found' && state.cert && <div className="notice notice--ok"><I.Check width={18} height={18} /><span><b>Valid certificate.</b> Awarded to <b>{state.cert.name}</b> for <b>{state.cert.course}</b> on {state.cert.issued}{state.cert.grade ? ` (${state.cert.grade})` : ''}. Certificate ID <span className="mono">{state.q}</span>.</span></div>}
              {state.status === 'missing' && <div className="notice notice--err"><I.Alert width={18} height={18} /><span><b>No certificate found with the ID <span className="mono">{state.q}</span>.</b> Check the ID for typing errors. If you believe the certificate is genuine, write to <a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a>.</span></div>}
              {state.status === 'error' && <div className="notice notice--caution"><I.Alert width={18} height={18} /><span>The certificate register could not be loaded. Please check your connection and try again.</span></div>}
            </div>
          </div>
          <p className="small subtle" style={{ marginTop: 20 }}>The register lists the certificate ID, the holder’s name, the programme and the date of issue. Holders can ask for their entry to be removed; see the <Link to="/privacy" className="ulink">privacy policy</Link>.</p>
        </div>
      </section>
    </>
  );
}

export function Privacy() {
  const backend = INTEGRATIONS.formEndpoint ? (() => { try { return new URL(INTEGRATIONS.formEndpoint).hostname; } catch { return ''; } })() : INTEGRATIONS.formProvider === 'formsubmit' ? 'formsubmit.co' : '';
  return (
    <LegalPage title="Privacy policy" path="/privacy" lede={`How ${BRAND.name}, including its Vedicgen and Nayancode divisions, collects, uses and protects personal data submitted through this website.`}>
      <h2>Who we are</h2>
      <p>This website is operated by {entity()} (“{BRAND.name}”, “we”), {addressText()}. Vedicgen (our school) and Nayancode (our software) are divisions of {BRAND.name}. For privacy questions, write to <a href={`mailto:${BRAND.emails.general}`}>{BRAND.emails.general}</a>.</p>
      <h2>The short version</h2>
      <ul>
        <li>We collect only what you choose to send us through a form or e-mail, and use it to respond to you.</li>
        <li>Nayancode software analyses your files in your own browser; your data files are not sent to us.</li>
        <li>We do not sell or rent personal data, and we do not use advertising trackers.</li>
        <li>You can ask us to access, correct or erase your data at any time.</li>
      </ul>
      <h2>What we collect and why</h2>
      <ul>
        <li><b>Applications and enquiries</b> (name, e-mail, phone, education, institution, experience, statement of purpose): to assess applications, advise you, issue offers and certificates, and keep records required for accounting and certification. Legal basis: your consent and steps you ask us to take before entering into a contract.</li>
        <li><b>Service and demo requests</b>: to prepare quotes, demos and proposals.</li>
        <li><b>Newsletter</b> (e-mail address): to send occasional updates, only if you subscribe. Unsubscribe at any time.</li>
        <li><b>Certificate register</b> (certificate ID, name, programme, date): to let third parties verify certificates you share with them.</li>
      </ul>
      <h2>How forms are delivered</h2>
      <p>{backend ? <>Form submissions are delivered to our inbox through <b>{backend}</b>, a form-processing service that acts on our behalf.</> : <>When you submit a form, your own e-mail application opens with the message prepared; nothing is sent until you press send in your e-mail app.</>} If delivery fails, the form offers to open your e-mail application with the message prepared instead. Messages are received in our business e-mail.</p>
      <h2 id="cookies">Cookies and analytics</h2>
      <p>This website does not use advertising or tracking cookies. {INTEGRATIONS.cloudflareAnalyticsToken ? 'We use Cloudflare Web Analytics, which counts page views without cookies and without identifying you.' : 'We do not run third-party analytics.'} The site stores your colour-theme choice and Nayancode work-in-progress in your browser’s local storage; you can clear these at any time.</p>
      <h2>Nayancode software</h2>
      <p>Analyses run locally in your browser. Some features query public databases only when you ask (for example a gene or compound lookup); in that case only the identifier you typed is sent to that database, which has its own privacy policy.</p>
      <h2>Retention</h2>
      <p>Enquiries are kept for up to 24 months. Application and enrolment records are kept for as long as needed for certification and as required by tax and accounting law. Certificate-register entries are kept until you ask us to remove them.</p>
      <h2>Your rights</h2>
      <p>Under India’s Digital Personal Data Protection Act, 2023, and other applicable law, you may ask for a summary of the personal data we hold about you, its correction or erasure, and you may withdraw consent at any time. You may also nominate another person to exercise these rights on your behalf. Write to <a href={`mailto:${BRAND.emails.general}`}>{BRAND.emails.general}</a>; we respond within 30 days. If you are not satisfied, you may complain to the Data Protection Board of India.</p>
      <h2>Children</h2>
      <p>Our programmes are intended for adults. Applicants under 18 must apply with the consent of a parent or guardian, and wet-lab programmes are open only to participants aged 18 or over.</p>
      <h2>Changes</h2>
      <p>We will post any changes on this page with a new “last updated” date.</p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of use" path="/terms" lede={`The terms that apply when you use this website, apply to or attend Vedicgen programmes, or use Nayancode software provided by ${BRAND.name}.`}>
      <h2>1. About these terms</h2>
      <p>These terms govern your use of {BRAND.siteUrl.replace('https://', '')} and the services offered by {entity()}, {addressText()}. By using the website or our services you agree to them. Programme-specific terms in an admission offer or a written quote take precedence where they differ.</p>
      <h2>2. Vedicgen programmes</h2>
      <ul>
        <li>Admission is confirmed only when you accept an offer and pay the fee. We may decline an application without giving reasons.</li>
        <li>Published syllabi describe what we intend to teach; we may update content, software or instructors to keep programmes current, without reducing their overall scope.</li>
        <li>Certificates are issued by {BRAND.name} on successful completion and assessment. They are not university degrees or government qualifications unless expressly stated.</li>
        <li>Wet-lab participants must follow the laboratory safety rules and instructions of staff. We may remove anyone whose conduct endangers others, without refund.</li>
        <li>Course materials are for your personal learning. Do not redistribute recordings, slides or datasets that are not openly licensed.</li>
      </ul>
      <h2>3. Fees and payment</h2>
      <p>Fees are listed in INR (and USD for some online programmes) and are exclusive of GST unless stated. Payment is made through secure online links issued with your offer. Refunds, transfers and cancellations follow the <Link to="/refund-policy">refund and cancellation policy</Link>.</p>
      <h2>4. Research services</h2>
      <p>Services are provided under a written quote that sets out scope, deliverables, price and timeline. Results are for research use only and are not a clinical or diagnostic report.</p>
      <h2>5. Nayancode software</h2>
      <p>Nayancode software is provided free of charge during the public preview, “as is”, for research and education. It is not a medical device and must not be used for clinical decisions. You remain responsible for checking results before relying on them. Open-source components remain under their own licences, listed on the <Link to="/licenses">licences page</Link>.</p>
      <h2>6. Acceptable use</h2>
      <p>Do not misuse the website or software: no attempts to disrupt it, gain unauthorised access, or use it for unlawful purposes.</p>
      <h2>7. Intellectual property</h2>
      <p>The {BRAND.name}, Vedicgen and Nayancode names and logos, and the website content, belong to {BRAND.name} unless stated otherwise.</p>
      <h2>8. Liability</h2>
      <p>To the extent permitted by law, our total liability for any claim relating to a programme or service is limited to the fees you paid for it. We are not liable for indirect or consequential losses.</p>
      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of India. Courts at the place of our registered office have exclusive jurisdiction.</p>
      <h2>10. Contact</h2>
      <p><a href={`mailto:${BRAND.emails.general}`}>{BRAND.emails.general}</a> · {addressText()}</p>
    </LegalPage>
  );
}

export function Refunds() {
  return (
    <LegalPage title="Refund and cancellation policy" path="/refund-policy" lede="How cancellations, transfers and refunds work for Vedicgen courses, programmes, internships and workshops.">
      <h2>Courses, programmes and workshops</h2>
      <ul>
        <li><b>Cancel 7 or more days before the start date:</b> full refund of the fee paid.</li>
        <li><b>Cancel fewer than 7 days before the start:</b> 75% refund, or a free transfer to a later cohort.</li>
        <li><b>After the course has started:</b> no refund, but you may transfer once to the next cohort within 6 months, subject to availability.</li>
        <li><b>Self-paced courses:</b> full refund within 7 days of access if you have completed less than 20% of the lessons.</li>
        <li><b>Wet-lab courses:</b> after the start date, fees are non-refundable because reagents are purchased per participant.</li>
      </ul>
      <h2>Internships</h2>
      <ul>
        <li><b>Before the start date:</b> full refund if you cancel 7 or more days before; 75% otherwise.</li>
        <li><b>Within the first week:</b> a pro-rata refund for the unused weeks, minus 25% of the fee, if the internship is not suitable for you.</li>
        <li>No refund after the first week, except as below.</li>
      </ul>
      <h2>If we cancel or change</h2>
      <p>If we cancel a cohort or cannot provide a confirmed place, you choose between a full refund and a transfer. If we move a start date by more than 14 days, you may cancel for a full refund.</p>
      <h2>How refunds are paid</h2>
      <p>Refunds are paid to the original payment method within 10 working days of approval. GST is refunded in proportion where the law allows.</p>
      <h2>How to request</h2>
      <p>Write to <a href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a> with your name, programme and payment reference.</p>
    </LegalPage>
  );
}
