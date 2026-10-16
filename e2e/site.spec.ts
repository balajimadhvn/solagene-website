import { expect, test, type Page } from '@playwright/test';

// Vivofold public site, tested against the production build (prerendered HTML + hydration), served exactly like
// GitHub Pages (scripts/serve.mjs): /path/ → path/index.html, /path → 301 /path/, unknown → 404.html (status 404).

function watch(page: Page) {
  const errs: string[] = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource.*(rcsb|ebi\.ac|ncbi|uniprot)/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 240)); });
  return errs;
}

const PAGES: [string, RegExp][] = [
  ['/', /find drug targets/], ['/about/', /computational life-science company/i], ['/science/', /Computation decides/], ['/solutions/', /Work we take on/], ['/industry/', /Where AI drug discovery/], ['/contact/', /talk/i], ['/research/', /Research questions/],
  ['/research/genomics-transcriptomics/', /Genomics & Transcriptomics/], ['/services/', /Research services/], ['/services/rna-seq-analysis/', /RNA-seq/],
  ['/services/molecular-biology-services/', /Molecular Biology Laboratory Services/], ['/learn/', /Tutorials and guides/], ['/learn/qpcr-delta-delta-ct-method/', /ΔΔCt/],
  ['/verify/', /Verify/], ['/privacy/', /Privacy/], ['/terms/', /Terms/], ['/refund-policy/', /Refund/],
  ['/vedicgen/', /From pipette/], ['/vedicgen/courses/', /Bioinformatics, biotechnology and computing courses/], ['/vedicgen/courses/rna-seq-data-analysis/', /RNA-seq Data Analysis/],
  ['/vedicgen/courses/molecular-biology-techniques/', /Molecular Biology Techniques/], ['/vedicgen/programs/', /certificate programmes/], ['/vedicgen/programs/genomics-data-science/', /Genomics Data Science/],
  ['/vedicgen/internships/', /internships for students/], ['/vedicgen/internships/bioinformatics-genomics-internship/', /Bioinformatics & Genomics/], ['/vedicgen/workshops/', /workshops/i],
  ['/vedicgen/research-training/', /Research training/], ['/vedicgen/institutions/', /Training for colleges/], ['/vedicgen/pricing/', /Transparent fees/], ['/vedicgen/apply/', /Apply to Vedicgen/],
  ['/nayancode/', /See the biology/], ['/nayancode/products/', /Scientific software products/], ['/nayancode/products/genome-studio/', /Genome Studio/],
  ['/nayancode/tools/', /Free bioinformatics tools/], ['/nayancode/tools/gc-content-calculator/', /GC Content Calculator/], ['/nayancode/docs/', /documentation/i],
  ['/nayancode/pricing/', /Free to use/], ['/nayancode/demo/', /demo/i],
];

test('every public page is prerendered, hydrates without errors and has a unique title and description', async ({ page, request }) => {
  const errs = watch(page);
  const titles = new Set<string>(), descriptions = new Set<string>();
  for (const [route, h1] of PAGES) {
    const res = await request.get(route);
    expect(res.status(), `${route} status`).toBe(200);
    const html = await res.text();
    expect(html, `${route} should be prerendered`).toMatch(/<h1[^>]*>/);
    expect(html).toContain(`<link rel="canonical" href="https://vivofold.in${route}"`);
    expect(html.match(/<h1[\s>]/g)?.length, `${route} has exactly one h1`).toBe(1);
    await page.goto(route); await expect(page.locator('h1').first()).toHaveText(h1, { timeout: 15_000 });
    titles.add(await page.title());
    descriptions.add((await page.locator('meta[name="description"]').getAttribute('content')) ?? '');
  }
  expect(titles.size).toBe(PAGES.length);
  expect(descriptions.size).toBe(PAGES.length);
  expect(errs).toEqual([]);
});

test('Static-host behaviour: slashless URLs redirect, unknown URLs are a real 404, old URLs redirect', async ({ request, page }) => {
  const r = await request.get('/vedicgen/courses', { maxRedirects: 0 });
  // GitHub Pages answers 301, Cloudflare's static assets 307; canonical tags carry the slash URL either way.
  expect([301, 307, 308]).toContain(r.status()); expect(new URL(r.headers().location, 'http://x').pathname).toBe('/vedicgen/courses/');
  const nf = await request.get('/no-such-page/'); expect(nf.status()).toBe(404); expect(await nf.text()).toContain('could not be found');
  await page.goto('/courses/rna-seq-data-analysis/'); await expect(page).toHaveURL(/\/vedicgen\/courses\/rna-seq-data-analysis\/$/);
  await expect(page.locator('h1')).toHaveText(/RNA-seq Data Analysis/);
});

