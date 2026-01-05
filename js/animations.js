// Unified Animation System
// Handles all animations: scroll-based, menu, and load animations

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    scrollThreshold: 0.1,
    scrollRootMargin: '0px 0px -50px 0px',
    fadeDuration: 600,
    menuSlideDuration: 300,
    staggerDelay: 100,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };

  // ============================================
  // ANIMATION MANAGER
  // ============================================
  const AnimationManager = {
    activeAnimations: new Set(),
    
    // Check if element is currently animating
    isAnimating(element) {
      return this.activeAnimations.has(element);
    },
    
    // Mark element as animating
    startAnimation(element) {
      this.activeAnimations.add(element);
    },
    
    // Mark element as done animating
    endAnimation(element) {
      this.activeAnimations.delete(element);
    }
  };

  // ============================================
  // SCROLL-BASED ANIMATIONS
  // ============================================
  const ScrollAnimations = {
    observer: null,
    
    init() {
      const elements = document.querySelectorAll('[data-animate-on-scroll], [data-w-id]');
      
      if (elements.length === 0) return;
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !AnimationManager.isAnimating(entry.target)) {
            AnimationManager.startAnimation(entry.target);
            this.fadeIn(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: CONFIG.scrollThreshold,
        rootMargin: CONFIG.scrollRootMargin
      });

      elements.forEach(element => {
        // Ensure initial opacity and transform are set
        if (!element.style.opacity) {
          element.style.opacity = '0';
        }
        if (!element.style.transform) {
          element.style.transform = 'translateY(20px)';
        }
        this.observer.observe(element);
      });
    },
    
    fadeIn(element) {
      element.style.transition = `opacity ${CONFIG.fadeDuration}ms ease-out, transform ${CONFIG.fadeDuration}ms ease-out`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      
      setTimeout(() => {
        AnimationManager.endAnimation(element);
      }, CONFIG.fadeDuration);
    }
  };

  // ============================================
  // LOAD ANIMATIONS
  // ============================================
  const LoadAnimations = {
    init() {
      const elements = document.querySelectorAll('[data-animate-on-load]');
      
      elements.forEach((element, index) => {
        // Set initial state
        if (!element.style.opacity) {
          element.style.opacity = '0';
        }
        if (!element.style.transform) {
          element.style.transform = 'translateY(20px)';
        }
        
        setTimeout(() => {
          if (!AnimationManager.isAnimating(element)) {
            AnimationManager.startAnimation(element);
            element.style.transition = `opacity ${CONFIG.fadeDuration}ms ease-out, transform ${CONFIG.fadeDuration}ms ease-out`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            
            setTimeout(() => {
              AnimationManager.endAnimation(element);
            }, CONFIG.fadeDuration);
          }
        }, index * CONFIG.staggerDelay);
      });
    }
  };

  // ============================================
  // MENU ANIMATIONS
  // ============================================
  const MenuAnimations = {
    menuButton: null,
    navMenu: null,
    isAnimating: false,
    observer: null,
    lastKnownState: false,
    
    init() {
      console.log('[MenuAnimations] Initializing...');
      this.menuButton = document.querySelector('.menu-button');
      this.navMenu = document.querySelector('.nav-menu');
      
      if (!this.menuButton || !this.navMenu) {
        console.error('[MenuAnimations] Missing elements:', { menuButton: !!this.menuButton, navMenu: !!this.navMenu });
        return;
      }
      
      // Only run on mobile
      if (window.innerWidth > 767) {
        console.log('[MenuAnimations] Desktop view, skipping mobile menu');
        return;
      }
      
      this.lastKnownState = this.navMenu.hasAttribute('data-nav-menu-open');
      console.log('[MenuAnimations] Initial state:', { lastKnownState: this.lastKnownState, hasAttribute: this.navMenu.hasAttribute('data-nav-menu-open') });
      this.updateButtonState('init');
      this.setupMenu();
      this.setupObserver();
      this.setupClickHandler();
      console.log('[MenuAnimations] Initialization complete');
    },
    
    setupMenu() {
      Object.assign(this.navMenu.style, {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        width: '100%',
        maxWidth: '100%',
        zIndex: '999',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: '40px 20px 100px',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        top: 'auto',
        transform: 'translateY(100%)',
        opacity: '0',
        pointerEvents: 'none'
      });
    },
    
    updateButtonState(state) {
      if (!this.menuButton) return;
      
      // Remove all state classes
      this.menuButton.classList.remove('menu-state-init', 'menu-state-opening', 'menu-state-open', 'menu-state-closing', 'menu-state-closed', 'menu-state-error', 'menu-state-desktop');
      
      // Add current state class
      this.menuButton.classList.add(`menu-state-${state}`);
      
      const hasAttr = this.navMenu ? this.navMenu.hasAttribute('data-nav-menu-open') : false;
      // Update title for debugging
      this.menuButton.setAttribute('title', `Menu: ${state} | Animating: ${this.isAnimating} | Has attr: ${hasAttr}`);
      
      console.log(`[MenuAnimations] Button state: ${state}`, { isAnimating: this.isAnimating, hasAttribute: hasAttr });
    },
    
    openMenu() {
      console.log('[MenuAnimations] openMenu() called', { isAnimating: this.isAnimating, hasClosingClass: this.navMenu.classList.contains('menu-closing') });
      
      // Don't open if already animating (unless it's closing)
      if (this.isAnimating && !this.navMenu.classList.contains('menu-closing')) {
        console.warn('[MenuAnimations] Already animating, cannot open');
        this.updateButtonState('error');
        return;
      }
      
      console.log('[MenuAnimations] Starting open animation');
      this.updateButtonState('opening');
      this.isAnimating = true;
      AnimationManager.startAnimation(this.navMenu);
      
      // Lock positioning
      this.navMenu.style.top = 'auto';
      this.navMenu.style.bottom = '0';
      this.navMenu.style.position = 'fixed';
      this.navMenu.style.pointerEvents = 'auto';
      this.navMenu.style.display = 'flex';
      
      console.log('[MenuAnimations] Menu styles set', {
        top: this.navMenu.style.top,
        bottom: this.navMenu.style.bottom,
        position: this.navMenu.style.position,
        display: this.navMenu.style.display
      });
      
      // Remove closing class, reset to start position
      this.navMenu.classList.remove('menu-closing');
      this.navMenu.style.transform = 'translateY(100%)';
      this.navMenu.style.opacity = '0';
      
      // Force reflow
      void this.navMenu.offsetHeight;
      
      // Trigger animation
      this.navMenu.classList.add('menu-opening');
      console.log('[MenuAnimations] Added menu-opening class');
      
      setTimeout(() => {
        const stillOpen = this.navMenu.hasAttribute('data-nav-menu-open');
        console.log('[MenuAnimations] Animation complete', { stillOpen, hasAttribute: stillOpen });
        
        // Check if menu should still be open
        if (stillOpen) {
          this.navMenu.classList.remove('menu-opening');
          this.navMenu.style.transform = 'translateY(0)';
          this.navMenu.style.opacity = '1';
          this.updateButtonState('open');
          console.log('[MenuAnimations] Menu opened successfully');
        } else {
          // Menu was closed during animation
          this.navMenu.classList.remove('menu-opening');
          this.navMenu.style.transform = 'translateY(100%)';
          this.navMenu.style.opacity = '0';
          this.navMenu.style.pointerEvents = 'none';
          this.updateButtonState('closed');
          console.warn('[MenuAnimations] Menu was closed during animation');
        }
        this.isAnimating = false;
        AnimationManager.endAnimation(this.navMenu);
      }, CONFIG.menuSlideDuration);
    },
    
    closeMenu() {
      console.log('[MenuAnimations] closeMenu() called', { isAnimating: this.isAnimating, hasOpeningClass: this.navMenu.classList.contains('menu-opening') });
      
      // Don't close if already animating (unless it's opening)
      if (this.isAnimating && !this.navMenu.classList.contains('menu-opening')) {
        console.warn('[MenuAnimations] Already animating, cannot close');
        this.updateButtonState('error');
        return;
      }
      
      console.log('[MenuAnimations] Starting close animation');
      this.updateButtonState('closing');
      this.isAnimating = true;
      AnimationManager.startAnimation(this.navMenu);
      
      this.navMenu.style.top = 'auto';
      this.navMenu.style.bottom = '0';
      this.navMenu.style.position = 'fixed';
      
      this.navMenu.classList.remove('menu-opening');
      this.navMenu.classList.add('menu-closing');
      console.log('[MenuAnimations] Added menu-closing class');
      
      setTimeout(() => {
        this.navMenu.classList.remove('menu-closing');
        this.navMenu.style.pointerEvents = 'none';
        this.navMenu.style.transform = 'translateY(100%)';
        this.navMenu.style.opacity = '0';
        this.isAnimating = false;
        AnimationManager.endAnimation(this.navMenu);
        this.updateButtonState('closed');
        console.log('[MenuAnimations] Menu closed successfully');
      }, CONFIG.menuSlideDuration);
    },
    
    handleStateChange() {
      console.log('[MenuAnimations] handleStateChange() called', { width: window.innerWidth });
      
      if (window.innerWidth > 767) {
        console.log('[MenuAnimations] Desktop view, skipping');
        this.updateButtonState('desktop');
        return;
      }
      
      const currentState = this.navMenu.hasAttribute('data-nav-menu-open');
      console.log('[MenuAnimations] State check', { currentState, lastKnownState: this.lastKnownState, isAnimating: this.isAnimating });
      
      // Only act if state actually changed
      if (currentState === this.lastKnownState) {
        console.log('[MenuAnimations] State unchanged, skipping');
        this.updateButtonState(currentState ? 'open' : 'closed');
        return;
      }
      
      console.log('[MenuAnimations] State changed!', { from: this.lastKnownState, to: currentState });
      
      // Update last known state
      this.lastKnownState = currentState;
      
      // Ensure positioning
      this.navMenu.style.top = 'auto';
      this.navMenu.style.bottom = '0';
      this.navMenu.style.position = 'fixed';
      
      if (currentState) {
        console.log('[MenuAnimations] Calling openMenu()');
        this.openMenu();
      } else {
        console.log('[MenuAnimations] Calling closeMenu()');
        this.closeMenu();
      }
    },
    
    setupObserver() {
      console.log('[MenuAnimations] Setting up observer');
      // Use a single debounced handler
      let timeout;
      
      this.observer = new MutationObserver((mutations) => {
        console.log('[MenuAnimations] Observer triggered', mutations.map(m => ({ type: m.type, attributeName: m.attributeName })));
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          console.log('[MenuAnimations] Observer timeout fired, calling handleStateChange');
          this.handleStateChange();
        }, 30); // Short delay to let Webflow finish
      });

      this.observer.observe(this.navMenu, {
        attributes: true,
        attributeFilter: ['data-nav-menu-open']
      });
      console.log('[MenuAnimations] Observer set up');
    },
    
    setupClickHandler() {
      console.log('[MenuAnimations] Setting up click handler');
      // Ensure positioning and trigger state check
      this.menuButton.addEventListener('click', (e) => {
        console.log('[MenuAnimations] Button clicked!');
        
        // Get current state BEFORE Webflow might change it
        const wasOpen = this.navMenu.hasAttribute('data-nav-menu-open');
        console.log('[MenuAnimations] State before Webflow', { wasOpen });
        
        // Ensure positioning is correct immediately
        this.navMenu.style.top = 'auto';
        this.navMenu.style.bottom = '0';
        this.navMenu.style.position = 'fixed';
        
        // Wait for Webflow to set attribute, or set it ourselves if Webflow doesn't
        setTimeout(() => {
          const currentState = this.navMenu.hasAttribute('data-nav-menu-open');
          console.log('[MenuAnimations] After click delay', { currentState, wasOpen, lastKnownState: this.lastKnownState });
          
          // If Webflow didn't set the attribute, toggle it ourselves
          if (currentState === wasOpen) {
            console.log('[MenuAnimations] Webflow did not change attribute, toggling manually');
            if (wasOpen) {
              this.navMenu.removeAttribute('data-nav-menu-open');
            } else {
              this.navMenu.setAttribute('data-nav-menu-open', '');
            }
            // Update lastKnownState to match what we just set
            this.lastKnownState = wasOpen;
            // Now handle the state change
            setTimeout(() => {
              this.handleStateChange();
            }, 10);
          } else {
            // Webflow changed it, use normal flow
            this.handleStateChange();
          }
        }, 50);
      });
      console.log('[MenuAnimations] Click handler set up');
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Initialize scroll animations
    ScrollAnimations.init();
    
    // Initialize load animations
    LoadAnimations.init();
    
    // Initialize menu animations
    MenuAnimations.init();
    
    // Handle window resize for menu
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth <= 767) {
          MenuAnimations.init();
        }
      }, 250);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

