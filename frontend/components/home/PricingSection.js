import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Pricing section component for the homepage.
 * Displays different pricing plans with features and monthly/annual toggle.
 */
const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  
  // Toggle between monthly and annual billing
  const toggleBillingPeriod = () => {
    setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly');
  };
  
  // Price multiplier for annual billing (20% discount)
  const annualMultiplier = 0.8;
  
  // Pricing plans data
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'For individuals and small projects',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        '3 projects',
        '1 user',
        'Basic prototypes',
        'Device previews',
        'Community support'
      ],
      cta: 'Get Started',
      ctaLink: '/auth/register',
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For professionals and growing teams',
      monthlyPrice: 29,
      annualPrice: 29 * 12 * annualMultiplier,
      features: [
        'Unlimited projects',
        '5 team members',
        'Advanced prototypes',
        'All device previews',
        'API export options',
        'Priority support',
        'ROI calculator'
      ],
      cta: 'Start Pro Trial',
      ctaLink: '/auth/register?plan=pro',
      highlight: true
    },
    {
      id: 'team',
      name: 'Team',
      description: 'For teams and organizations',
      monthlyPrice: 79,
      annualPrice: 79 * 12 * annualMultiplier,
      features: [
        'Unlimited projects',
        '20 team members',
        'Enterprise prototypes',
        'All device previews',
        'API export options',
        'Dedicated support',
        'Advanced analytics',
        'Custom integrations',
        'SSO authentication'
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include core features with different usage limits.
          </p>
          
          {/* Billing period toggle */}
          <div className="mt-8 inline-flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setBillingPeriod('annual')}
            >
              Annual <span className="text-xs text-green-600 dark:text-green-400">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              billingPeriod={billingPeriod} 
            />
          ))}
        </div>
        
        {/* Enterprise Section */}
        <div className="mt-20 bg-gray-50 dark:bg-gray-800 rounded-xl p-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-2/3 md:pr-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Need a custom plan for your enterprise?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-0">
                We offer tailored solutions for larger teams and specific requirements. 
                Contact our sales team to discuss your needs and get a custom quote.
              </p>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Individual pricing plan card component.
 * 
 * @param {Object} plan - The pricing plan data
 * @param {String} billingPeriod - Either 'monthly' or 'annual'
 */
const PlanCard = ({ plan, billingPeriod }) => {
  const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-8 border ${
      plan.highlight 
        ? 'border-blue-500 shadow-xl dark:border-blue-600 transform scale-105 relative' 
        : 'border-gray-200 shadow-lg dark:border-gray-700'
    }`}>
      {/* Popular badge */}
      {plan.highlight && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      
      {/* Plan name and description */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{plan.name}</h3>
        <p className="text-gray-500 dark:text-gray-400">{plan.description}</p>
      </div>
      
      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center">
          <span className="text-gray-800 dark:text-white text-3xl font-bold">$</span>
          <span className="text-5xl font-bold text-gray-800 dark:text-white mx-1">
            {price === 0 ? '0' : Math.round(price)}
          </span>
          {price > 0 && (
            <span className="text-gray-500 dark:text-gray-400">
              /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
            </span>
          )}
        </div>
        {billingPeriod === 'annual' && price > 0 && (
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
            ${ Math.round(plan.monthlyPrice * 12 - plan.annualPrice) } savings
          </div>
        )}
      </div>
      
      {/* Features list */}
      <ul className="mb-8 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="ml-2 text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Call to action button */}
      <div className="text-center">
        <Link
          href={plan.ctaLink}
          className={`block w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            plan.highlight
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
          }`}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  );
};

export default PricingSection;
