
import React, { useState } from 'react';
import Image from 'next/image';

/**
 * TestimonialSection component
 * Displays testimonials from users/customers in a slider format
 */
export default function TestimonialSection() {
  // State to keep track of the current testimonial being displayed
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Sample testimonial data
  const testimonials = [
    {
      quote: "Auto AGI Builder reduced our development time by 60%. What used to take weeks now takes days.",
      author: "Sarah Johnson",
      position: "CTO, TechSolutions Inc.",
      company: "techsolutions",
      avatar: "/avatars/sarah.jpg" // This would be the path to the actual image in a real implementation
    },
    {
      quote: "The prototype generation feature is incredible. We were able to iterate through designs faster than ever before.",
      author: "Michael Chen",
      position: "Lead Developer, InnovateSoft",
      company: "innovatesoft",
      avatar: "/avatars/michael.jpg"
    },
    {
      quote: "The ROI calculator accurately predicted our cost savings. We've seen a 40% reduction in development costs.",
      author: "Jessica Rodriguez",
      position: "Product Manager, Enterprise Systems",
      company: "enterprise",
      avatar: "/avatars/jessica.jpg"
    },
    {
      quote: "Our clients are impressed with how quickly we deliver prototypes. It's revolutionized our consulting business.",
      author: "David Wilson",
      position: "Founder, Wilson Development",
      company: "wilson",
      avatar: "/avatars/david.jpg"
    },
  ];

  // Go to the next testimonial
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  // Go to the previous testimonial
  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Select a specific testimonial by index
  const selectTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  return (
    <section className="testimonial-section py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        
        <div className="max-w-4xl mx-auto">
          {/* Testimonial Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col md:flex-row items-center">
              {/* Avatar Placeholder (would be an actual image in production) */}
              <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                  {testimonials[currentTestimonial].author.charAt(0)}
                </div>
              </div>
              
              <div className="flex-grow">
                <p className="text-lg italic mb-4">"{testimonials[currentTestimonial].quote}"</p>
                <div>
                  <h4 className="font-bold">{testimonials[currentTestimonial].author}</h4>
                  <p className="text-gray-600">{testimonials[currentTestimonial].position}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={prevTestimonial} 
              className="p-2 rounded-full bg-white shadow hover:shadow-md"
              aria-label="Previous testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => selectTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextTestimonial} 
              className="p-2 rounded-full bg-white shadow hover:shadow-md"
              aria-label="Next testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Logos Section */}
        <div className="mt-16">
          <p className="text-center text-gray-600 mb-8">Trusted by innovative companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {/* This would be replaced with actual company logos in production */}
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, index) => (
              <div key={index} className="flex items-center justify-center h-12 w-24 bg-gray-100 rounded">
                <span className="text-gray-500 text-sm">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
