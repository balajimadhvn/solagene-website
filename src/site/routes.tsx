import { Route } from 'react-router-dom';
import type * as Eager from './pages.eager';
import SiteLayout from './SiteLayout';

type Pages = { [K in keyof typeof Eager]: React.ComponentType };

/** Public site routes. Shared by the browser app (lazy pages) and the prerenderer (eager pages) so both render the same tree. */
export function siteRoutes(P: Pages) {
  return (
    <Route element={<SiteLayout />}>
      <Route path="/" element={<P.Home />} />
      <Route path="/about" element={<P.About />} />
      <Route path="/contact" element={<P.Contact />} />
      <Route path="/science" element={<P.Science />} />
      <Route path="/solutions" element={<P.Solutions />} />
      <Route path="/industry" element={<P.Industry />} />
      <Route path="/research" element={<P.ResearchHub />} />
      <Route path="/research/:slug" element={<P.ResearchArea />} />
      <Route path="/services" element={<P.ServicesHub />} />
      <Route path="/services/:slug" element={<P.ServiceDetail />} />
      <Route path="/learn" element={<P.LearnHub />} />
      <Route path="/learn/:slug" element={<P.ArticlePage />} />
      <Route path="/verify" element={<P.Verify />} />
      <Route path="/privacy" element={<P.Privacy />} />
      <Route path="/terms" element={<P.Terms />} />
      <Route path="/refund-policy" element={<P.Refunds />} />

      <Route path="/vedicgen" element={<P.VedicgenHome />} />
      <Route path="/vedicgen/courses" element={<P.CourseCatalogue />} />
      <Route path="/vedicgen/courses/:slug" element={<P.CourseDetail />} />
      <Route path="/vedicgen/programs" element={<P.ProgramsHub />} />
      <Route path="/vedicgen/programs/:slug" element={<P.ProgramDetail />} />
      <Route path="/vedicgen/internships" element={<P.InternshipsHub />} />
      <Route path="/vedicgen/internships/:slug" element={<P.InternshipDetail />} />
      <Route path="/vedicgen/workshops" element={<P.Workshops />} />
      <Route path="/vedicgen/research-training" element={<P.ResearchTraining />} />
      <Route path="/vedicgen/institutions" element={<P.Institutions />} />
      <Route path="/vedicgen/pricing" element={<P.Pricing />} />
      <Route path="/vedicgen/apply" element={<P.Apply />} />

      <Route path="/nayancode" element={<P.NayancodeHome />} />
      <Route path="/nayancode/products" element={<P.ProductsHub />} />
      <Route path="/nayancode/products/:slug" element={<P.ProductDetail />} />
      <Route path="/nayancode/tools" element={<P.ToolsHub />} />
      <Route path="/nayancode/tools/:slug" element={<P.ToolPage />} />
      <Route path="/nayancode/docs" element={<P.Docs />} />
      <Route path="/nayancode/pricing" element={<P.Licensing />} />
      <Route path="/nayancode/demo" element={<P.Demo />} />
      <Route path="*" element={<P.NotFound />} />
    </Route>
  );
}
