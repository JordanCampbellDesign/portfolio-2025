// Custom animation system for new sections
// Replicates Webflow's fade-in animation behavior

(function() {
  'use strict';

  function animateOnLoad() {
    // Find all elements with opacity:0 that need animation
    const elementsToAnimate = document.querySelectorAll('[data-animate-on-load]');
    
    elementsToAnimate.forEach((element, index) => {
      // Stagger animations slightly
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease-out';
        element.style.opacity = '1';
      }, index * 100);
    });
  }

  function animateOnScroll() {
    const elementsToAnimate = document.querySelectorAll('[data-animate-on-scroll]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'opacity 0.6s ease-out';
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elementsToAnimate.forEach(element => {
      observer.observe(element);
    });
  }

  // Initialize animations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      animateOnLoad();
      animateOnScroll();
    });
  } else {
    animateOnLoad();
    animateOnScroll();
  }
})();

