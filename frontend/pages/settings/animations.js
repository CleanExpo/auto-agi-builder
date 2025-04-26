import React from 'react';
import Layout from '../../components/layout/Layout';
import PageWrapper from '../../components/layout/PageWrapper';
import AnimatedCard from '../../components/common/AnimatedCard';
import AnimatedButton from '../../components/common/AnimatedButton';
import { useAnimationContext } from '../../contexts/AnimationContext';

/**
 * Animation Settings Page
 * Provides user controls for animation preferences
 */
const AnimationSettingsPage = () => {
  const { 
    animationsEnabled, 
    animationSpeed, 
    reduceMotionEnabled,
    enableAnimations, 
    disableAnimations, 
    setAnimationSpeed,
    enableReducedMotion,
    disableReducedMotion
  } = useAnimationContext();

  return (
    <Layout title="Animation Settings">
      <PageWrapper>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
            Animation Settings
          </h1>

          <AnimatedCard
            animation="animate-fade-in"
            delay={100}
            className="p-6 mb-8"
          >
            <AnimatedCard.Title>Animation Preferences</AnimatedCard.Title>
            <AnimatedCard.Body>
              <div className="space-y-8">
                {/* Enable/Disable Animations */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Enable Animations</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Control whether animations are shown throughout the application.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <AnimatedButton
                      variant={animationsEnabled ? 'primary' : 'outline'}
                      onClick={enableAnimations}
                      className={!animationsEnabled ? 'border-gray-300 text-gray-500' : ''}
                      disabled={animationsEnabled}
                    >
                      Enabled
                    </AnimatedButton>
                    
                    <AnimatedButton
                      variant={!animationsEnabled ? 'primary' : 'outline'}
                      onClick={disableAnimations}
                      className={animationsEnabled ? 'border-gray-300 text-gray-500' : ''}
                      disabled={!animationsEnabled}
                    >
                      Disabled
                    </AnimatedButton>
                  </div>
                </div>
                
                {/* Animation Speed */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Animation Speed</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Adjust how quickly animations play. This affects all animations throughout the application.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <AnimatedButton
                      variant={animationSpeed === 'slow' ? 'primary' : 'outline'}
                      onClick={() => setAnimationSpeed('slow')}
                      className={animationSpeed !== 'slow' ? 'border-gray-300 text-gray-500' : ''}
                      disabled={animationSpeed === 'slow' || !animationsEnabled}
                    >
                      Slow
                    </AnimatedButton>
                    
                    <AnimatedButton
                      variant={animationSpeed === 'normal' ? 'primary' : 'outline'}
                      onClick={() => setAnimationSpeed('normal')}
                      className={animationSpeed !== 'normal' ? 'border-gray-300 text-gray-500' : ''}
                      disabled={animationSpeed === 'normal' || !animationsEnabled}
                    >
                      Normal
                    </AnimatedButton>
                    
                    <AnimatedButton
                      variant={animationSpeed === 'fast' ? 'primary' : 'outline'}
                      onClick={() => setAnimationSpeed('fast')}
                      className={animationSpeed !== 'fast' ? 'border-gray-300 text-gray-500' : ''}
                      disabled={animationSpeed === 'fast' || !animationsEnabled}
                    >
                      Fast
                    </AnimatedButton>
                  </div>
                </div>
                
                {/* Reduced Motion */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Reduced Motion</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    For users who prefer minimal animations for accessibility reasons. This setting overrides
                    your operating system's reduced motion preference.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <AnimatedButton
                      variant={reduceMotionEnabled ? 'primary' : 'outline'}
                      onClick={enableReducedMotion}
                      className={!reduceMotionEnabled ? 'border-gray-300 text-gray-500' : ''}
                      disabled={reduceMotionEnabled || !animationsEnabled}
                    >
                      Enable Reduced Motion
                    </AnimatedButton>
                    
                    <AnimatedButton
                      variant={!reduceMotionEnabled ? 'primary' : 'outline'}
                      onClick={disableReducedMotion}
                      className={reduceMotionEnabled ? 'border-gray-300 text-gray-500' : ''}
                      disabled={!reduceMotionEnabled || !animationsEnabled}
                    >
                      Standard Motion
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard>
          
          {/* Animation Preview Section */}
          <AnimatedCard
            animation="animate-fade-in"
            delay={200}
            className="p-6"
          >
            <AnimatedCard.Title>Animation Preview</AnimatedCard.Title>
            <AnimatedCard.Body>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Preview how animations look with your current settings. Click the button below to see various animation styles.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimationPreviewCard 
                  title="Fade In"
                  animation="animate-fade-in"
                />
                
                <AnimationPreviewCard 
                  title="Fade In Up"
                  animation="animate-fade-in-up"
                />
                
                <AnimationPreviewCard 
                  title="Scale In"
                  animation="animate-scale-in"
                />
              </div>
            </AnimatedCard.Body>
          </AnimatedCard>
        </div>
      </PageWrapper>
    </Layout>
  );
};

// Animation preview card component
const AnimationPreviewCard = ({ title, animation }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const { animationsEnabled } = useAnimationContext();
  
  const triggerAnimation = () => {
    if (!animationsEnabled) return;
    
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 10);
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="font-semibold mb-3">{title}</h4>
      
      <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md mb-4">
        {isPlaying && (
          <div className={animation}>
            <div className="p-4 bg-blue-500 text-white rounded-md">
              Animated Element
            </div>
          </div>
        )}
        
        {!isPlaying && (
          <div className="text-gray-400 dark:text-gray-500">
            Click button to play
          </div>
        )}
      </div>
      
      <AnimatedButton
        onClick={triggerAnimation}
        disabled={!animationsEnabled}
        size="sm"
        variant={animationsEnabled ? "primary" : "outline"}
        className="w-full"
      >
        Play Animation
      </AnimatedButton>
    </div>
  );
};

export default AnimationSettingsPage;
