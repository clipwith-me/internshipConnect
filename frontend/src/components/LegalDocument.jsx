import PageHero from './PageHero';

/**
 * Shell for legal/long-form text pages: hero + readable measure + numbered sections.
 *
 *   <LegalDocument title="Privacy policy" updated="October 2026">
 *     <LegalSection title="1. Introduction"><p>…</p></LegalSection>
 *   </LegalDocument>
 */
export function LegalSection({ title, children }) {
  return (
    <section className="border-t border-neutral-200 pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-neutral-700 [&_a]:font-medium [&_a]:text-primary-600 [&_a]:underline [&_a:hover]:text-primary-700 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_strong]:text-neutral-900">
        {children}
      </div>
    </section>
  );
}

export default function LegalDocument({ title, updated, children }) {
  return (
    <>
      <PageHero title={title} description={updated ? `Last updated: ${updated}` : undefined} />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-14 sm:px-6">{children}</article>
    </>
  );
}
