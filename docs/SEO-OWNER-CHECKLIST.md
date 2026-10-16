# SEO: what only the owner can do

The site side is done (see `docs/SEO-RESEARCH-2026.md`). Google and Bing only start showing a new domain after they have been told about it, so these steps matter more than any further on-page work. Nothing here has been done on the owner's behalf; no accounts were created.

## This week
1. **Google Search Console** (search.google.com/search-console): add a *Domain* property for `solagene.com`, verify with the DNS TXT record (Cloudflare DNS, one click if you sign in with the same Google account).
2. In Search Console → *Sitemaps*, submit `https://solagene.com/sitemap.xml`.
3. *URL inspection → Request indexing* for: `/`, `/vedicgen/`, `/vedicgen/courses/`, `/vedicgen/internships/`, `/vedicgen/programs/`, `/vedicgen/workshops/`, `/nayancode/`, `/services/`. (Limited daily quota; these eight first.)
4. **Bing Webmaster Tools** (bing.com/webmasters): *Import from Google Search Console* (one click). This also covers DuckDuckGo and Ecosia results.
5. After the next deploy, tell Bing about every URL at once (key file `public/cb9792a9427d507d65125b3a8586e616.txt` is already in the site):
   ```bash
   node scripts/indexnow.mjs
   ```
6. Check *Pages* and *Enhancements* (Breadcrumbs, Logo, Course list) in Search Console after a week. Favicon and logo can take days to weeks to appear after Google recrawls.

## Within a month
7. **LinkedIn company page** for Solagene, then add its URL to `BRAND.socials` in `src/core/brand.ts`. The Organization markup picks it up as `sameAs`; it is deliberately empty until a real profile exists. Same for any other real profile.
8. **Google Business Profile**: only for a premises customers can visit, with a street address you are happy to publish. The Bengaluru HSR Layout office is the only published address. The Chennai entry has no street address, so no Chennai listing or Chennai landing page was created.
9. Fill the remaining launch-checklist items: `TEAM` (named instructors, because courses led by identifiable people rank and convert better), `foundingYear`, `legalName`, phone if you want one.
10. **Backlinks** (the main thing that moves broad queries like "bioinformatics course India"; all legitimate and free):
    * Mail college placement / career cells and department heads with the institutions page and an offer of a free workshop; ask for a link on the college's events or value-added course page.
    * [bio.tools](https://bio.tools) entry for Nayancode, GitHub repository topics + README link, the Zenodo record (DOI 10.5281/zenodo.23393495) linking to solagene.com, ORCID profile website field.
    * Education directories that list training providers (check each one's terms; skip any that charge for a link or sell reviews).
    * Short guides from the Learn section posted on LinkedIn and ResearchGate with a link back.
11. **Real reviews** after the first cohorts: ask learners (with their consent) for a Google review or LinkedIn recommendation. Do not add rating markup until real ones exist.

## Expectations
Brand queries ("Solagene", "Vedicgen", "Nayancode") should appear within days to a few weeks after steps 1 to 3. Specific long-tail queries (a named course plus its tools, "RNA-seq course", "molecular docking course") take 1 to 4 months. Head terms such as "bioinformatics course" are dominated by institutes and aggregators and depend on backlinks; they take many months and nobody can promise a position.
