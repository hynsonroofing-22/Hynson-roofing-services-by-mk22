import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Copied word-for-word from the client's live site
 * (hynsonroofingservices.co.nz/accessibility-statement) at the client's
 * request, including its unfilled placeholders (e.g. "[enter relevant
 * date]").
 *
 * NOTE: this is Wix's generic template text and includes an unverified
 * WCAG 2.1 AA compliance claim — see LAUNCH-BLOCKERS.md. The client asked
 * for a direct copy for now and will confirm next steps later.
 */
export default function AccessibilityStatement() {
  return (
    <div className="bg-ink-950" data-testid="accessibility-statement-page">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-36">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase hover:text-brand">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>

        <h1 className="mt-8 font-display text-3xl font-extrabold uppercase tracking-tight text-zinc-50 sm:text-5xl">
          Accessibility Statement
        </h1>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-zinc-400">
          <p>
            At Hynson Roofing Services Limited, we are committed to ensuring our website is accessible to everyone,
            including individuals with disabilities. We believe in creating an inclusive online experience and strive
            to meet all legal requirements to support accessibility.
          </p>

          <p>
            This statement was last updated on [enter relevant date]. We at Hynson Roofing Services Limited are
            dedicated to making our website, www.hynsonroofing.com, accessible to all users, ensuring that everyone
            can easily navigate and benefit from our services.
          </p>

          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-zinc-50">What web accessibility is</h2>
            <p className="mt-3">
              Web accessibility means that all visitors, including those with disabilities, can access and enjoy our
              site with the same ease as others. We utilize modern technologies and design practices to enhance the
              user experience for everyone.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-zinc-50">Accessibility adjustments on this site</h2>
            <p className="mt-3">
              We have made significant adjustments to our website in accordance with WCAG 2.1 guidelines, achieving an
              AA compliance level. Our content is tailored to work seamlessly with assistive technologies, including
              screen readers and keyboard navigation. As part of this initiative, we have done the following:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Utilized accessibility tools to identify and rectify potential issues</li>
              <li>Defined the primary language of our site</li>
              <li>Structured our content for intuitive navigation</li>
              <li>Implemented clear heading hierarchies across all pages</li>
              <li>Provided alternative text for all relevant images</li>
              <li>Ensured color contrasts meet accessibility standards</li>
              <li>Minimized motion effects on the site</li>
              <li>Confirmed that all multimedia content is accessible</li>
            </ul>
            <p className="mt-3">
              We acknowledge that some content from third parties may affect our compliance with accessibility
              standards.
            </p>
            <p className="mt-3">
              Certain pages on our site may include content from [enter relevant third-party name], which may not
              fully comply with accessibility standards. These pages include: [list the URLs of the pages]. We
              therefore declare partial compliance for these sections.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-zinc-50">Accessibility arrangements in the organization</h2>
            <p className="mt-3">
              Hynson Roofing Services Limited provides accessible arrangements at our physical locations, including
              designated parking, ramps, and accessible entrances to ensure all customers can comfortably access our
              services and facilities.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-zinc-50">Requests, issues, and suggestions</h2>
            <p className="mt-3">
              If you encounter any accessibility issues on our website or need assistance, please reach out to our
              accessibility coordinator:
            </p>
            <p className="mt-3">
              [Name of the accessibility coordinator]
              <br />
              [Telephone number of the accessibility coordinator]
              <br />
              [Email address of the accessibility coordinator]
              <br />
              [Enter any additional contact details if relevant / available]
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
