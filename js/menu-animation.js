// Menu slide-up animation for mobile
// Complete solution that handles all menu animation to avoid Webflow conflicts

(function() {
  'use strict';

  // Only run on mobile screens
  function isMobile() {
    return window.innerWidth <= 767;
  }

  const menuButton = document.querySelector('.menu-button');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!menuButton || !navMenu) {
    return;
  }

  let isOpen = false;
  let isAnimating = false;
  const ANIMATION_DURATION = 300; // milliseconds

  // Initialize menu styles
  function initializeMenu() {
    if (!isMobile()) {
      // Reset on desktop
      navMenu.style.removeProperty('transform');
      navMenu.style.removeProperty('opacity');
      navMenu.style.removeProperty('transition');
      navMenu.style.removeProperty('top');
      return;
    }

    // Set up base styles
    navMenu.style.position = 'fixed';
    navMenu.style.bottom = '0';
    navMenu.style.left = '0';
    navMenu.style.right = '0';
    navMenu.style.width = '100%';
    navMenu.style.maxWidth = '100%';
    navMenu.style.zIndex = '999';
    navMenu.style.display = 'flex';
    navMenu.style.flexDirection = 'column';
    navMenu.style.alignItems = 'center';
    navMenu.style.justifyContent = 'center';
    navMenu.style.backgroundColor = '#fff';
    navMenu.style.padding = '40px 20px 100px';
    navMenu.style.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.1)';
    navMenu.style.textAlign = 'center';
    navMenu.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIMATION_DURATION}ms ease`;
    navMenu.style.top = 'auto';
    
    // Start hidden
    navMenu.style.transform = 'translateY(100%)';
    navMenu.style.opacity = '0';
    navMenu.style.pointerEvents = 'none';
  }

  // Animate menu opening
  function openMenu() {
    if (isAnimating || isOpen) return;
    
    isAnimating = true;
    isOpen = true;
    
    // Ensure menu is visible
    navMenu.style.pointerEvents = 'auto';
    
    // Set initial state
    navMenu.style.transform = 'translateY(100%)';
    navMenu.style.opacity = '0';
    
    // Force reflow
    navMenu.offsetHeight;
    
    // Animate to visible
    requestAnimationFrame(function() {
      navMenu.style.transform = 'translateY(0)';
      navMenu.style.opacity = '1';
      
      setTimeout(function() {
        isAnimating = false;
      }, ANIMATION_DURATION);
    });
  }

  // Animate menu closing
  function closeMenu() {
    if (isAnimating || !isOpen) return;
    
    isAnimating = true;
    isOpen = false;
    
    navMenu.style.transform = 'translateY(100%)';
    navMenu.style.opacity = '0';
    
    setTimeout(function() {
      navMenu.style.pointerEvents = 'none';
      isAnimating = false;
    }, ANIMATION_DURATION);
  }

  // Toggle menu
  function toggleMenu() {
    if (navMenu.hasAttribute('data-nav-menu-open')) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  // Initialize on load
  initializeMenu();

  // Watch for attribute changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-nav-menu-open') {
        toggleMenu();
      }
    });
  });

  observer.observe(navMenu, {
    attributes: true,
    attributeFilter: ['data-nav-menu-open']
  });

  // Handle button clicks
  menuButton.addEventListener('click', function(e) {
    // Small delay to let Webflow set the attribute
    setTimeout(function() {
      toggleMenu();
    }, 10);
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      initializeMenu();
      if (!isMobile() && isOpen) {
        closeMenu();
      }
    }, 250);
  });

  // Handle initial state check
  if (navMenu.hasAttribute('data-nav-menu-open')) {
    setTimeout(function() {
      openMenu();
    }, 100);
  }
})();

