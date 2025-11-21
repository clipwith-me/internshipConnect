// frontend/src/pages/PricingPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { paymentAPI } from '../services/api';

const PricingPage = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isStudent = user?.role === 'student';

  const studentPlans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for students just starting their internship search',
      icon: Sparkles,
      color: 'neutral',
      features: [
        'Browse all internship listings',
        'Apply to unlimited internships',
        'Basic profile creation',
        'Application tracking dashboard',
        'Email notifications',
        'Standard support',
      ],
      limitations: [
        'No AI resume generation',
        'No AI matching recommendations',
        'Basic search filters only',
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      name: 'Premium',
      price: { monthly: 9.99, yearly: 99 },
      description: 'Unlock AI-powered features to land your dream internship',
      icon: Zap,
      color: 'primary',
      features: [
        'Everything in Free',
        '10 AI-generated resumes per month',
        'AI-powered internship matching',
        'Advanced search filters',
        'Priority application review badge',
        'Resume optimization tips',
        'Interview preparation guide',
        'Priority customer support',
      ],
      limitations: [],
      cta: 'Upgrade to Premium',
      popular: true,
    },
    {
      name: 'Pro',
      price: { monthly: 19.99, yearly: 199 },
      description: 'For serious students seeking maximum opportunities',
      icon: Crown,
      color: 'amber',
      features: [
        'Everything in Premium',
        'Unlimited AI resume generation',
        'Personalized career coaching',
        'Direct messaging with recruiters',
        'Exclusive job opportunities',
        'Resume review by professionals',
        'Mock interview sessions',
        'Dedicated account manager',
      ],
      limitations: [],
      cta: 'Go Pro',
      popular: false,
    },
  ];

  const organizationPlans = [
    {
      name: 'Basic',
      price: { monthly: 0, yearly: 0 },
      description: 'Start hiring interns at no cost',
      icon: Sparkles,
      color: 'neutral',
      features: [
        'Post up to 3 internship listings',
        'Basic candidate search',
        'Application management dashboard',
        'Email notifications',
        'Standard support',
      ],
      limitations: [
        'No featured listings',
        'No AI candidate matching',
        'Limited analytics',
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      name: 'Professional',
      price: { monthly: 49, yearly: 490 },
      description: 'Advanced features for growing organizations',
      icon: Zap,
      color: 'primary',
      features: [
        'Everything in Basic',
        'Unlimited internship postings',
        '5 featured listings per month',
        'AI-powered candidate matching',
        'Advanced analytics dashboard',
        'Custom branding on listings',
        'Priority listing placement',
        'Team collaboration tools',
      ],
      limitations: [],
      cta: 'Upgrade Now',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 199, yearly: 1990 },
      description: 'Complete hiring solution for large organizations',
      icon: Crown,
      color: 'amber',
      features: [
        'Everything in Professional',
        'Unlimited featured listings',
        'Dedicated account manager',
        'Custom integrations & API access',
        'White-label solutions',
        'Advanced reporting & analytics',
        'Bulk candidate management',
        'Priority support 24/7',
        'Custom contract & SLA',
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const plans = isStudent ? studentPlans : organizationPlans;
  const currentPlan = user?.subscription?.plan || 'free';

  const handlePlanSelect = async (planName) => {
    if (planName.toLowerCase() === currentPlan.toLowerCase()) return;

    // For free/basic plans, don't need checkout
    if (planName.toLowerCase() === 'free' || planName.toLowerCase() === 'basic') {
      return;
    }

    // Contact sales for enterprise plans
    if (planName === 'Enterprise' || planName === 'Pro') {
      alert(`Please contact our sales team for ${planName} plan details`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create Stripe checkout session
      const response = await paymentAPI.createCheckout(planName.toLowerCase(), billingCycle);

      // Redirect to Stripe checkout
      if (response.data?.data?.url) {
        window.location.href = response.data.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to create checkout session. Please try again.');
      setLoading(false);
    }
  };

  const savings = billingCycle === 'yearly' ? 17 : 0;

  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {isStudent
              ? 'Get AI-powered tools to accelerate your internship search and land your dream role'
              : 'Find the perfect candidates faster with our intelligent hiring platform'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-6 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium ${
              billingCycle === 'monthly' ? 'text-neutral-900' : 'text-neutral-500'
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 bg-primary-600 rounded-full transition-colors"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              billingCycle === 'yearly' ? 'text-neutral-900' : 'text-neutral-500'
            }`}
          >
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Save {savings}%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.name.toLowerCase() === currentPlan;

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg ${
                  plan.popular
                    ? 'border-primary-500 shadow-xl scale-105'
                    : 'border-neutral-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        plan.color === 'primary'
                          ? 'bg-primary-100'
                          : plan.color === 'amber'
                          ? 'bg-amber-100'
                          : 'bg-neutral-100'
                      }`}
                    >
                      <Icon
                        size={24}
                        className={
                          plan.color === 'primary'
                            ? 'text-primary-600'
                            : plan.color === 'amber'
                            ? 'text-amber-600'
                            : 'text-neutral-600'
                        }
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-neutral-900">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-neutral-600">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mt-2">{plan.description}</p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.name)}
                    disabled={isCurrentPlan || loading}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors mb-6 flex items-center justify-center gap-2 ${
                      isCurrentPlan || loading
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-neutral-200">
                      <p className="text-xs font-medium text-neutral-500 mb-3">NOT INCLUDED:</p>
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-neutral-400">×</span>
                            <span className="text-sm text-neutral-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Can I switch plans at any time?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
            />
            <FAQItem
              question="What happens when I upgrade?"
              answer="When you upgrade, you'll get instant access to all premium features. Your billing will be adjusted on a pro-rata basis."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="We offer a 14-day money-back guarantee for all premium plans. If you're not satisfied, contact support for a full refund."
            />
            <FAQItem
              question="How does AI resume generation work?"
              answer="Our AI analyzes your profile, skills, and experience to create tailored resumes optimized for specific internships. Each resume is ATS-friendly and professionally formatted."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Absolutely. We use bank-level encryption and never share your data with third parties. Your privacy is our top priority."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-primary-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your needs
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-neutral-100 transition-colors">
              Contact Sales
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <span className="font-semibold text-neutral-900">{question}</span>
        <span
          className={`text-2xl text-neutral-400 transition-transform ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-neutral-600 border-t border-neutral-100">
          <p className="pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
