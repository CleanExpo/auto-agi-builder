// Smooth scroll function for navigation
export const smoothScrollTo = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const headerOffset = 80; // Adjust based on header height
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

// Scroll to section with a delay (useful for after-click actions)
export const smoothScrollToWithDelay = (elementId, delay = 100) => {
  setTimeout(() => {
    smoothScrollTo(elementId);
  }, delay);
};

// Scroll to top of page
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Calculate if element is in viewport
export const isInViewport = (element, offset = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 - offset &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Scroll to element and highlight it temporarily
export const scrollAndHighlight = (elementId, highlightClass = 'highlight-element', duration = 1500) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  smoothScrollTo(elementId);
  
  // Add highlight class
  element.classList.add(highlightClass);
  
  // Remove highlight class after duration
  setTimeout(() => {
    element.classList.remove(highlightClass);
  }, duration);
};
