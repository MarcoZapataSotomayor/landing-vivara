/* ============================================================
   VÍVARA — Main JavaScript
   - Hero 4-video auto-rotation on ended + dot navigation
   - Cielo-inspired Product Showcase pop-out slider & signature motion
   - Emil Kowalski spring tilt & microinteractions
   - Bento distribution videos & banner showcase
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. NAVBAR — Glassmorphism on Scroll + Hero transparency
     -------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const hero = document.getElementById('hero');

  function handleNavbarScroll() {
    const scrollY = window.scrollY;
    const heroHeight = hero ? hero.offsetHeight : 0;

    if (scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }

    // Toggle hero-visible class for transparent navbar over hero
    if (scrollY < heroHeight - 80) {
      navbar.classList.add('navbar--hero-visible');
    } else {
      navbar.classList.remove('navbar--hero-visible');
    }
  }

  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('is-open');
      navLinks.classList.toggle('is-open');
      navbar.classList.toggle('navbar--menu-open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.navbar__link, .navbar__cta').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('is-open');
        navLinks.classList.remove('is-open');
        navbar.classList.remove('navbar--menu-open');
        document.body.classList.remove('no-scroll');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------------------------------------
     2. HERO — 4 Videos Auto-Rotation on Ended + Dot Selection
     -------------------------------------------------------- */
  const heroMedia = hero ? hero.querySelector('.hero__media') : null;
  const heroVideos = hero ? Array.from(hero.querySelectorAll('.hero__video')) : [];
  const heroDots = hero ? Array.from(hero.querySelectorAll('.hero__indicators .hero__dot')) : [];
  const heroFallback = hero ? hero.querySelector('.hero__gradient-fallback') : null;
  const heroBrand = hero ? hero.querySelector('.hero__brand') : null;
  let currentHeroIndex = 0;
  let isSwitchingHero = false;

  function switchHeroVideo(targetIndex) {
    if (targetIndex === currentHeroIndex && heroVideos[targetIndex] && !heroVideos[targetIndex].paused) {
      return;
    }
    if (targetIndex < 0 || targetIndex >= heroVideos.length) return;

    isSwitchingHero = true;
    const prevVideo = heroVideos[currentHeroIndex];
    const nextVideo = heroVideos[targetIndex];

    // Update active dot immediately
    heroDots.forEach((dot, idx) => {
      dot.classList.toggle('hero__dot--active', idx === targetIndex);
    });

    if (nextVideo) {
      nextVideo.currentTime = 0;
      const playPromise = nextVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            nextVideo.classList.add('hero__video--active');
            if (prevVideo && prevVideo !== nextVideo) {
              setTimeout(() => {
                prevVideo.classList.remove('hero__video--active');
                prevVideo.pause();
                isSwitchingHero = false;
              }, 600);
            } else {
              isSwitchingHero = false;
            }
          })
          .catch((err) => {
            console.warn('Hero video autoplay error:', err);
            nextVideo.classList.add('hero__video--active');
            if (prevVideo && prevVideo !== nextVideo) {
              prevVideo.classList.remove('hero__video--active');
            }
            isSwitchingHero = false;
          });
      }
    }

    currentHeroIndex = targetIndex;
  }

  // Setup listeners on the 4 hero videos
  heroVideos.forEach((video, idx) => {
    // When a video ends naturally, automatically rotate to the next!
    video.addEventListener('ended', () => {
      const nextIndex = (currentHeroIndex + 1) % heroVideos.length;
      switchHeroVideo(nextIndex);
    });

    // In case video errors out, show fallback or skip
    video.addEventListener('error', () => {
      console.warn(`Video ${idx + 1} failed to load, skipping.`);
      if (idx === currentHeroIndex) {
        const nextIndex = (currentHeroIndex + 1) % heroVideos.length;
        if (nextIndex !== currentHeroIndex) {
          switchHeroVideo(nextIndex);
        } else if (heroFallback) {
          heroFallback.style.zIndex = '0';
        }
      }
    });
  });

  // Setup click listeners on the 4 hero dots
  heroDots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      switchHeroVideo(idx);
    });
  });

  // Start the first video
  if (heroVideos.length > 0 && heroVideos[0]) {
    heroVideos[0].play().catch(() => {
      // Autoplay with sound might be blocked, but muted works
      heroVideos[0].muted = true;
      heroVideos[0].play().catch(() => {});
    });
  }

  // Subtle Parallax on scroll
  if (hero && heroMedia) {
    function handleHeroParallax() {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;

      if (scrollY > heroHeight) return;

      const progress = scrollY / heroHeight;
      heroMedia.style.transform = `translateY(${scrollY * 0.25}px) scale(${1 + progress * 0.04})`;

      if (heroBrand) {
        heroBrand.style.transform = `translateY(${scrollY * 0.12}px)`;
        heroBrand.style.opacity = Math.max(0, 1 - progress * 1.4);
      }
    }

    window.addEventListener('scroll', handleHeroParallax, { passive: true });
  }

  /* --------------------------------------------------------
     3. SCROLL REVEAL — IntersectionObserver
     -------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* --------------------------------------------------------
     4. PRODUCT SHOWCASE — Cielo-style Pop-Out Slider & Motion
     -------------------------------------------------------- */
  const productTrack = document.getElementById('productTrack');
  const productPrev = document.getElementById('productPrev');
  const productNext = document.getElementById('productNext');
  const productDots = Array.from(document.querySelectorAll('.product-dot'));
  const productSlides = productTrack ? Array.from(productTrack.querySelectorAll('.product-slide')) : [];
  let currentProductIndex = 0;

  function switchProductSlide(targetIndex) {
    if (targetIndex === currentProductIndex || productSlides.length === 0) return;

    const nextIndex = ((targetIndex % productSlides.length) + productSlides.length) % productSlides.length;
    const prevSlide = productSlides[currentProductIndex];
    const nextSlide = productSlides[nextIndex];

    // Update active class on slides
    productSlides.forEach((slide, idx) => {
      const isActive = idx === nextIndex;
      slide.classList.toggle('product-slide--active', isActive);

      // Re-trigger entrance animations on the newly active slide
      if (isActive) {
        const popImg = slide.querySelector('.product-pop-img');
        if (popImg) {
          popImg.style.animation = 'none';
          void popImg.offsetWidth; // Trigger reflow
          popImg.style.animation = '';
        }

        const textEls = slide.querySelectorAll(
          '.product-slide__badge, .product-slide__ph, .product-slide__name, .product-slide__desc, .product-slide__specs-row, .product-slide__cta'
        );
        textEls.forEach((el) => {
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        });
      }
    });

    // Update dots
    productDots.forEach((dot, idx) => {
      dot.classList.toggle('product-dot--active', idx === nextIndex);
    });

    currentProductIndex = nextIndex;
  }

  if (productPrev) {
    productPrev.addEventListener('click', () => {
      switchProductSlide(currentProductIndex - 1);
    });
  }

  if (productNext) {
    productNext.addEventListener('click', () => {
      switchProductSlide(currentProductIndex + 1);
    });
  }

  productDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      switchProductSlide(idx);
    });
  });

  // Touch Swipe for mobile on product track
  if (productTrack) {
    let touchStartX = 0;
    let touchEndX = 0;

    productTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    productTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 50; // px
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > threshold) {
        if (diff < 0) {
          switchProductSlide(currentProductIndex + 1);
        } else {
          switchProductSlide(currentProductIndex - 1);
        }
      }
    }
  }

  /* --------------------------------------------------------
     5. 3D TILT on Pop-out Products & Elements
     Emil Kowalski spring physics: RAF interpolation
     -------------------------------------------------------- */
  const tiltWraps = document.querySelectorAll('[data-tilt]');

  tiltWraps.forEach((wrap) => {
    const img = wrap.querySelector('.product-pop-img') || wrap.firstElementChild;
    if (!img) return;

    let current = { rotateX: 0, rotateY: 0, scale: 1 };
    let target = { rotateX: 0, rotateY: 0, scale: 1 };
    let animating = false;

    const SPRING = 0.1;
    const MAX_ROT = 10; // degrees

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function animateTilt() {
      current.rotateX = lerp(current.rotateX, target.rotateX, SPRING);
      current.rotateY = lerp(current.rotateY, target.rotateY, SPRING);
      current.scale = lerp(current.scale, target.scale, SPRING);

      img.style.transform = `perspective(800px) rotateX(${current.rotateX.toFixed(2)}deg) rotateY(${current.rotateY.toFixed(2)}deg) scale(${current.scale.toFixed(3)})`;

      const delta = Math.abs(current.rotateX - target.rotateX) + Math.abs(current.rotateY - target.rotateY);
      if (delta > 0.02) {
        requestAnimationFrame(animateTilt);
      } else {
        animating = false;
      }
    }

    function startTiltAnim() {
      if (!animating) {
        animating = true;
        requestAnimationFrame(animateTilt);
      }
    }

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = (x - rect.width / 2) / (rect.width / 2);
      const ny = (y - rect.height / 2) / (rect.height / 2);

      target.rotateX = -ny * MAX_ROT;
      target.rotateY = nx * MAX_ROT;
      target.scale = 1.05;
      startTiltAnim();
    });

    wrap.addEventListener('mouseleave', () => {
      target.rotateX = 0;
      target.rotateY = 0;
      target.scale = 1;
      startTiltAnim();
    });
  });

  /* --------------------------------------------------------
     6. BANNER PROMOCIONAL INTERACTION
     -------------------------------------------------------- */
  const bannerLink = document.querySelector('.banner-single__link');
  if (bannerLink) {
    bannerLink.addEventListener('mousemove', (e) => {
      const rect = bannerLink.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPercent = (x / rect.width - 0.5) * 4;
      const yPercent = (y / rect.height - 0.5) * -4;
      bannerLink.style.transform = `perspective(1000px) rotateY(${xPercent}deg) rotateX(${yPercent}deg) translateY(-3px)`;
    });

    bannerLink.addEventListener('mouseleave', () => {
      bannerLink.style.transform = '';
    });
  }

  /* --------------------------------------------------------
     7. SMOOTH SCROLL for anchor links
     -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-height'), 10) || 72;

        window.scrollTo({
          top: targetEl.offsetTop - offset,
          behavior: 'smooth',
        });
      }
    });
  });

  /* --------------------------------------------------------
     8. HERO SCROLL INDICATOR — fade out on scroll
     -------------------------------------------------------- */
  const heroScroll = document.querySelector('.hero__scroll');

  if (heroScroll) {
    function handleHeroScrollVisibility() {
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 300);
      heroScroll.style.opacity = opacity;
    }

    window.addEventListener('scroll', handleHeroScrollVisibility, { passive: true });
  }

  /* --------------------------------------------------------
     9. BENTO VIDEO HOVER — Play/pause on hover with scale
     -------------------------------------------------------- */
  const bentoVideos = document.querySelectorAll('.bento__item--video');

  bentoVideos.forEach((item) => {
    const video = item.querySelector('video');
    if (!video) return;

    item.addEventListener('mouseenter', () => {
      video.style.transform = 'scale(1.03)';
      video.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    item.addEventListener('mouseleave', () => {
      video.style.transform = 'scale(1)';
    });
  });

  /* --------------------------------------------------------
     10. COOKIE CONSENT BANNER & PREFERENCE MANAGEMENT
     Compliant with Ley N° 29733 (Perú) & RGPD
     -------------------------------------------------------- */
  function initCookieConsent() {
    const CONSENT_KEY = 'vivara_cookie_consent';

    function showBanner() {
      if (document.getElementById('cookieBanner')) return;

      const banner = document.createElement('aside');
      banner.id = 'cookieBanner';
      banner.className = 'cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Gestión de consentimiento de cookies');
      banner.setAttribute('aria-live', 'polite');

      banner.innerHTML = `
        <div class="cookie-banner__header">
          <div class="cookie-banner__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a10 10 0 0 0-4 1.8 3 3 0 0 1 .5 3.2 3 3 0 0 1-2.5 1.5 3 3 0 0 1-1.8-.6A10 10 0 0 0 2 12"/>
              <circle cx="8.5" cy="8.5" r="1" fill="currentColor"/>
              <circle cx="15.5" cy="8.5" r="1" fill="currentColor"/>
              <circle cx="15.5" cy="15.5" r="1" fill="currentColor"/>
              <circle cx="9.5" cy="15.5" r="1" fill="currentColor"/>
            </svg>
          </div>
          <h3 class="cookie-banner__title">Tu privacidad es importante</h3>
        </div>
        <p class="cookie-banner__desc">
          Utilizamos cookies esenciales y analíticas para optimizar tu experiencia y analizar el tráfico conforme a la Ley N° 29733 (Perú). Conoce más en nuestra <a href="cookies.html">Política de Cookies</a>.
        </p>
        <div class="cookie-banner__actions">
          <button type="button" class="cookie-banner__btn cookie-banner__btn--accept" id="btnAcceptCookies">Aceptar todas</button>
          <button type="button" class="cookie-banner__btn cookie-banner__btn--reject" id="btnRejectCookies">Solo necesarias</button>
        </div>
      `;

      document.body.appendChild(banner);

      requestAnimationFrame(() => {
        banner.classList.add('is-visible');
      });

      const btnAccept = document.getElementById('btnAcceptCookies');
      const btnReject = document.getElementById('btnRejectCookies');

      function hideBanner(choice) {
        try {
          localStorage.setItem(CONSENT_KEY, choice);
        } catch (e) {
          console.warn('LocalStorage not available for cookie consent:', e);
        }
        banner.classList.remove('is-visible');
        setTimeout(() => {
          banner.remove();
        }, 450);
      }

      if (btnAccept) {
        btnAccept.addEventListener('click', () => hideBanner('all'));
      }
      if (btnReject) {
        btnReject.addEventListener('click', () => hideBanner('essential'));
      }
    }

    try {
      const currentConsent = localStorage.getItem(CONSENT_KEY);
      if (!currentConsent) {
        setTimeout(showBanner, 800);
      }
    } catch (e) {
      setTimeout(showBanner, 800);
    }

    // Reset button on cookies.html
    const resetBtn = document.getElementById('btnResetCookies');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        try {
          localStorage.removeItem(CONSENT_KEY);
        } catch (e) {}
        showBanner();
        resetBtn.textContent = '¡Preferencias restablecidas!';
        setTimeout(() => {
          resetBtn.textContent = 'Restablecer Preferencias';
        }, 2000);
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }

})();