test('"Bengaluru" appears only in the postal address', async ({ request }) => {
  for (const route of ['/', '/vedicgen/', '/vedicgen/courses/animal-cell-culture/', '/vedicgen/internships/', '/about/']) {
    const html = await (await request.get(route)).text();
    const body = html.slice(html.indexOf('<div id="root"'));
    const visible = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<address[\s\S]*?<\/address>/g, '').replace(/<[^>]+>/g, ' ');
    expect(visible, `${route} mentions Bengaluru outside the address`).not.toMatch(/Bengaluru|Bangalore/);
  }
});

test('every course card in the catalogue opens its own detail page with the full syllabus', async ({ page }) => {
  const errs = watch(page);
  await page.goto('/vedicgen/courses/');
  const hrefs = await page.locator('#catalogue a.ccard').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')!))]);
  expect(hrefs.length).toBeGreaterThanOrEqual(70);
  for (const href of hrefs) {
    await page.goto(href);
    await expect(page.locator('h1')).not.toHaveText('');
    for (const id of ['overview', 'outcomes', 'eligibility', 'curriculum', 'practicals', 'resources', 'format', 'instructor', 'certificate', 'apply', 'faq']) await expect(page.locator(`#${id}`), `${href} #${id}`).toHaveCount(1);
    await expect(page.locator('.mods .acc-item')).not.toHaveCount(0);
    await expect(page.locator('#apply form')).toBeVisible();
  }
  expect(errs).toEqual([]);
});

test('catalogue filters, search and URL state work', async ({ page }) => {
  const errs = watch(page); await page.goto('/vedicgen/courses/');
  await page.getByRole('tab', { name: /Biotechnology/ }).click();
  await expect(page).toHaveURL(/school=biotechnology/);
  const n = await page.locator('#catalogue a.ccard').count(); expect(n).toBeGreaterThan(5);
  await page.getByRole('searchbox', { name: 'Search courses' }).fill('ELISA');
  await expect(page.locator('#catalogue a.ccard')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('#catalogue a.ccard')).not.toHaveCount(1);
  expect(errs).toEqual([]);
});

test('course page: format switcher updates the fee and the application form validates', async ({ page }) => {
  const errs = watch(page); await page.goto('/vedicgen/courses/ngs-data-analysis/');
  const price = page.locator('.enrol .price');
  await expect(price).toContainText('10,999');
  await page.locator('.enrol .seg button', { hasText: 'Self-paced' }).click();
  await expect(price).toContainText('4,499');
  await page.getByRole('button', { name: 'Expand all' }).click(); await expect(page.locator('.mods .acc-item.is-open')).toHaveCount(await page.locator('.mods .acc-item').count());
  const form = page.locator('#apply form');
  await form.getByRole('button', { name: /Apply now/ }).click();
  await expect(form.locator('.fld-err').first()).toBeVisible();
  await expect(form.locator('[aria-invalid="true"]').first()).toBeFocused();
  await form.getByLabel('Full name', { exact: true }).fill('Test Learner');
  await form.getByLabel('E-mail', { exact: true }).fill('learner@example.org');
  await form.getByLabel('Phone or WhatsApp').fill('+91 98765 43210');
  await expect(form.locator('[aria-invalid="true"]').first()).toBeVisible();
  expect(errs).toEqual([]);
});

test('internship application requires a statement of purpose of at least 150 characters', async ({ page }) => {
  const errs = watch(page); await page.goto('/vedicgen/internships/ai-ml-biology-internship/');
  const form = page.locator('#apply form');
  await form.getByLabel('Statement of purpose').fill('Too short.');
  await form.getByRole('button', { name: 'Submit application' }).click();
  await expect(form.getByText(/at least 150 characters/)).toBeVisible();
  expect(errs).toEqual([]);
});

test('header navigation: mega menus, Workbench button and mobile menu', async ({ page }) => {
  const errs = watch(page);
  await page.setViewportSize({ width: 1366, height: 860 }); await page.goto('/');
  await page.getByRole('button', { name: /Vedicgen/ }).first().click();
  await expect(page.locator('#mega-vedicgen')).toHaveClass(/is-open/);
  await page.keyboard.press('Escape'); await expect(page.locator('#mega-vedicgen')).not.toHaveClass(/is-open/);
  await page.locator('.hdr-wb').click(); await expect(page).toHaveURL(/\/workbench\/?$/);
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click(); await expect(page.locator('#mnav')).toHaveClass(/is-open/);
  await page.locator('#mnav').getByRole('link', { name: /Open the Workbench/ }).isVisible();
  await page.locator('#mnav').getByRole('button', { name: /Vedicgen/ }).click();
  await page.locator('#mnav').getByRole('link', { name: /All \d+ courses/ }).click();
  await expect(page).toHaveURL(/\/vedicgen\/courses\/$/); await expect(page.locator('#mnav')).not.toHaveClass(/is-open/);
  expect(errs).toEqual([]);
});

