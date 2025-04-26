import React from 'react';
import { useRouter } from 'next/router';

/**
 * PricingSection component
 * Displays pricing plans for the Auto AGI Builder platform
 */
export default function PricingSection() {
  const router = useRouter();

  // Define pricing plans
  const plans = [
    {
      name: 'Free',
      price: '0',
      billing: 'forever',
      description: 'Get started with the basics of Auto AGI Builder',
      features: [
        'Basic requirement analysis',
        'Single project support',
        'Basic prototype generation',
        'Email support',
        '1 team member'
      ],
      limitations: [
        'Limited to 1 active project',
        'No API access',
        'Community support only'
      ],
      callToAction: 'Start Free',
      actionLink: '/signup/free',
      highlight: false
    },
    {
      name: 'Pro',
      price: '39',
      billing: 'per month',
      description: 'Everything you need for small teams and projects',
      features: [
        'Advanced requirement analysis',
        'Multiple project support',
        'Advanced prototype generation',
        'Device preview testing',
        'Priority email support',
        'ROI calculation',
        'Up to 5 team members'
      ],
      limitations: [],
      callToAction: 'Start Pro Trial',
      actionLink: '/signup/pro',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      billing: 'contact for pricing',
      description: 'Advanced features for large teams and complex projects',
      features: [
        'Everything in Pro plan',
        'Unlimited projects',
        'Custom AI models',
        'Dedicated account manager',
        'API access',
        'SSO integration',
        'Unlimited team members',
        'Custom branding',
        '24/7 premium support'
      ],
      limitations: [],
      callToAction: 'Contact Sales',
      actionLink: '/contact/sales',
      highlight: false
    }
  ];

  return (
    <section className="pricing-section py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible plans to meet your needs, from individual developers to enterprise teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`plan-card rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 ${
                plan.highlight 
                  ? 'border-2 border-indigo-500 transform scale-105' 
                  : 'border border-gray-200'
              }`}
            >
              <div className={`px-6 py-8 ${plan.highlight ? 'bg-indigo-500 text-white' : 'bg-white'}`}>
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-end mb-4">
                  {plan.price !== 'Custom' ? (
                    <>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-lg ml-1 text-gray-500">{plan.billing}</span>
                    </>
                  ) : (
                    <span className="text-2xl">{plan.price}</span>
                  )}
                </div>
                <p className={`mb-6 ${plan.highlight ? 'text-indigo-100' : 'text-gray-600'}`}>{plan.description}</p>
                <button 
                  onClick={() => router.push(plan.actionLink)}
                  className={`w-full py-3 px-4 rounded-lg transition-colors ${
                    plan.highlight 
                      ? 'bg-white text-indigo-600 hover:bg-gray-100' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {plan.callToAction}
                </button>
              </div>

              <div className="px-6 py-8 bg-gray-50">
                <h4 className="font-semibold mb-4 text-gray-800">Features include:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4 text-gray-800">Limitations:</h4>
                    <ul className="space-y-3">
                      {plan.limitations.map((limitation, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-gray-700">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Need a custom plan for your team?</p>
          <button 
            onClick={() => router.push('/contact/custom')}
            className="btn-secondary bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-8 rounded-lg inline-flex items-center"
          >
            <span>Contact us for custom pricing</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
