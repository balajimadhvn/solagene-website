# Solagene launch checklist

The site is complete and deployable as it is. The items below are **owner inputs** (facts only you can supply) and
**external accounts** (free services that need your login). Nothing on the site is a fake placeholder: empty values are
simply hidden until you fill them in.

## A. Must do before going public
- [ ] **Push to GitHub and enable Pages** (README → "Deploy to GitHub Pages").
- [ ] **DNS for solagene.com** at your domain registrar (README → "Custom domain").
- [ ] **Activate form delivery (FormSubmit, no account)**: after the site is live, send one test message from the Contact page
      for each team (General, Admissions & help, Software support) and click **Activate Form** in the e-mail each inbox receives.
- [ ] **Inboxes exist and are monitored** (free: Namecheap → Redirect Email to your Gmail): contact@solagene.com (general), help@solagene.com (admissions/help), support@solagene.com (software support).
- [ ] **Review business policies shown on the site** (see `docs/PRICING-RESEARCH.md` §3): fees, 10% group discount,
      instalments above ₹15,000, 7-day refund rule, free Nayancode internship, wet-lab venue.
- [ ] **Legal pages**: have a lawyer review Privacy (DPDP Act 2023), Terms and Refunds in `src/site/pages/Legal.tsx`, and add
      your registered legal entity name if it differs from "Solagene".

## B. Company details (one file: `src/core/brand.ts`, all optional)
- [ ] Chennai office: full street address in `BRAND.locations` (only the city is shown until then).
- [ ] `BRAND.phone` and `BRAND.whatsapp` (WhatsApp shows a chat button when set).
- [ ] `BRAND.socials` (LinkedIn, Instagram, YouTube, X, GitHub; only filled ones are shown and added to the Organization JSON-LD).
- [ ] `BRAND.hours` if different from Monday–Saturday, 10:00–18:00 IST.
- [ ] `TEAM`: founder and instructor profiles (`name`, `role`, `bio`, optional `photo`, `credentials`, `links`). The About page shows a team section
      once this has entries. Course pages say instructors are named in the admission offer until then.
- [ ] Logo: the files are in `public/brand/` (`solagene-mark.svg`, `solagene-wordmark.svg`, original artwork
      `solagene-logo-original.webp`). Replace them to change the logo everywhere, then run `npm run og` to regenerate the
      share images and app icons.

## C. Admissions data
- [ ] **Cohort dates and payment links**: `BATCHES` in `src/site/data/courses-all.ts`, e.g.
      `'rna-seq-data-analysis': { start: '16 November 2026', schedule: 'Tue & Thu, 19:00–21:00 IST', seats: 30, paymentUrl: 'https://rzp.io/l/…', instructor: 'Dr … (must match a TEAM name)' }`.
      Until set, course pages say dates are sent with the admission offer and the button leads to the application form;
      with a `paymentUrl` the button becomes "Enrol and pay".
- [ ] **Payment gateway**: create Razorpay/Cashfree payment links (no server needed) and paste them into `BATCHES`.
- [ ] **Certificates**: after each cohort add issued certificates to `public/certificates.json`
      (`[{ "id": "VG-2026-0001", "name": "…", "course": "…", "issued": "2026-12-20" }]`); `/verify/` checks them.

## D. Search and analytics (free)
- [ ] If you add any third-party script (analytics, chat widget, video embed), allow its domain in the
      Content-Security-Policy meta tag in `index.html` (GitHub Pages cannot send security headers, so the policy lives there).
- [ ] Google Search Console: Domain property, verify by DNS TXT, submit `/sitemap.xml` (docs/SEO-STRATEGY.md).
- [ ] Bing Webmaster Tools: import from Search Console.
- [ ] Google Business Profile for the HSR Layout address.
- [ ] Optional cookie-less analytics: Cloudflare Web Analytics token in `INTEGRATIONS` (`src/core/brand.ts`).

## E. After launch
- [ ] Send a test message through every form (contact, course application, internship application, quote, demo request, collaboration) and confirm it arrives in the right inbox.
- [ ] Open the site on a phone and check the menu, the Workbench and one course application.
- [ ] Publish two knowledge-hub guides a month; add real testimonials only after real cohorts.

## What needs an external service (and what does not)
| Feature | Works now without setup | Needs |
|---|---|---|
| All pages, navigation, search, filters, fee switchers | Yes | — |
| Workbench, 9 studios, free tools | Yes (runs in the browser) | — |
| Forms (applications, enquiries, quotes, demo) | Yes, delivered by FormSubmit to the right inbox | One-time activation click per inbox |
| Newsletter sign-up | Yes, through the form backend or e-mail app | Optional Buttondown/ConvertKit endpoint |
| Online payments | No (by design: no fake checkout) | Razorpay/Cashfree payment links in `BATCHES` |
| Certificate verification | Yes, for IDs in `public/certificates.json` | You add issued certificates |
| Public-database lookups in studios (ClinVar, PubChem, RCSB…) | Yes (their free public APIs) | — |
