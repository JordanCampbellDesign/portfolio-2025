// Password Protection for Static Site
// Works with Vercel and other static hosts

(function() {
  'use strict';

  // Configuration
  const PASSWORD_KEY = 'portfolio_auth';
  
  // SET YOUR PASSWORD HERE - Change 'your_password_here' to your actual password
  const CORRECT_PASSWORD = 'your_password_here'; // ⚠️ CHANGE THIS TO YOUR ACTUAL PASSWORD
  
  const PROTECTED_PAGES = [
    'work/hibernate.html',
    'work/carrier.html',
    'work/home-depot.html',
    'work/mcdonalds.html',
    'work/sight.html'
  ];

  // Simple hash function (for basic obfuscation - not cryptographically secure)
  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Check if user is authenticated
  function isAuthenticated() {
    const auth = sessionStorage.getItem(PASSWORD_KEY);
    if (!auth) return false;
    
    // Check if auth is still valid (24 hours)
    const authData = JSON.parse(auth);
    const now = Date.now();
    if (now - authData.timestamp > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem(PASSWORD_KEY);
      return false;
    }
    return authData.authenticated === true;
  }

  // Set authentication
  function setAuthenticated() {
    sessionStorage.setItem(PASSWORD_KEY, JSON.stringify({
      authenticated: true,
      timestamp: Date.now()
    }));
  }

  // Check if current page is protected
  function isProtectedPage() {
    const path = window.location.pathname;
    return PROTECTED_PAGES.some(page => path.includes(page));
  }

  // Redirect to password page
  function redirectToPassword() {
    const currentPath = encodeURIComponent(window.location.pathname);
    window.location.href = `/401.html?redirect=${currentPath}`;
  }

  // Handle password form submission
  function handlePasswordSubmit(event) {
    event.preventDefault();
    const passwordInput = document.getElementById('pass');
    const password = passwordInput.value;
    const passwordHash = hashPassword(password);
    
    // Check password
    const correctHash = hashPassword(CORRECT_PASSWORD);
    
    if (passwordHash === correctHash) {
      setAuthenticated();
      
      // Get redirect URL from query params
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (redirect) {
        window.location.href = decodeURIComponent(redirect);
      } else {
        window.location.href = '/index.html';
      }
    } else {
      // Show error
      const errorDiv = document.querySelector('.w-password-page.w-form-fail');
      if (errorDiv) {
        errorDiv.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  }

  // Initialize
  if (window.location.pathname.includes('401.html')) {
    // Password page - attach form handler
    const form = document.getElementById('email-form');
    if (form) {
      form.addEventListener('submit', handlePasswordSubmit);
    }
  } else {
    // Protected page - check authentication
    if (isProtectedPage() && !isAuthenticated()) {
      redirectToPassword();
    }
  }
})();

