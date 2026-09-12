import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Copied word-for-word from the client's live site
 * (hynsonroofingservices.co.nz/privacy-policy) at the client's request.
 *
 * NOTE: this is Wix's generic unfilled template text, not a policy
 * written for Hynson specifically — see LAUNCH-BLOCKERS.md. The client
 * asked for a direct copy for now and will confirm next steps on a real,
 * Hynson-specific policy later.
 */
export default function PrivacyPolicy() {
  return (
    <div className="bg-ink-950" data-testid="privacy-policy-page">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-36">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase hover:text-brand">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>

        <h1 className="mt-8 font-display text-3xl font-extrabold uppercase tracking-tight text-zinc-50 sm:text-5xl">Privacy Policy</h1>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-zinc-400">
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-zinc-50">A legal disclaimer</h2>
            <p className="mt-3">
              The explanations and information provided on this page are only general and high-level explanations and
              information on how to write your own document of a Privacy Policy. You should not rely on this article as
              legal advice or as recommendations regarding what you should actually do, because we cannot know in
              advance what are the specific privacy policies you wish to establish between your business and your
              customers and visitors. We recommend that you seek legal advice to help you understand and to assist you
              in the creation of your own Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-zinc-50">Privacy Policy — the basics</h2>
            <p className="mt-3">
              Having said that, a privacy policy is a statement that discloses some or all of the ways a website
              collects, uses, discloses, processes, and manages the data of its visitors and customers. It usually
              also includes a statement regarding the website's commitment to protecting its visitors' or customers'
              privacy, and an explanation about the different mechanisms the website is implementing in order to
              protect privacy.
            </p>
            <p className="mt-3">
              Different jurisdictions have different legal obligations of what must be included in a Privacy Policy.
              You are responsible to make sure you are following the relevant legislation to your activities and
              location.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-zinc-50">What to include in the Privacy Policy</h2>
            <p className="mt-3">
              Generally speaking, a Privacy Policy often addresses these types of issues: the types of information the
              website is collecting and the manner in which it collects the data; an explanation about why is the
              website collecting these types of information; what are the website's practices on sharing the
              information with third parties; ways in which your visitors and customers can exercise their rights
              according to the relevant privacy legislation; the specific practices regarding minors' data collection;
              and much, much more.
            </p>
            <p className="mt-3">To learn more about this, check out our article "Creating a Privacy Policy".</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
