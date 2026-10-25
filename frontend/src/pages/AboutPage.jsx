import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Heart, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components';
import PageHero from '../components/PageHero';

const VALUES = [
  {
    icon: Target,
    title: 'Opportunity for all',
    body: 'Every student deserves a fair shot at work experience, regardless of their university ranking, city, or connections.',
  },
  {
    icon: Heart,
    title: 'Honest and transparent',
    body: "No fake listings, no bait-and-switch pricing, no inflated numbers. We show you what's real and let the product speak for itself.",
  },
  {
    icon: Globe,
    title: 'Built for Africa',
    body: "Africa's workforce is young, talented, and growing. We're designing tools that reflect the realities of the African job market, not copied from elsewhere.",
  },
];

export default function AboutPage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'About | InternshipConnect';
  }, []);

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="About InternshipConnect"
        description="A platform built to help African students find real internship opportunities and take their first steps into the professional world."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6" aria-labelledby="story-heading">
        <h2 id="story-heading" className="text-2xl font-semibold text-neutral-900">Our story</h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-neutral-600">
          <p>
            InternshipConnect was created with one goal in mind: make it easier for African students to find and
            apply for internships without the friction of fragmented job boards, unanswered emails, and opaque
            application processes.
          </p>
          <p>
            Too many talented students miss out on valuable work experience simply because they don't know where to
            look, or companies don't know how to reach them. We're building the bridge between students ready to
            learn and companies ready to invest in the next generation.
          </p>
          <p>
            We're an early-stage platform, which means your feedback directly shapes what we build. Every feature,
            every workflow, every improvement comes from listening to students and employers who use
            InternshipConnect every day.
          </p>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50" aria-labelledby="values-heading">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="values-heading" className="text-center text-2xl font-semibold text-neutral-900">What we stand for</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-xl border border-neutral-200 bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Ready to get started?</h2>
        <p className="mt-3 text-neutral-600">Join the students and companies building something together.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            as={Link}
            to={isAuthenticated ? '/dashboard' : '/auth/register'}
            size="lg"
            icon={<ArrowRight size={18} aria-hidden="true" />}
            iconPosition="right"
          >
            {isAuthenticated ? 'Go to dashboard' : 'Create a free account'}
          </Button>
          <Button as={Link} to="/contact" size="lg" variant="secondary">
            Contact us
          </Button>
        </div>
      </section>
    </>
  );
}
