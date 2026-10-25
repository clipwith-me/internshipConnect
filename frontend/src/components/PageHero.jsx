/**
 * Heading block for informational public pages.
 * Renders the page's single <h1>.
 */
export default function PageHero({ eyebrow, title, description, className = '' }) {
  return (
    <section className={`border-b border-neutral-200 bg-gradient-to-b from-primary-50/60 to-white ${className}`}>
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
        {eyebrow && <p className="text-sm font-semibold text-primary-600">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-5xl sm:leading-[1.1]">{title}</h1>
        {description && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{description}</p>}
      </div>
    </section>
  );
}
