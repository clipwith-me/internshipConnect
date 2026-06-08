import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Building2, Users, GraduationCap,
  Briefcase, Shield, Smartphone, Globe, Zap, Star, ChevronRight,
  MapPin, Clock, DollarSign
} from 'lucide-react';
import { internshipAPI } from '../services/api';

// ─── Shared sub-components ────────────────────────────────────────────────────

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const NavBar = ({ navigate }) => (
  <nav className="fixed top-0 inset-x-0 z-50 bg-[#0D1426]/95 backdrop-blur border-b border-white/10">
    <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
      <span className="text-xl font-bold text-[#E8A230]">InternshipConnect</span>
      <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
        <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        <a href="#for-employers" className="hover:text-white transition-colors">Employers</a>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/auth/login')}
          className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block"
        >
          Sign in
        </button>
        <button
          onClick={() => navigate('/auth/register')}
          className="bg-[#E8A230] hover:bg-[#d4921f] text-[#0D1426] text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Get Started Free
        </button>
      </div>
    </div>
  </nav>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [featuredInternships, setFeaturedInternships] = useState([]);

  useEffect(() => {
    internshipAPI.getAll({ limit: 4, sort: '-createdAt', status: 'active' })
      .then(res => setFeaturedInternships(res.data.data?.internships || res.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#0D1426] text-white min-h-screen">
      <NavBar navigate={navigate} />

      {/* ── Section 1: Hero ── */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E8A230]/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-64 h-64 bg-[#2EC4B6]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-[#2EC4B6] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] animate-pulse" />
            Africa's Career Infrastructure Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Find Internships.{' '}
            <span className="text-[#E8A230]">Build Your Career.</span>{' '}
            Across Africa.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            InternshipConnect connects students to verified opportunities, helps employers find early talent, and gives universities the tools to manage internship programs properly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={() => navigate('/internships')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E8A230] hover:bg-[#d4921f] text-[#0D1426] font-bold px-8 py-4 rounded-xl text-base transition-colors"
            >
              Find Internships <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/auth/register?role=organization')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
            >
              Post an Internship
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Join students from universities across Nigeria building their careers — always free for students
          </p>
        </div>
      </section>

      {/* ── Section 2: Stats Bar ── */}
      <section className="px-4 md:px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '200+', label: 'Universities' },
              { value: '500+', label: 'Verified Opportunities' },
              { value: '12+', label: 'Industries' },
              { value: 'Pan-African', label: 'Nigeria & Beyond' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#E8A230]">{value}</div>
                <div className="text-xs text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Who It's For ── */}
      <section className="px-4 md:px-6 py-16 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Built for everyone in the ecosystem</h2>
          <p className="text-gray-400 text-center mb-12 text-sm md:text-base">One platform connecting students, employers, and institutions</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'For Students',
                color: 'text-[#E8A230]',
                border: 'border-[#E8A230]/20',
                bg: 'bg-[#E8A230]/5',
                desc: 'Discover verified internships, track applications, and build the profile that gets you hired.',
                cta: 'Get Started Free',
                href: '/auth/register',
              },
              {
                icon: Building2,
                title: 'For Employers',
                color: 'text-[#2EC4B6]',
                border: 'border-[#2EC4B6]/20',
                bg: 'bg-[#2EC4B6]/5',
                desc: 'Post internships, find qualified candidates, and build your early talent pipeline.',
                cta: 'Post an Internship',
                href: '/auth/register?role=organization',
              },
              {
                icon: GraduationCap,
                title: 'For Universities',
                color: 'text-purple-400',
                border: 'border-purple-400/20',
                bg: 'bg-purple-400/5',
                desc: 'Manage SIWES placements, track students, and digitise your industrial training program.',
                cta: 'Partner With Us',
                href: '/contact-sales',
              },
            ].map(({ icon: Icon, title, color, border, bg, desc, cta, href }) => (
              <div key={title} className={`rounded-2xl border ${border} ${bg} p-6 flex flex-col`}>
                <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className={`font-bold text-lg mb-2 ${color}`}>{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-5">{desc}</p>
                <button
                  onClick={() => navigate(href)}
                  className={`flex items-center gap-1.5 text-sm font-semibold ${color} hover:opacity-80 transition-opacity`}
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: How It Works ── */}
      <section id="how-it-works" className="px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">How it works</h2>
          <p className="text-gray-400 text-center mb-12 text-sm">From signup to hired in three steps</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Create Your Profile', desc: 'Add your skills, upload your resume, tell employers what you\'re about.' },
              { num: '02', title: 'Discover Opportunities', desc: 'Browse hundreds of verified internships filtered to your interests.' },
              { num: '03', title: 'Apply & Get Hired', desc: 'Apply in minutes, track your status, get notified every step of the way.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="relative">
                <div className="text-5xl font-black text-white/5 mb-2">{num}</div>
                <h3 className="font-bold text-lg mb-2 -mt-6 text-white">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Why InternshipConnect ── */}
      <section className="px-4 md:px-6 py-16 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Built for Africa. Designed for Students.</h2>
          <p className="text-gray-400 text-center mb-12 text-sm">Purpose-built for Nigeria's career ecosystem — and expanding across the continent</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Verified Employers', desc: 'Every company is reviewed before posting internships.' },
              { icon: Zap, title: 'AI-Powered Matching', desc: 'Internships matched to your skills and goals.', soon: true },
              { icon: GraduationCap, title: 'SIWES Ready', desc: 'Built for Nigeria\'s industrial training requirements.' },
              { icon: Star, title: 'Free for Students', desc: 'Always free. No subscription, no hidden fees, ever.' },
              { icon: Smartphone, title: 'Mobile First', desc: 'Designed for Nigerian students on Android and iOS.' },
              { icon: Globe, title: 'Pan-African Vision', desc: 'Nigeria first — then the whole continent.' },
            ].map(({ icon: Icon, title, desc, soon }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E8A230]/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#E8A230]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{title}</span>
                    {soon && <span className="text-[10px] bg-[#2EC4B6]/20 text-[#2EC4B6] px-1.5 py-0.5 rounded-full">Coming soon</span>}
                  </div>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Featured Internships ── */}
      {featuredInternships.length > 0 && (
        <section className="px-4 md:px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Live Opportunities</h2>
              <button
                onClick={() => navigate('/internships')}
                className="text-sm text-[#E8A230] hover:text-[#d4921f] flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {featuredInternships.slice(0, 4).map(internship => {
                const orgName = internship.organization?.companyInfo?.name || 'Company';
                return (
                  <div
                    key={internship._id}
                    onClick={() => navigate(`/internships/${internship._id}`)}
                    className="bg-white/5 border border-white/10 hover:border-[#E8A230]/30 rounded-xl p-5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-gray-300">
                        {orgName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{internship.title}</div>
                        <div className="text-xs text-gray-400">{orgName}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                      {internship.location?.city && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{internship.location.city}</span>
                      )}
                      {internship.type && (
                        <span className="flex items-center gap-1 capitalize"><Briefcase className="w-3 h-3" />{internship.type}</span>
                      )}
                      {internship.compensation?.amount ? (
                        <span className="text-green-400 flex items-center gap-1"><DollarSign className="w-3 h-3" />Paid</span>
                      ) : (
                        <span className="text-gray-500">Unpaid</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/internships')}
                className="inline-flex items-center gap-2 border border-[#E8A230]/40 hover:border-[#E8A230] text-[#E8A230] font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                View All Internships <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 7: For Employers CTA ── */}
      <section id="for-employers" className="px-4 md:px-6 py-16 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1a2540] to-[#0D1426] border border-white/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#E8A230] mb-3">Hire Africa's Best Young Talent</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
              Post internships, reach motivated students from Nigeria's top universities, and build your early talent pipeline. Verified companies get significantly more applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/auth/register?role=organization')}
                className="w-full sm:w-auto bg-[#E8A230] hover:bg-[#d4921f] text-[#0D1426] font-bold px-8 py-3.5 rounded-xl transition-colors"
              >
                Post Free
              </button>
              <button
                onClick={() => navigate('/contact-sales')}
                className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
              >
                See Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Pricing ── */}
      <section id="pricing" className="px-4 md:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-center mb-12 text-sm">Students are always free. Employers choose a plan that fits.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-400 mb-1">FREE PLAN</div>
                <div className="text-3xl font-bold">₦0</div>
                <div className="text-xs text-gray-500 mt-1">For Employers · Free forever</div>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-300 flex-1 mb-6">
                {['1 active internship posting', 'Up to 10 applicants per posting', 'Basic applicant profiles', 'Email support'].map(f => (
                  <li key={f} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/auth/register?role=organization')}
                className="w-full border border-white/20 hover:border-white/40 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="bg-[#E8A230]/10 border-2 border-[#E8A230] rounded-2xl p-6 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8A230] text-[#0D1426] text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-[#E8A230] mb-1">PRO PLAN</div>
                <div className="text-3xl font-bold">₦15,000<span className="text-sm font-normal text-gray-400">/mo</span></div>
                <div className="text-xs text-gray-500 mt-1">For growing employers</div>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-300 flex-1 mb-6">
                {['Unlimited internship postings', 'Unlimited applicants', 'AI candidate ranking (soon)', 'Applicant messaging', 'Priority listing placement', 'Featured employer badge', 'Analytics dashboard', 'Priority email support'].map(f => (
                  <li key={f} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[#E8A230] flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/auth/register?role=organization')}
                className="w-full bg-[#E8A230] hover:bg-[#d4921f] text-[#0D1426] font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Start Pro Plan
              </button>
            </div>

            {/* Institution */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-400 mb-1">INSTITUTION PLAN</div>
                <div className="text-3xl font-bold">Custom</div>
                <div className="text-xs text-gray-500 mt-1">Universities & Training Orgs</div>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-300 flex-1 mb-6">
                {['SIWES management dashboard', 'Placement tracking & reporting', 'Supervisor management tools', 'Student analytics', 'Bulk student onboarding', 'Compliance reporting', 'Dedicated account manager', 'API access'].map(f => (
                  <li key={f} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[#2EC4B6] flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/contact-sales')}
                className="w-full border border-[#2EC4B6]/40 hover:border-[#2EC4B6] text-[#2EC4B6] font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Contact Us
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            🎓 <strong className="text-gray-300">Students always access InternshipConnect for free.</strong> No subscription, no hidden fees, ever.
          </p>
        </div>
      </section>

      {/* ── Section 9: Social Proof ── */}
      <section className="px-4 md:px-6 py-16 bg-white/2">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Be among the first</h2>
          <p className="text-gray-400 mb-8 text-sm max-w-md mx-auto">
            InternshipConnect is growing fast. Early users get priority placement, premium features, and a chance to shape the platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['University of Lagos', 'Covenant University', 'UI Ibadan', 'LASU', 'Babcock University'].map(uni => (
              <div key={uni} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-gray-400">
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 10: Final CTA ── */}
      <section className="px-4 md:px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to start your career journey?</h2>
          <p className="text-gray-400 mb-10 text-base max-w-xl mx-auto">
            Join students, employers, and universities building Africa's workforce infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              onClick={() => navigate('/auth/register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E8A230] hover:bg-[#d4921f] text-[#0D1426] font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Sign Up as Student <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/auth/register?role=organization')}
              className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Post an Internship
            </button>
          </div>
          <button
            onClick={() => navigate('/contact-sales')}
            className="text-sm text-gray-500 hover:text-[#2EC4B6] transition-colors"
          >
            Are you a university? Partner with us →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-4 md:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <span className="text-xl font-bold text-[#E8A230]">InternshipConnect</span>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">Africa's career infrastructure platform — connecting students, employers, and universities.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="text-gray-400 font-semibold text-xs uppercase tracking-wider">Platform</div>
                {[['Internships', '/internships'], ['For Employers', '/auth/register?role=organization'], ['For Universities', '/contact-sales']].map(([label, href]) => (
                  <button key={label} onClick={() => navigate(href)} className="block text-gray-500 hover:text-white transition-colors">{label}</button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-gray-400 font-semibold text-xs uppercase tracking-wider">Company</div>
                {[['Contact', '/contact-sales'], ['Demo', '/demo']].map(([label, href]) => (
                  <button key={label} onClick={() => navigate(href)} className="block text-gray-500 hover:text-white transition-colors">{label}</button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-gray-400 font-semibold text-xs uppercase tracking-wider">Legal</div>
                {[['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, href]) => (
                  <a key={label} href={href} className="block text-gray-500 hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Twitter/X</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
