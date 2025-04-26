import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PageWrapper from '../components/layout/PageWrapper';
import AnimatedCard from '../components/common/AnimatedCard';
import AnimatedButton from '../components/common/AnimatedButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAnimation from '../hooks/useAnimation';

/**
 * Animation Examples Page
 * Demonstrates the use of animation hooks and components across various examples
 */
const AnimationExamplesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [examples, setExamples] = useState([]);

  // Animation for the title section
  const titleAnimation = useAnimation({
    animation: 'animate-fade-in-down',
    delay: 100,
    triggerOnce: true
  });

  // Load example data
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setExamples([
        { 
          id: 1, 
          title: 'Fade In Up',
          icon: '✨',
          description: 'Smooth animation that fades in while moving upward',
          animationType: 'animate-fade-in-up',
          color: 'bg-blue-500'
        },
        { 
          id: 2, 
          title: 'Scale In',
          icon: '📏',
          description: 'Element appears by scaling up from a smaller size',
          animationType: 'animate-scale-in', 
          color: 'bg-green-500'
        },
        { 
          id: 3, 
          title: 'Slide In Right',
          icon: '➡️',
          description: 'Slides in from the right side of the container',
          animationType: 'animate-slide-in-right', 
          color: 'bg-purple-500'
        },
        { 
          id: 4, 
          title: 'Bounce In',
          icon: '🏀',
          description: 'Bouncy entrance animation with a slight overshoot',
          animationType: 'animate-bounce-in',
          color: 'bg-orange-500'
        },
        { 
          id: 5, 
          title: 'Floating Animation',
          icon: '🎈',
          description: 'Continuous gentle floating motion',
          animationType: 'animate-float',
          color: 'bg-red-500'
        },
        { 
          id: 6, 
          title: 'Glow Pulse',
          icon: '💡',
          description: 'Pulsing glow effect that draws attention',
          animationType: 'animate-glow-pulse',
          color: 'bg-amber-500'
        }
      ]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Demo animation trigger controls
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const resetAnimations = () => {
    setResetTrigger(prev => prev + 1);
  };

  return (
    <Layout title="Animation Examples">
      <PageWrapper>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner 
              size="xl" 
              color="primary" 
              text="Loading examples..."
            />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div 
              ref={titleAnimation.ref}
              className={`mb-10 ${titleAnimation.animationClasses}`}
            >
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Animation System Examples
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Interactive examples of the Auto AGI Builder animation system components
              </p>
              
              <div className="mt-6">
                <button
                  onClick={resetAnimations}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Reset All Animations
                </button>
              </div>
            </div>

            {/* Animation Examples Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {examples.map((example, index) => (
                <AnimatedCard
                  key={`${example.id}-${resetTrigger}`}
                  animation={example.animationType}
                  delay={index * 100}
                  className="p-6"
                >
                  <div className="flex items-start">
                    <div className={`rounded-full ${example.color} text-white p-3 mr-4`}>
                      <AnimatedCard.Icon>{example.icon}</AnimatedCard.Icon>
                    </div>
                    <div>
                      <AnimatedCard.Title>{example.title}</AnimatedCard.Title>
                      <AnimatedCard.Body>
                        <p>{example.description}</p>
                        <div className="mt-4">
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                            {example.animationType}
                          </code>
                        </div>
                      </AnimatedCard.Body>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
            
            {/* Button Animation Examples */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-6">Animated Buttons</h2>
              
              <AnimatedCard
                animation="animate-fade-in"
                delay={300}
                className="p-6 mb-6"
              >
                <AnimatedCard.Title>Button Animation Types</AnimatedCard.Title>
                <AnimatedCard.Body>
                  <p className="mb-4">Explore different button animations that can be applied throughout the application:</p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <AnimatedButton animation="scale">Scale Animation</AnimatedButton>
                    <AnimatedButton animation="ripple" variant="secondary">Ripple Animation</AnimatedButton>
                    <AnimatedButton animation="glow" variant="success">Glow Animation</AnimatedButton>
                    <AnimatedButton animation="bounce" variant="info">Bounce Animation</AnimatedButton>
                    <AnimatedButton animation="none" variant="warning">No Animation</AnimatedButton>
                  </div>
                  
                  <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`<AnimatedButton animation="scale">Scale Animation</AnimatedButton>
<AnimatedButton animation="ripple" variant="secondary">Ripple Animation</AnimatedButton>
<AnimatedButton animation="glow" variant="success">Glow Animation</AnimatedButton>
<AnimatedButton animation="bounce" variant="info">Bounce Animation</AnimatedButton>`}
                    </pre>
                  </div>
                </AnimatedCard.Body>
              </AnimatedCard>
              
              <AnimatedCard
                animation="animate-fade-in"
                delay={400}
                className="p-6"
              >
                <AnimatedCard.Title>Button Variants & Sizes</AnimatedCard.Title>
                <AnimatedCard.Body>
                  <p className="mb-4">Different button variants and sizes available:</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Button Variants</h4>
                    <div className="flex flex-wrap gap-3 mb-6">
                      <AnimatedButton variant="primary">Primary</AnimatedButton>
                      <AnimatedButton variant="secondary">Secondary</AnimatedButton>
                      <AnimatedButton variant="success">Success</AnimatedButton>
                      <AnimatedButton variant="danger">Danger</AnimatedButton>
                      <AnimatedButton variant="warning">Warning</AnimatedButton>
                      <AnimatedButton variant="info">Info</AnimatedButton>
                      <AnimatedButton variant="light">Light</AnimatedButton>
                      <AnimatedButton variant="dark">Dark</AnimatedButton>
                      <AnimatedButton variant="outline">Outline</AnimatedButton>
                      <AnimatedButton variant="ghost">Ghost</AnimatedButton>
                    </div>
                    
                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Button Sizes</h4>
                    <div className="flex flex-wrap gap-3 items-center">
                      <AnimatedButton size="sm">Small</AnimatedButton>
                      <AnimatedButton size="md">Medium</AnimatedButton>
                      <AnimatedButton size="lg">Large</AnimatedButton>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`// Variants
<AnimatedButton variant="primary">Primary</AnimatedButton>
<AnimatedButton variant="secondary">Secondary</AnimatedButton>
<AnimatedButton variant="success">Success</AnimatedButton>
...

// Sizes
<AnimatedButton size="sm">Small</AnimatedButton>
<AnimatedButton size="md">Medium</AnimatedButton>
<AnimatedButton size="lg">Large</AnimatedButton>`}
                    </pre>
                  </div>
                </AnimatedCard.Body>
              </AnimatedCard>
            </div>

            {/* Usage Examples */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-6">How to Use</h2>
              
              <AnimatedCard
                animation="animate-fade-in"
                delay={300}
                className="p-6"
              >
                <AnimatedCard.Title>Component Usage Example</AnimatedCard.Title>
                <AnimatedCard.Body>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    {`// Using the AnimatedCard component
import AnimatedCard from '../components/common/AnimatedCard';

const MyComponent = () => (
  <AnimatedCard
    animation="animate-fade-in-up"
    delay={200}
    className="p-6"
  >
    <AnimatedCard.Icon>🚀</AnimatedCard.Icon>
    <AnimatedCard.Title>Card Title</AnimatedCard.Title>
    <AnimatedCard.Body>Card content here...</AnimatedCard.Body>
  </AnimatedCard>
);`}
                  </pre>
                </AnimatedCard.Body>
              </AnimatedCard>

              <div className="h-6"></div>

              <AnimatedCard
                animation="animate-fade-in"
                delay={400}
                className="p-6"
              >
                <AnimatedCard.Title>Hook Usage Example</AnimatedCard.Title>
                <AnimatedCard.Body>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    {`// Using the useAnimation hook directly
import useAnimation from '../hooks/useAnimation';

const MyComponent = () => {
  const animation = useAnimation({
    animation: 'animate-fade-in-up',
    delay: 200,
    triggerOnce: true
  });

  return (
    <div 
      ref={animation.ref}
      className={\`my-component \${animation.animationClasses}\`}
    >
      This content will animate when visible
    </div>
  );
};`}
                  </pre>
                </AnimatedCard.Body>
              </AnimatedCard>
            </div>
          </div>
        )}
      </PageWrapper>
    </Layout>
  );
};

export default AnimationExamplesPage;