test('contact page routes messages to the right inbox', async ({ page }) => {
  const errs = watch(page); await page.goto('/contact/');
  await expect(page.locator('.form-foot small')).toContainText('contact@vivofold.in');
  await page.getByRole('tab', { name: 'Admissions & help' }).click(); await expect(page.locator('.form-foot small')).toContainText('help@vivofold.in');
  await page.getByRole('tab', { name: 'Software support' }).click(); await expect(page.locator('.form-foot small')).toContainText('support@vivofold.in');
  expect(errs).toEqual([]);
});

test('sitemap, robots and structured data are valid', async ({ request }) => {
  const sm = await (await request.get('/sitemap.xml')).text();
  expect(sm).toContain('<loc>https://vivofold.in/vedicgen/courses/rna-seq-data-analysis/</loc>');
  expect(sm).toContain('<loc>https://vivofold.in/nayancode/products/genome-studio/</loc>');
  expect((sm.match(/<loc>/g) ?? []).length).toBeGreaterThan(150);
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://vivofold.in/sitemap.xml');
  expect((await request.get('/CNAME')).status()).toBe(200);
  const html = await (await request.get('/vedicgen/courses/rna-seq-data-analysis/')).text();
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
  const types = ld['@graph'].map((x: { '@type': string | string[] }) => [x['@type']].flat()).flat();
  for (const t of ['Organization', 'Course', 'FAQPage', 'BreadcrumbList']) expect(types).toContain(t);
  const course = ld['@graph'].find((x: { '@type': string }) => x['@type'] === 'Course');
  expect(course.offers[0].priceCurrency).toBe('INR');
  expect(course.hasCourseInstance.length).toBeGreaterThan(0);
});

test('no broken internal links on key pages', async ({ page, request }) => {
  const seen = new Set<string>(); const bad: string[] = [];
  for (const start of ['/', '/vedicgen/', '/nayancode/', '/services/', '/research/', '/learn/', '/vedicgen/pricing/']) {
    await page.goto(start);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!.split('#')[0]).filter(Boolean));
    for (const h of hrefs) {
      if (seen.has(h)) continue; seen.add(h);
      const r = await request.get(h, { maxRedirects: 0 });
      if (r.status() !== 200) bad.push(`${start} → ${h} (${r.status()})`);
    }
  }
  expect(bad).toEqual([]);
});

test('free tools compute in the browser', async ({ page }) => {
  const errs = watch(page); await page.goto('/nayancode/tools/gc-content-calculator/');
  await page.waitForFunction(() => (window as unknown as { __appReady?: boolean }).__appReady); await page.waitForLoadState('networkidle');
  await page.locator('textarea').first().fill('>t\nGGCCAATT');
  await expect(page.locator('main')).toContainText(/50(\.0+)?\s*%/);
  expect(errs).toEqual([]);
});

test('courses run 4 weeks at most, durations are customisable and the form asks for a schedule', async ({ page }) => {
  const errs = watch(page);
  await page.goto('/vedicgen/courses/');
  const weeks = await page.locator('#catalogue a.ccard').evaluateAll((as) => as.map((a) => Number(a.textContent!.match(/(\d+) weeks/)?.[1] ?? 0)));
  expect(Math.max(...weeks)).toBeLessThanOrEqual(4);
  await page.goto('/vedicgen/courses/ngs-data-analysis/');
  await expect(page.locator('#format')).toContainText('Duration is customisable');
  await expect(page.locator('#overview .facts-grid')).toContainText('Up to 4 weeks');
  const sel = page.locator('#apply form').getByLabel('Preferred duration and schedule');
  await expect(sel.locator('option')).toContainText(['Standard (up to 4 weeks)', 'Intensive (1–2 weeks)', 'Weekends only']);
  await page.goto('/vedicgen/programs/genomics-data-science/');
  await expect(page.locator('main')).toContainText('customisable');
  expect(errs).toEqual([]);
});

