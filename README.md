# Solagene website: solagene.com

The website of **Solagene**, a computational biotechnology company: AI and physics-based drug discovery, multi-omics and
spatial biology, target discovery, and computational, clinical-genomics and bio-IT work for partners
(`/science/`, `/solutions/`, `/industry/`, `/research/`, `/services/`). Two smaller parts of the company have their own sections:

* **Solagene Vedicgen** (school): 73 wet-lab and computational courses, 9 programmes, 12 internship tracks, workshops,
  research training and institutional programmes, with published INR fees, application forms and certificate verification.
* **Solagene Nayancode** (software): 13 products, including the **Workbench** (nine analysis studios that run in the
  browser) and 11 free online tools.

It is a static site: no server, no database and no paid service. Hosting on GitHub Pages is free.

> Before launch, read **`docs/LAUNCH-CHECKLIST.md`**. Pricing sources are in `docs/PRICING-RESEARCH.md`, the search plan in
> `docs/SEO-STRATEGY.md`, and the full build history in `SOLAGENE-PROGRESS.md`.

---

## Deploy to GitHub Pages (step by step)

1. **Create a repository** on GitHub (for example `solagene-website`) and push this folder to its `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Solagene website"
   git branch -M main
   git remote add origin https://github.com/<your-account>/solagene-website.git
   git push -u origin main
   ```
   (`node_modules/`, `dist/` and test output are in `.gitignore`, so they are not uploaded.)
2. In the repository open **Settings → Pages** and set **Source: GitHub Actions**.
3. The workflow `.github/workflows/deploy.yml` now runs on every push to `main`: it installs, runs the unit tests, builds,
   runs the browser tests against the built site exactly as GitHub Pages serves it, and publishes `dist/`. Watch it under the
   **Actions** tab (about 5 minutes).
4. Optional **repository variables** (Settings → Secrets and variables → Actions → *Variables*):
   | Variable | Value | Effect |
   |---|---|---|
   | `VITE_FORM_ENDPOINT` | `https://formspree.io/f/<form-id>` (or `https://api.web3forms.com/submit`) | Forms are delivered straight to your inbox instead of opening the visitor's e-mail app |
   | `VITE_FORM_ACCESS_KEY` | Web3Forms access key | Only when using Web3Forms |
   | `VITE_GOOGLE_SITE_VERIFICATION` | the `content` value of Google's HTML tag | Search Console HTML-tag verification (DNS verification needs nothing here) |
   | `BASE_PATH` | `/solagene-website/` | **Only** if you serve from `https://<account>.github.io/<repo>/` without a custom domain |
   After changing a variable, re-run the workflow (Actions → Deploy to GitHub Pages → Run workflow).

### Custom domain: solagene.com (bought at Namecheap)
`public/CNAME` already contains `solagene.com`.
1. Log in to Namecheap → **Domain List** → **Manage** next to solagene.com → **Advanced DNS**.
2. Delete any existing records for `@` and `www` that point to a Namecheap parking page (type URL Redirect or CNAME `parkingpage.namecheap.com`).
3. Add these records (Host / Value, TTL Automatic):
   | Type | Host | Value |
   |---|---|---|
   | A Record | `@` | `185.199.108.153` |
   | A Record | `@` | `185.199.109.153` |
   | A Record | `@` | `185.199.110.153` |
   | A Record | `@` | `185.199.111.153` |
   | CNAME Record | `www` | `<your-github-username>.github.io.` |
4. In the GitHub repository: **Settings → Pages → Custom domain** → enter `solagene.com` → Save. When the DNS check passes, tick **Enforce HTTPS**.
5. Recommended: GitHub → your profile **Settings → Pages → Add a verified domain** (prevents domain takeover).

DNS can take from a few minutes to 24 hours. Do not touch the **Mail settings** section in Namecheap except to set up e-mail below.

### E-mail for @solagene.com
The site sends people to contact@, help@ and support@solagene.com, so these must receive mail. The free option: Namecheap →
Manage → **Redirect Email** (Mail settings: "Email Forwarding") → forward `contact`, `help` and `support` to your existing
Gmail. Paid mailboxes (Namecheap Private Email, Google Workspace, Zoho) also work.

### Forms (FormSubmit, no account needed)
Every form posts to FormSubmit, which e-mails it to the right inbox (contact@, help@ or support@). No sign-up is needed.
**Once, after the site is live:** send one test message from the Contact page with each team selected (General,
Admissions & help, Software support). FormSubmit then e-mails an **Activate Form** link to each address; click it. Until
an inbox is activated, its form shows the visitor a pre-filled e-mail fallback instead of claiming success.
To use Formspree or Web3Forms instead, set the `VITE_FORM_ENDPOINT` repository variable; to switch online delivery off
entirely, set `VITE_FORM_PROVIDER=mailto`.

---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA (optional) | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
   | CNAME | `www` | `<your-account>.github.io` |
2. In **Settings → Pages → Custom domain** enter `solagene.com`, save, wait for the DNS check, then tick **Enforce HTTPS**.
3. Recommended: verify the domain for your account (GitHub → Settings → Pages → *Add a verified domain*) to prevent takeover.

DNS changes can take from minutes to 24 hours. Mail for `@solagene.com` is not affected by these records (keep your MX records).

---

## Edit content

