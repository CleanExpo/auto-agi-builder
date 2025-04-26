# Auto AGI Builder Animation System

This document provides a comprehensive overview of the animation system implemented in Auto AGI Builder. The animation system is designed to enhance the user interface with smooth, accessible animations that can be easily controlled and customized.

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Components](#components)
4. [Animation Hooks](#animation-hooks)
5. [CSS Classes](#css-classes)
6. [Accessibility](#accessibility)
7. [Performance Considerations](#performance-considerations)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)

## Overview

The Auto AGI Builder animation system consists of reusable components, custom hooks, CSS animations, and a global context for controlling animation settings. It's designed to be:

- **Accessible**: Respects user preferences and provides reduced motion options
- **Performant**: Uses CSS animations and intersection observer for optimal rendering
- **Flexible**: Allows customization at both component and app-wide levels
- **Consistent**: Maintains uniform timing and motion styles across the application

## Core Concepts

### Animation Context

The `AnimationContext` provides global control over animations throughout the application:

- **Enable/Disable Animations**: Turn all animations on or off
- **Animation Speed**: Set speed to slow, normal, or fast
- **Reduced Motion**: Comply with accessibility needs

### Animation Hooks

Custom hooks provide the logic for applying animations to elements:

- **useAnimation**: Main hook for animating elements
- **useIntersectionObserver**: Utility hook for detecting viewport visibility

### Animation Components

Reusable components with built-in animation capabilities:

- **AnimatedButton**: Buttons with various animation effects
- **AnimatedCard**: Card layout with animation support
- **Other components**: Any component can use the hooks and CSS classes

## Components

### AnimatedButton

A button component with built-in animation effects.

```jsx
<AnimatedButton
  variant="primary" // primary, secondary, success, danger, warning, info, light, dark
  animation="scale" // scale, ripple, glow, bounce, none
  size="md"        // sm, md, lg
  onClick={handleClick}
  className="custom-class"
>
  Click Me
</AnimatedButton>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'primary'` | Button visual style |
| `animation` | string | `'scale'` | Animation effect type |
| `size` | string | `'md'` | Button size |
| `onClick` | function | - | Click handler |
| `className` | string | - | Additional CSS classes |
| `disabled` | boolean | `false` | Disables the button |

### AnimatedCard

A card component with animation capabilities and compound components pattern.

```jsx
<AnimatedCard
  animation="animate-fade-in-up"
  delay={200}
  className="p-6"
>
  <AnimatedCard.Title>Card Title</AnimatedCard.Title>
  <AnimatedCard.Body>Content goes here...</AnimatedCard.Body>
  <AnimatedCard.Footer>
    <button>Action</button>
  </AnimatedCard.Footer>
</AnimatedCard>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | string | `'animate-fade-in'` | CSS animation class |
| `delay` | number | `0` | Animation delay in ms |
| `className` | string | - | Additional CSS classes |

#### Sub-components

- `AnimatedCard.Title`: Card title component
- `AnimatedCard.Body`: Main content area
- `AnimatedCard.Footer`: Footer area, usually for actions
- `AnimatedCard.Icon`: Icon placement component
- `AnimatedCard.Image`: Image component with positioning
- `AnimatedCard.Stat`: For displaying metric/statistic

## Animation Hooks

### useAnimation

Main hook for applying animations to elements.

```jsx
const MyComponent = () => {
  const animation = useAnimation({
    animation: 'animate-fade-in-up',
    delay: 200,
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <div 
      ref={animation.ref}
      className={`my-component ${animation.animationClasses}`}
    >
      This content will animate when visible
    </div>
  );
};
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `animation` | string | `'animate-fade-in'` | CSS animation class |
| `delay` | number | `0` | Animation delay in ms |
| `triggerOnce` | boolean | `true` | If true, only animates first time element enters viewport |
| `threshold` | number | `0.1` | Amount of element visible before triggering (0-1) |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `ref` | React ref | Attach to the element to be animated |
| `isVisible` | boolean | Whether element is currently visible |
| `hasAnimated` | boolean | Whether element has animated at least once |
| `animationClasses` | string | CSS classes to apply the animation |
| `triggerAnimation` | function | Manually trigger the animation |
| `resetAnimation` | function | Reset animation state |

### useIntersectionObserver

Utility hook for detecting when an element is visible in the viewport.

```jsx
const MyComponent = () => {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '0px',
    freezeOnceVisible: true
  });

  return (
    <div ref={ref}>
      {isVisible ? 'I am visible!' : 'Not visible yet'}
    </div>
  );
};
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | number | `0.1` | Amount of element visible before triggering (0-1) |
| `rootMargin` | string | `'0px'` | Margin around root element |
| `root` | Element | `null` | Element used as viewport (default: browser viewport) |
| `freezeOnceVisible` | boolean | `false` | Keep element marked as visible once triggered |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `ref` | React ref | Attach to the element to be observed |
| `isVisible` | boolean | Whether element is currently visible |
| `hasIntersected` | boolean | Whether element has been visible at least once |

## CSS Classes

### Entrance Animations

These animations reveal elements as they enter the viewport.

| Class | Description |
|-------|-------------|
| `animate-fade-in` | Simple fade in |
| `animate-fade-in-up` | Fade in while moving up |
| `animate-fade-in-down` | Fade in while moving down |
| `animate-scale-in` | Fade in while scaling up |
| `animate-slide-in-right` | Slide in from right |
| `animate-slide-in-left` | Slide in from left |
| `animate-bounce-in` | Bounce in with overshoot |
| `animate-count-up` | For numeric counters |

### Continuous Animations

These animations run continuously or on interaction.

| Class | Description |
|-------|-------------|
| `animate-float` | Gentle floating motion |
| `animate-glow-pulse` | Pulsing glow effect |
| `animate-button-press` | Button click animation |
| `animate-ripple` | Material-style ripple effect |
| `animate-bounce-once` | Single bounce animation |

### Animation Delay Utilities

Classes to stagger animations.

| Class | Description |
|-------|-------------|
| `animation-delay-100` | 100ms delay |
| `animation-delay-200` | 200ms delay |
| `animation-delay-300` | 300ms delay |
| `animation-delay-500` | 500ms delay |
| `animation-delay-800` | 800ms delay |

### Staggered Children Classes

For creating staggered animations across multiple child elements.

```jsx
<div className="stagger-children">
  <div className="staggered-item">First item (100ms delay)</div>
  <div className="staggered-item">Second item (200ms delay)</div>
  <div className="staggered-item">Third item (300ms delay)</div>
</div>
```

## Accessibility

The animation system is built with accessibility in mind:

1. **Respects User Preferences**:
   - Honors the `prefers-reduced-motion` media query
   - Provides UI controls to disable or reduce animations

2. **Reduced Motion Mode**:
   - Sets animation durations to near-zero
   - Disables non-essential animations
   - Can be enabled via AnimationContext

3. **Animation Controls**:
   - Global enable/disable toggle
   - Speed settings (slow, normal, fast)

4. **Implementation Example**:

```jsx
import { useAnimationContext } from '../contexts/AnimationContext';

function AccessibleComponent() {
  const { animationsEnabled, enableReducedMotion } = useAnimationContext();
  
  // Use this info to adjust animations or provide alternative experiences
  return (
    <div>
      {animationsEnabled ? (
        <AnimatedElement />
      ) : (
        <StaticAlternative />
      )}
      
      <button onClick={enableReducedMotion}>
        Enable Reduced Motion
      </button>
    </div>
  );
}
```

## Performance Considerations

1. **CSS Over JavaScript**:
   - System primarily uses CSS animations for better performance
   - JavaScript is only used for controlling animation state

2. **Intersection Observer**:
   - Elements are only animated when visible in viewport
   - Prevents unnecessary animations off-screen

3. **Hardware Acceleration**:
   - CSS animations use transforms and opacity for GPU acceleration
   - Minimizes layout thrashing

4. **Staggered Animations**:
   - Prevents too many simultaneous animations
   - Reduces strain on the browser's rendering engine

5. **Best Practices**:
   - Avoid animating layout properties (width, height, top, left)
   - Prefer transform and opacity which don't trigger layout

## Usage Examples

### Basic Card Example

```jsx
import AnimatedCard from '../components/common/AnimatedCard';

function ProductCard({ product }) {
  return (
    <AnimatedCard
      animation="animate-fade-in-up"
      delay={200}
      className="p-6"
    >
      <AnimatedCard.Image 
        src={product.image} 
        alt={product.name} 
        position="top" 
      />
      
      <AnimatedCard.Title>{product.name}</AnimatedCard.Title>
      
      <AnimatedCard.Body>
        <p>{product.description}</p>
        
        <AnimatedCard.Stat
          value={`$${product.price}`}
          label="Starting from"
        />
      </AnimatedCard.Body>
      
      <AnimatedCard.Footer>
        <AnimatedButton>Add to Cart</AnimatedButton>
      </AnimatedCard.Footer>
    </AnimatedCard>
  );
}
```

### Staggered List Example

```jsx
import { useAnimation } from '../hooks/useAnimation';

function AnimatedList({ items }) {
  return (
    <ul className="stagger-children">
      {items.map((item, index) => (
        <li 
          key={item.id}
          className="staggered-item animate-fade-in-left"
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### Custom Animation with Hook

```jsx
import { useAnimation } from '../hooks/useAnimation';

function FeaturedContent() {
  const headerAnimation = useAnimation({
    animation: 'animate-fade-in-down',
    delay: 100,
  });
  
  const bodyAnimation = useAnimation({
    animation: 'animate-fade-in',
    delay: 300,
  });
  
  return (
    <section className="featured-content">
      <h2 
        ref={headerAnimation.ref}
        className={headerAnimation.animationClasses}
      >
        Featured Content
      </h2>
      
      <div
        ref={bodyAnimation.ref}
        className={bodyAnimation.animationClasses}
      >
        <p>This content will animate with a slight delay after the heading.</p>
      </div>
    </section>
  );
}
```

## Best Practices

1. **Animation Purpose**:
   - Use animations to enhance user experience, not distract from it
   - Animations should communicate information or guide attention

2. **Animation Timing**:
   - Keep animations short (300-500ms is often optimal)
   - Use consistent durations for similar actions

3. **Reduce Motion When Needed**:
   - Always provide a reduced motion alternative
   - Test with the `prefers-reduced-motion` media query

4. **Performance**:
   - Limit the number of simultaneous animations
   - Use staggered animations for lists or grids
   - Avoid animating expensive CSS properties

5. **Consistency**:
   - Use the provided components and hooks for consistent behavior
   - Follow the established animation patterns

6. **Testing**:
   - Test animations at different speeds
   - Test with reduced motion enabled
   - Test on lower-powered devices

7. **Accessibility**:
   - Never rely on animation to convey essential information
   - Provide alternative means of accessing content

8. **Integration with Application**:
   - Use the AnimationContext for global control
   - Allow users to customize animation settings