async function fillApplication(page: Page) {
  const form = page.locator('#apply form');
  await form.getByLabel('Full name', { exact: true }).fill('Test Learner');
  await form.getByLabel('E-mail', { exact: true }).fill('learner@example.org');
  await form.getByLabel('Phone or WhatsApp').fill('+91 98765 43210');
  for (const s of await form.locator('select').all()) { const o = (await s.locator('option:not([disabled])').allInnerTexts()).filter((x) => x && x !== 'Select…'); if (o.length) await s.selectOption({ label: o[0] }); }
  await form.getByLabel('Field of study').fill('Biotechnology');
  await form.getByLabel('Institution').fill('Example University');
  await form.locator('textarea').first().fill('I want to learn RNA-seq analysis for my thesis project.');
  await form.locator('input[name=consent]').check();
  return form;
}

test('a completed application is delivered to the admissions inbox through FormSubmit with every answer', async ({ page }) => {
  const errs = watch(page); await page.goto('/vedicgen/courses/rna-seq-data-analysis/');
  const posts: { url: string; body: Record<string, string> }[] = [];
  await page.route('https://formsubmit.co/**', async (r) => { posts.push({ url: r.request().url(), body: JSON.parse(r.request().postData() ?? '{}') }); await r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true","message":"ok"}' }); });
  const form = await fillApplication(page);
  await form.getByRole('button', { name: /Apply now/ }).click();
  await expect(page.locator('#apply .form-done')).toContainText('Application received');
  expect(posts).toHaveLength(1);
  expect(posts[0].url).toBe('https://formsubmit.co/ajax/help@vivofold.in');
  expect(posts[0].body['Preferred duration and schedule']).toBe('Standard (up to 4 weeks)');
  expect(posts[0].body._replyto).toBe('learner@example.org');
  expect(posts[0].body['Full name']).toBe('Test Learner');
  expect(errs).toEqual([]);
});

test('if delivery fails or the inbox is not yet activated, the visitor gets a pre-filled e-mail fallback instead of a false success', async ({ page }) => {
  await page.goto('/vedicgen/courses/rna-seq-data-analysis/');
  await page.route('https://formsubmit.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"false","message":"needs activation"}' }));
  const form = await fillApplication(page);
  await form.getByRole('button', { name: /Apply now/ }).click();
  const err = form.locator('.notice--err');
  await expect(err).toContainText('could not be sent');
  expect(await err.getByRole('link', { name: /e-mail app/ }).getAttribute('href')).toMatch(/^mailto:help@vivofold\.in\?subject=/);
  await expect(page.locator('#apply .form-done')).toHaveCount(0);
});

test('Vivofold leads with its science, Vedicgen and Nayancode stay one click away, both offices are listed', async ({ page, request }) => {
  const errs = watch(page); await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/');
  await expect(page.locator('main')).toContainText('identify targets');
  await expect(page.locator('.flist').first().locator('li')).toHaveCount(6);
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const t of ['Science', 'Solutions', 'Vedicgen', 'Nayancode']) await expect(nav).toContainText(t);
  await page.locator('.flist-row').first().click(); await expect(page).toHaveURL(/\/science\/#generative-ai-physics-drug-discovery$/);
  await page.goto('/'); await page.getByRole('link', { name: /Visit Vedicgen/ }).click(); await expect(page).toHaveURL(/\/vedicgen\/$/);
  const html = await (await request.get('/contact/')).text();
  expect(html).toContain('Chennai'); expect(html).toContain('HSR Layout');
  expect(errs).toEqual([]);
});

test('every free tool computes a result from its example', async ({ page }) => {
  const errs = watch(page);
  for (const t of ['gc-content-calculator', 'reverse-complement', 'dna-to-protein-translator', 'orf-finder', 'protein-molecular-weight-calculator', 'protein-isoelectric-point-calculator', 'codon-usage-calculator', 'fasta-validator', 'primer-tm-calculator', 'pairwise-sequence-alignment', 'restriction-site-finder']) {
    await page.goto(`/nayancode/tools/${t}/`);
    const shell = page.locator('.tool-shell');
    const ex = shell.getByRole('button', { name: 'Example' });
    if (await ex.count()) await ex.first().click();
    await expect(shell, t).not.toContainText(/No ORF of at least|Paste a sequence/);
  }
  await page.goto('/nayancode/tools/orf-finder/');
  await expect(page.locator('.tool-shell')).toContainText(/\d+ ORFs? found/);
  expect(errs).toEqual([]);
});

test('unknown deep URLs show the 404 page without hydration errors; the dark theme persists', async ({ page }) => {
  const errs: string[] = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('/vedicgen/courses/does-not-exist/');
  await expect(page.locator('h1')).toHaveText('This page could not be found.');
  expect(errs).toEqual([]);
  await page.goto('/');
  await page.getByRole('group', { name: 'Colour theme' }).first().getByRole('button', { name: 'Dark' }).click();
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
});