| What | Where |
|---|---|
| Company name, tagline, e-mails, address, phone, WhatsApp, hours, socials | `src/core/brand.ts` (`BRAND`, `DIVISIONS`) |
| Team / founder / instructor profiles | `TEAM` in `src/core/brand.ts` (the About page shows the team once filled) |
| Logo | `public/brand/solagene-mark.svg`, `solagene-wordmark.svg` (+ `src/site/wordmark.ts` for the inline wordmark); then `npm run og` |
| Courses (73) | `src/site/data/courses-bioinfo*.ts`, `courses-computing.ts`, `courses-biotech.ts`, `courses-life.ts` |
| Course fee tiers | `TIER_FEES` / `TIER_USD` in `src/site/data/course-types.ts` (per-course `fees` overrides them) |
| Cohort dates, seats, payment links, instructor | `BATCHES` in `src/site/data/courses-all.ts` |
| Programmes | `src/site/data/programs.ts` |
| Internships (eligibility, selection, process, deliverables, fees) | `src/site/data/internships.ts` |
| Workshops, research training, institutional programmes | `src/site/data/training.ts` |
| Services (with `status: 'available' \| 'planned'`) | `src/site/data/services.ts` |
| Nayancode products | `src/site/data/products.ts`; screenshots in `public/img/products/` (`npm run screens` recaptures them) |
| Research areas | `src/site/data/research.ts` |
| Knowledge-hub guides | Markdown in `src/site/articles/<slug>.md` + an entry in `src/site/data/articles.ts` |
| Page titles, descriptions, structured data | `src/site/seo.ts` |
| Issued certificates (for `/verify/`) | `public/certificates.json` |
| Legal pages | `src/site/pages/Legal.tsx` |

A new course, programme, internship, service, product or guide gets its page, cards, menu entries, sitemap entry and
structured data automatically. The lightweight search index (`src/site/data/site-index.json`) is regenerated by `dev` and
`build`.

## Nayancode Workbench source
The Workbench is open source (Apache-2.0) at https://github.com/balajimadhvn/nayancode, which is the source of truth for
the analysis code and has its own tests, releases and DOI. To bring changes from there into this website, check it out
next to this folder and run `node scripts/sync-workbench.mjs`, then `npm test && npm run build`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 with live reload
npm test           # 198 unit tests (vitest)
npm run build      # licence audit + type-check + client build + prerender → dist/
npm run preview    # serve dist/ on :4173 like a static host (trailing-slash redirects, real 404)
npm run e2e        # browser tests (Playwright) against dist/
GH_PAGES=1 E2E_PORT=4182 npm run e2e   # same, but exactly as GitHub Pages serves it (no custom headers)
npm run og         # regenerate share images and app icons from the logo
```

## How it works
* **React + Vite + react-router**. Every public route (199 pages) is **prerendered to static HTML** at build time with its
  own title, description, canonical URL, Open Graph image and JSON-LD, then hydrated in the browser. Search engines and
  social previews see complete pages; visitors get a fast interactive app.
* **GitHub Pages URL scheme**: pages live at `/path/` (`path/index.html`); `/path` gets GitHub's 301 to `/path/`; unknown
  URLs get the real `404.html` with status 404. 91 old URLs have redirect pages. `sitemap.xml` and `robots.txt` are generated.
* **Code splitting**: the entry bundle carries only a small generated index (~115 KB gzipped JavaScript in total); the full
  course syllabi load only on course pages, and each Workbench studio loads on demand.
* **Design system**: `src/site/solagene.css` (tokens, components, light and dark themes, sub-brand accents) on top of
  `src/site/site.css`; fonts are self-hosted (Plus Jakarta Sans, IBM Plex Sans/Mono). Animations respect
  `prefers-reduced-motion`.
* **Workbench**: `src/studios/*` (each studio = tested kernels + worker + UI), `src/core`, `src/compute`, `src/viz`,
  `src/ui`. Heavy work runs in Web Workers and WebAssembly (minimap2, samtools, RDKit) on the visitor's computer.
* `public/_headers` adds security and cross-origin-isolation headers on hosts that support it (Cloudflare Pages, Netlify).
  GitHub Pages ignores it; the site and every studio are tested to work without it.

## Testing
* `npm test`: unit tests for the scientific kernels (statistics, alignment, phylogenetics, clustering, chemistry,
  structure; planted-truth simulations; regression on PDB 1HSG) and the site data.
* `npm run e2e`: 31 browser tests against the production build: every page prerendered with a unique title and description
  and hydrating without errors; GitHub Pages redirects and 404; "Bengaluru" appears only in the postal address; every
  course card opens a full syllabus; catalogue filters; fee switcher and form validation; internship statement-of-purpose
  minimum; mega menus, Workbench button and mobile menu; contact routing; sitemap, robots and JSON-LD; no broken internal
  links; free tools; and the main workflow of every Workbench studio.

## Licences
`npm run licenses` checks every production dependency against a permissive allow-list and fails the build otherwise.
`/licenses` (inside the Workbench) lists packages and data sources with their terms. Not legal advice.

## Honest limits
* Forms are delivered by FormSubmit once each inbox is activated (one click per inbox); payments need payment links.
  No fake back-end functionality is built.
* Workbench budgets are browser-scale (for example read mapping against references up to about 100 Mb). Larger pipelines run
  on a cluster and their results can be imported.
* Planned services and roadmap products are labelled as such and accept "register interest" only.
* Research and education use; not for clinical decisions.
