import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Briefcase, Check, FileText, MessageSquare, Star, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components';
import PageHero from '../components/PageHero';

const tips = [
  {
    icon: FileText,
    title: 'Polish your profile before applying',
    body: 'Recruiters spend seconds scanning applications. Make sure your profile has a clear headline, a short bio that says what you study and what you want to do, and at least one project or experience — even a class project counts.',
    bullets: [
      'Use your real name and a professional photo',
      'Write a 2–3 sentence bio: who you are, what you study, what you\'re looking for',
      'List any skills you\'ve used, even in academic settings',
      'Upload your CV/resume as a PDF',
    ],
  },
  {
    icon: Briefcase,
    title: 'Apply to roles that match your actual skills',
    body: 'It\'s tempting to apply everywhere, but a targeted application beats ten unfocused ones. Read the description carefully — if you meet 60–70% of the requirements, apply. You don\'t need to tick every box.',
    bullets: [
      'Focus on roles in your field of study first',
      'Don\'t skip roles labelled "junior" or "intern" — they\'re the right level',
      'Remote roles expand your options significantly',
      'Set up notifications so you see new postings early',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Write a brief, personalised application message',
    body: 'When a platform allows you to add a note to your application, use it. One short paragraph showing you read the listing is enough to stand out from applicants who leave it blank.',
    bullets: [
      'Mention the specific role and company by name',
      'Say one thing that makes you a good fit',
      'Keep it to 3–5 sentences maximum',
      'Proofread before submitting — typos signal low effort',
    ],
  },
  {
    icon: Users,
    title: 'Follow up professionally',
    body: 'If you haven\'t heard back within 7–10 days of applying, a short follow-up is appropriate and shows initiative. Keep it brief and polite.',
    bullets: [
      'Wait at least a week before following up',
      'Use the messaging feature if available',
      'One follow-up is enough — don\'t send multiple messages',
      'If declined, thank them and ask for feedback if appropriate',
    ],
  },
  {
    icon: Star,
    title: 'Prepare for the interview',
    body: 'Most internship interviews focus on your attitude, curiosity, and potential — not years of experience. Research the company, prepare 2–3 questions to ask, and be honest about what you don\'t know.',
    bullets: [
      'Research what the company does and who their customers are',
      'Prepare a 60-second "tell me about yourself" answer',
      'Be ready to talk about a project, challenge you solved, or skill you\'re learning',
      'Ask questions — it shows you\'re genuinely interested',
    ],
  },
  {
    icon: BookOpen,
    title: 'Make the most of your internship',
    body: 'Landing the internship is just the beginning. How you show up each day determines what you learn, the references you earn, and whether it leads to more opportunities.',
    bullets: [
      'Show up on time and communicate proactively',
      'Ask questions — no one expects you to know everything',
      'Take notes in meetings, especially early on',
      'At the end, ask for a written recommendation or LinkedIn endorsement',
    ],
  },
];

export default function CareerTipsPage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'Career tips | InternshipConnect';
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Career tips"
        title="How to land your first internship"
        description="Practical, honest advice for students applying to internships, from profile setup to following up after an interview."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6" aria-label="Tips">
        <ol className="space-y-8">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <li key={tip.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Tip {i + 1}</p>
                    <h2 className="text-xl font-semibold text-neutral-900">{tip.title}</h2>
                  </div>
                </div>
                <p className="mt-5 leading-relaxed text-neutral-600">{tip.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {tip.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-neutral-700">
                      <Check size={18} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Ready to apply?</h2>
          <p className="mt-3 text-neutral-600">Browse internships on InternshipConnect. Free for students.</p>
          <Button
            as={Link}
            to={isAuthenticated ? '/dashboard/internships' : '/internships'}
            size="lg"
            className="mt-6"
            icon={<ArrowRight size={18} aria-hidden="true" />}
            iconPosition="right"
          >
            Browse internships
          </Button>
        </div>
      </section>
    </>
  );
}
