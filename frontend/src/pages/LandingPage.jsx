import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Building2,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Target,
  Zap,
  Globe,
  Star,
  Mail,
  ChevronDown
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { analytics, trackPageView } from '../utils/analytics';

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Track page view on mount
  useEffect(() => {
    trackPageView('/');
  }, []);

  const handleWaitlistSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Track waitlist signup
    analytics.landingPage.waitlistSignup(email);

    // TODO: Integrate with backend API for waitlist
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail('');
    }, 1000);
  };

  const stats = [
    { label: 'Active Students', value: '10K+', icon: Users },
    { label: 'Companies', value: '500+', icon: Building2 },
    { label: 'Success Rate', value: '90%', icon: TrendingUp },
    { label: 'Countries', value: '50+', icon: Globe }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Our intelligent algorithm matches you with opportunities that fit your skills and goals.'
    },
    {
      icon: Target,
      title: 'Smart Resume Builder',
      description: 'ATS-optimized resumes tailored to each application. Increase your response rate by 10x.'
    },
    {
      icon: Zap,
      title: 'One-Click Applications',
      description: 'Apply to multiple internships instantly with your saved profile and custom cover letters.'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Track your application performance and get insights on how to improve your profile.'
    }
  ];

  const howItWorksStudent = [
    { step: '1', title: 'Create Your Profile', description: 'Add your education, skills, and experience in minutes.' },
    { step: '2', title: 'Get AI Matches', description: 'Our algorithm finds the best opportunities for you.' },
    { step: '3', title: 'Apply Instantly', description: 'One-click applications with optimized resumes.' }
  ];

  const howItWorksOrg = [
    { step: '1', title: 'Post Your Position', description: 'Create internship listings in under 5 minutes.' },
    { step: '2', title: 'AI Ranks Candidates', description: 'Get matched with the best-fit candidates automatically.' },
    { step: '3', title: 'Hire Faster', description: 'Reduce hiring time by 60% with smart screening.' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CS Student, Stanford',
      avatar: '👩‍💻',
      quote: 'I got my dream internship at Google in just 2 weeks! The AI matching is incredible.'
    },
    {
      name: 'Michael Chen',
      role: 'HR Manager, TechCorp',
      avatar: '👨‍💼',
      quote: 'We reduced our hiring time by 60% and found better candidates. This platform is a game-changer.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Student, NYU',
      avatar: '👩‍🎓',
      quote: 'The resume builder helped me get 5x more interview calls. Absolutely worth it!'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for students starting their internship search',
      features: [
        'Basic profile creation',
        '10 applications per month',
        'Standard resume templates',
        'Email support',
        'Job alerts'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'For serious students who want to stand out',
      features: [
        'Everything in Free',
        'Unlimited applications',
        'AI resume optimization',
        'Priority application processing',
        'Advanced analytics',
        'Profile boosting',
        'Chat support'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For organizations hiring at scale',
      features: [
        'Unlimited job postings',
        'Featured listings',
        'Advanced AI candidate filtering',
        'Dedicated account manager',
        'API access',
        'Custom integrations',
        'White-label options'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  const faqs = [
    {
      question: 'How does AI matching work?',
      answer: 'Our AI analyzes your skills, experience, education, and preferences to match you with internships that align with your career goals. We use machine learning to continuously improve match quality based on successful placements.'
    },
    {
      question: 'Is it really free for students?',
      answer: 'Yes! Our Free tier is completely free forever. You can create a profile, apply to 10 internships per month, and access basic features at no cost. Upgrade to Pro for unlimited applications and advanced features.'
    },
    {
      question: 'What industries do you support?',
      answer: 'We support all major industries including Technology, Finance, Marketing, Healthcare, Engineering, Design, and more. Organizations from startups to Fortune 500 companies post opportunities on our platform.'
    },
    {
      question: 'How long does it take to get matched?',
      answer: 'Once you complete your profile, you\'ll start seeing matched opportunities immediately. Most students receive their first interview invitation within 1-2 weeks of active applications.'
    },
    {
      question: 'Can organizations try it for free?',
      answer: 'Yes! Organizations can post their first 3 internship listings for free to try our platform. After that, choose a plan that fits your hiring needs.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InternshipConnect
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition">FAQ</a>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  analytics.landingPage.ctaClick('Login - Header');
                  navigate('/auth/login');
                }}
              >
                Log In
              </Button>
              <Button
                onClick={() => {
                  analytics.landingPage.ctaClick('Sign Up - Header');
                  navigate('/auth/register');
                }}
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Trusted by 10,000+ students worldwide</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Land Your Dream{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Internship
              </span>
              {' '}with AI
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect 800M students with opportunities worldwide. Smart matching, optimized resumes,
              and instant applications. Get hired 10x faster.
            </p>

            {!subscribed ? (
              <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={Mail}
                  className="flex-1"
                />
                <Button type="submit" size="lg" loading={loading} className="sm:w-auto">
                  Join Waitlist <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-xl mx-auto mb-8">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">You're on the list! Check your email for next steps.</span>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Free for students forever • No credit card required
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get Hired
              </span>
            </h2>
            <p className="text-xl text-gray-600">Powerful features designed for your success</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in minutes</p>
          </div>

          {/* For Students */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-blue-600">For Students</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorksStudent.map((item) => (
                <div key={item.step} className="relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                      {item.step}
                    </div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                  {item.step !== '3' && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 text-blue-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* For Organizations */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8 text-purple-600">For Organizations</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorksOrg.map((item) => (
                <div key={item.step} className="relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                      {item.step}
                    </div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                  {item.step !== '3' && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 text-purple-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Students & Companies</h2>
            <p className="text-xl text-gray-600">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-yellow-400 text-gray-900 text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-green-300' : 'text-green-500'}`} />
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/auth/register')}
                  variant={plan.highlighted ? 'secondary' : 'primary'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    const newExpanded = expandedFaq === index ? null : index;
                    setExpandedFaq(newExpanded);
                    if (newExpanded === index) {
                      analytics.landingPage.faqExpanded(faq.question);
                    }
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <span className="font-bold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Land Your Dream Internship?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 10,000+ students who are getting hired faster with InternshipConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth/register')}
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/auth/login')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">InternshipConnect</span>
              </div>
              <p className="text-sm">
                AI-powered internship matching for students and organizations worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 InternshipConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
