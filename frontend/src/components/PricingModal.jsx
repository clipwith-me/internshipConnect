import { X, Check, Sparkles, Zap, Crown } from 'lucide-react';

const PricingModal = ({ isOpen, onClose, currentUsage, limit }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Sparkles,
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      features: [
        { text: '3 AI resumes per month', included: true },
        { text: 'Basic templates only', included: true },
        { text: 'Standard ATS optimization', included: true },
        { text: 'Email support', included: true },
        { text: 'All resume styles', included: false },
        { text: 'Premium templates', included: false },
        { text: 'Priority support', included: false },
        { text: 'Unlimited downloads', included: false }
      ],
      cta: 'Current Plan',
      disabled: true,
      highlight: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'Most popular for job seekers',
      icon: Zap,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      features: [
        { text: '10 AI resumes per month', included: true },
        { text: 'All 4 resume styles', included: true },
        { text: 'Advanced ATS optimization', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Custom color schemes', included: true },
        { text: 'LinkedIn optimization', included: true },
        { text: 'Premium templates', included: false },
        { text: 'Unlimited downloads', included: false }
      ],
      cta: 'Upgrade to Premium',
      disabled: false,
      highlight: true
    },
    {
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      description: 'Unlimited everything',
      icon: Crown,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      features: [
        { text: 'Unlimited AI resumes', included: true },
        { text: 'All 4 resume styles', included: true },
        { text: 'Premium ATS optimization', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Cover letter generator', included: true },
        { text: 'Premium templates', included: true },
        { text: 'Unlimited downloads', included: true }
      ],
      cta: 'Upgrade to Pro',
      disabled: false,
      highlight: false
    }
  ];

  const handleUpgrade = (planName) => {
    console.log(`Upgrading to ${planName}`);
    // TODO: Integrate with payment flow
    alert(`Payment integration coming soon! Selected plan: ${planName}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full overflow-hidden transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-2">
                Unlock Unlimited Resume Generation
              </h2>
              <p className="text-blue-100 text-lg">
                You've used {currentUsage} of {limit} free resumes this month. Upgrade to continue creating professional resumes with AI.
              </p>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="px-8 py-12 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative bg-white rounded-xl shadow-lg border-2 ${plan.borderColor} ${
                      plan.highlight ? 'ring-4 ring-blue-200 ring-opacity-50 scale-105 shadow-2xl' : ''
                    } transition-all hover:shadow-xl`}
                  >
                    {/* Popular Badge */}
                    {plan.highlight && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Icon */}
                      <div className={`inline-flex p-3 rounded-xl ${plan.bgColor} mb-4`}>
                        <Icon className={`w-8 h-8 ${plan.iconColor}`} />
                      </div>

                      {/* Plan Name */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-3">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {plan.period}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-6">
                        {plan.description}
                      </p>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleUpgrade(plan.name)}
                        disabled={plan.disabled}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mb-6 ${
                          plan.disabled
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : plan.highlight
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {plan.cta}
                      </button>

                      {/* Features */}
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check
                              className={`w-5 h-5 mr-3 flex-shrink-0 ${
                                feature.included
                                  ? 'text-green-500'
                                  : 'text-gray-300'
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                feature.included
                                  ? 'text-gray-700'
                                  : 'text-gray-400'
                              }`}
                            >
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center text-gray-600 text-sm">
              <p>All plans include secure payment processing and 30-day money-back guarantee.</p>
              <p className="mt-1">Your free resumes reset on the 1st of each month.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
