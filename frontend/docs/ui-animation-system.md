# Auto AGI Builder UI Animation System

This document provides an overview of the animation system implemented for the Auto AGI Builder application. The system enhances user experience by adding smooth transitions, loading states, and responsive design features.

## Table of Contents

1. [Core Animation Components](#core-animation-components)
2. [Available Animation Effects](#available-animation-effects)
3. [Page Transitions](#page-transitions)
4. [Loading Spinners](#loading-spinners)
5. [Responsive Containers](#responsive-containers)
6. [Best Practices](#best-practices)
7. [Implementation Examples](#implementation-examples)

## Core Animation Components

Our animation system is built on several core components:

- **animation.css**: Central stylesheet containing all animation definitions
- **usePageTransition**: Custom hook for handling page transition effects
- **PageWrapper**: Component that wraps page content with transition animations
- **LoadingSpinner**: Customizable loading indicators
- **ResponsiveContainer**: Adaptive layout containers with animation capabilities

## Available Animation Effects

The following animations are available in the system:

| Animation Class | Description | Duration |
|----------------|-------------|----------|
| `animate-fade-in` | Fade in from transparent to opaque | 300ms |
| `animate-fade-out` | Fade out from opaque to transparent | 300ms |
| `animate-fade-in-up` | Fade in while moving upward | 800ms |
| `animate-scale-in` | Grow from smaller to actual size | 600ms |
| `animate-slide-in-right` | Slide in from the right side | 500ms |
| `animate-card-reveal` | Specialized reveal for card elements | 700ms |
| `animate-pulse-custom` | Pulsing opacity effect (good for loading states) | 2s (infinite) |

Animation delays are also available:
- `animation-delay-100` through `animation-delay-500` (in 100ms increments)

## Page Transitions

To implement page transitions:

1. Import the custom hook:
```javascript
import { usePageTransition } from '../hooks/usePageTransition';
```

2. Use the hook in your component:
```javascript
const { isTransitioning, currentAnimation, navigateWithTransition } = usePageTransition({
  enterAnimation: 'animate-fade-in',
  exitAnimation: 'animate-fade-out',
  duration: 300
});
```

3. Or use the PageWrapper component:
```javascript
import PageWrapper from '../components/layout/PageWrapper';

// In your component's render method:
<PageWrapper
  enterAnimation="animate-fade-in"
  exitAnimation="animate-fade-out"
  showLoader={true}
>
  {/* Your page content */}
</PageWrapper>
```

## Loading Spinners

The `LoadingSpinner` component provides customizable loading indicators:

```javascript
import LoadingSpinner from '../components/common/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// Customized
<LoadingSpinner 
  size="lg" 
  color="primary" 
  text="Loading data..."
  overlay={true}
/>
```

Available options:
- **size**: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- **color**: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' (default: 'primary')
- **text**: Optional text to display below the spinner
- **overlay**: Whether to show spinner as full-screen overlay (default: false)

## Responsive Containers

The `ResponsiveContainer` component helps create adaptive layouts with animations:

```javascript
import ResponsiveContainer from '../components/common/ResponsiveContainer';

// Basic container
<ResponsiveContainer>
  {/* Your content */}
</ResponsiveContainer>

// Customized container
<ResponsiveContainer
  size="md"
  animation="animate-fade-in-up"
  padding="px-6 py-8"
>
  {/* Your content */}
</ResponsiveContainer>

// Grid layout
<ResponsiveContainer.Grid
  cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap="gap-6"
  animation="animate-card-reveal"
>
  {/* Grid items */}
</ResponsiveContainer.Grid>
```

## Best Practices

1. **Keep animations subtle**: Aim for subtle effects that enhance rather than distract from the user experience.

2. **Consider performance**: Use animations sparingly on mobile devices or provide options to reduce motion.

3. **Consistent timing**: Maintain consistent timing for similar animations throughout the application.

4. **Accessibility**: Ensure animations can be disabled for users who prefer reduced motion.

5. **Progressive enhancement**: Design functionality to work without animations first, then enhance with animations.

## Implementation Examples

### Dashboard with Page Transitions

```jsx
import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import ResponsiveContainer from '../components/common/ResponsiveContainer';

const DashboardPage = () => {
  return (
    <PageWrapper>
      <ResponsiveContainer animation="animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <ResponsiveContainer.Grid
          cols={{ sm: 1, md: 2, lg: 3 }}
          gap="gap-6"
        >
          {/* Dashboard cards with staggered animations */}
          <div className="animate-card-reveal animation-delay-100">
            {/* Card 1 content */}
          </div>
          <div className="animate-card-reveal animation-delay-200">
            {/* Card 2 content */}
          </div>
          <div className="animate-card-reveal animation-delay-300">
            {/* Card 3 content */}
          </div>
        </ResponsiveContainer.Grid>
      </ResponsiveContainer>
    </PageWrapper>
  );
};

export default DashboardPage;
