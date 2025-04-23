import React from 'react';
import Image from 'next/image';

/**
 * Testimonial section component for displaying customer testimonials.
 * Features a carousel of testimonials with user photos and company logos.
 */
const TestimonialSection = () => {
  // Sample testimonial data
  const testimonials = [
    {
      id: 1,
      quote: "Auto AGI Builder cut our development time in half. We went from idea to functional prototype in just a week, which would've taken us a month with our old process.",
      author: "Sarah Johnson",
      role: "CTO",
      company: "TechNova Solutions",
      imageUrl: "/images/testimonials/user-1.jpg",
      logoUrl: "/images/testimonials/company-1.svg",
      rating: 5
    },
    {
      id: 2,
      quote: "The ROI calculator alone made this tool worth it. We could clearly see the business impact of our development decisions, which made it easier to prioritize features.",
      author: "David Chen",
      role: "Product Manager",
      company: "GrowthMetrics",
      imageUrl: "/images/testimonials/user-2.jpg",
      logoUrl: "/images/testimonials/company-2.svg",
      rating: 5
    },
    {
      id: 3,
      quote: "Our clients are blown away when we show them the device preview feature. Being able to see their app on different screens early in the process has improved our client satisfaction.",
      author: "Michael Torres",
      role: "Lead Developer",
      company: "FrontEdge Studios",
      imageUrl: "/images/testimonials/user-3.jpg",
      logoUrl: "/images/testimonials/company-3.svg",
      rating: 4
    }
  ];

  // For a simple implementation, we'll just show all testimonials side by side
  // In a real implementation, you'd want to add carousel functionality with proper controls

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-16">
          Trusted by Teams Everywhere
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Company logos */}
        <div className="mt-16">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Trusted by innovative teams at:
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-80">
            <div className="w-24 md:w-32 h-12 relative grayscale hover:grayscale-0 transition-all duration-300">
              <Image 
                src="/images/logos/amazon.svg" 
                alt="Amazon" 
                layout="fill" 
                objectFit="contain"
              />
            </div>
            <div className="w-24 md:w-32 h-12 relative grayscale hover:grayscale-0 transition-all duration-300">
              <Image 
                src="/images/logos/netflix.svg" 
                alt="Netflix" 
                layout="fill" 
                objectFit="contain"
              />
            </div>
            <div className="w-24 md:w-32 h-12 relative grayscale hover:grayscale-0 transition-all duration-300">
              <Image 
                src="/images/logos/adobe.svg" 
                alt="Adobe" 
                layout="fill" 
                objectFit="contain"
              />
            </div>
            <div className="w-24 md:w-32 h-12 relative grayscale hover:grayscale-0 transition-all duration-300">
              <Image 
                src="/images/logos/slack.svg" 
                alt="Slack" 
                layout="fill" 
                objectFit="contain"
              />
            </div>
            <div className="w-24 md:w-32 h-12 relative grayscale hover:grayscale-0 transition-all duration-300">
              <Image 
                src="/images/logos/shopify.svg" 
                alt="Shopify" 
                layout="fill" 
                objectFit="contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Individual testimonial card component.
 * 
 * @param {Object} testimonial - The testimonial data object
 */
const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 h-full flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl">
      {/* Star Rating */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            filled={i < testimonial.rating}
          />
        ))}
      </div>
      
      {/* Quote */}
      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 flex-grow">
        "{testimonial.quote}"
      </blockquote>
      
      {/* Author Info */}
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image 
            src={testimonial.imageUrl} 
            alt={testimonial.author}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {testimonial.author}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {testimonial.role}, {testimonial.company}
          </div>
        </div>
        <div className="ml-auto">
          <div className="w-16 h-8 relative">
            <Image 
              src={testimonial.logoUrl} 
              alt={testimonial.company}
              layout="fill" 
              objectFit="contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Star icon component for ratings.
 * 
 * @param {boolean} filled - Whether the star should be filled or outlined
 */
const StarIcon = ({ filled }) => {
  return (
    <svg
      className={`w-5 h-5 ${
        filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
      }`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      ></path>
    </svg>
  );
};

export default TestimonialSection;
