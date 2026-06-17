/* ════════════════════════════════════════
   WATERTECH ENGINEERING — MAIN SCRIPT
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── GOOGLE SHEET INTEGRATION ─────────── */
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzjVwWDs0QKR3StFR7Nr22SLb063Snmk77e56zcfff0mTvGIgQLelhieDa_uwzU5Sc/exec';

  function submitToGoogleSheet(formData, formType) {
    // Map formType string to the source values expected by Google Apps Script ("welcome" | "contact" | "footer")
    let source = "Unknown";
    if (formType === "Welcome Form") source = "welcome";
    else if (formType === "Contact Form") source = "contact";
    else if (formType === "Footer Form") source = "footer";

    const payload = {
      name: formData.get('name') || '',
      phone: formData.get('phone') || '',
      email: formData.get('email') || '',
      message: formData.get('message') || '',
      source: source
    };

    return fetch(scriptURL, {
      method: 'POST',
      body: JSON.stringify(payload),
      mode: 'no-cors'
    })
    .then(response => {
      console.log(`Form "${formType}" submitted successfully`);
    })
    .catch(error => {
      console.error(`Error submitting form "${formType}":`, error);
    });
  }

  /* ── AOS INIT ─────────────────────────── */
  if (window.AOS) {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 100 });
  }

  /* ── NAVBAR SCROLL ────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── MOBILE MENU ──────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.mm-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SWIPER ───────────────────────────── */
  if (window.Swiper) {
    new Swiper('.project-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 900,
      autoplay: { delay: 4500, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.snb-next',
        prevEl: '.snb-prev',
      },
      breakpoints: {
        768:  { slidesPerView: 1.05 },
        1024: { slidesPerView: 1.25 },
      },
    });
  }

  /* ── STAT COUNTER ─────────────────────── */
  const statItems = document.querySelectorAll('.stat-item[data-target]');
  statItems.forEach(item => {
    const numEl = item.querySelector('.stat-num');
    if (!numEl) return;
    const target = parseInt(item.dataset.target, 10);

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        let count = 0;
        const duration = 1600;
        const step = Math.max(1, Math.ceil(target / (duration / 16)));
        const interval = setInterval(() => {
          count = Math.min(count + step, target);
          numEl.textContent = count;
          if (count >= target) clearInterval(interval);
        }, 16);
      });
    }, { threshold: 0.5 });
    observer.observe(item);
  });

  /* ── MODAL SYSTEM ─────────────────────── */
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
    // Only restore scroll if no other modal is open
    const anyOpen = document.querySelector('.modal-overlay.active, .welcome-overlay.active');
    if (!anyOpen) document.body.style.overflow = '';
  }

  /* ── WELCOME MODAL (auto-open) ────────── */
  const welcomeModal = document.getElementById('welcomeModal');
  const welcomeClose = document.getElementById('welcomeClose');

  // Open with slight delay for page load smoothness
  if (welcomeModal) {
    setTimeout(() => {
      welcomeModal.classList.add('active');
      welcomeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }, 600);

    // Close on backdrop click
    welcomeModal.querySelector('.welcome-backdrop').addEventListener('click', () => {
      closeModal('welcomeModal');
    });
  }

  if (welcomeClose) {
    welcomeClose.addEventListener('click', () => closeModal('welcomeModal'));
  }

  // Welcome form submit
  const welcomeForm = document.getElementById('welcomeForm');
  if (welcomeForm) {
    welcomeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = welcomeForm.querySelector('.wf-submit');
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Sent! We'll be in touch.`;
      
      const formData = new FormData(welcomeForm);
      submitToGoogleSheet(formData, 'Welcome Form');

      welcomeForm.reset();
      setTimeout(() => {
        closeModal('welcomeModal');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }, 2500);
    });
  }

  /* ── CONTACT MODAL ────────────────────── */
  const contactModal = document.getElementById('contactModal');
  const modalClose = document.getElementById('modalClose');

  if (contactModal) {
    // Stop clicks inside modal box from closing
    contactModal.querySelector('.modal-box').addEventListener('click', e => e.stopPropagation());
    // Close on backdrop click
    contactModal.querySelector('.modal-backdrop').addEventListener('click', () => closeModal('contactModal'));
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => closeModal('contactModal'));
  }

  // All .contact-trigger elements open the contact modal
  document.querySelectorAll('.contact-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Close welcome modal first if open
      if (welcomeModal && welcomeModal.classList.contains('active')) {
        welcomeModal.classList.remove('active');
        welcomeModal.setAttribute('aria-hidden', 'true');
      }
      openModal('contactModal');
      // Close mobile menu if open
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = 'hidden'; // keep locked for modal
      }
    });
  });

  // Contact form submit
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('.cf-submit');
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span>Sent Successfully!</span>`;
      
      const formData = new FormData(contactForm);
      submitToGoogleSheet(formData, 'Contact Form');

      contactForm.reset();
      setTimeout(() => {
        closeModal('contactModal');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }, 2800);
    });
  }

  /* ── FOOTER FORM ──────────────────────── */
  const footerForm = document.getElementById('footerForm');
  if (footerForm) {
    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = footerForm.querySelector('.ff-btn');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '✓ Sent!';

      const formData = new FormData(footerForm);
      submitToGoogleSheet(formData, 'Footer Form');

      footerForm.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = original;
      }, 3000);
    });
  }

  /* ── LIGHTBOX MODAL ───────────────────── */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightboxModal && lightboxImage && lightboxCaption) {
    document.querySelectorAll('.sector-card').forEach(card => {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        const img = this.querySelector('img');
        const h3 = this.querySelector('h3');
        const p = this.querySelector('p');

        if (img) {
          lightboxImage.src = img.getAttribute('src');
          lightboxImage.alt = img.getAttribute('alt') || 'Sector Image';
          
          let captionHTML = '';
          if (h3) captionHTML += `<h3>${h3.textContent}</h3>`;
          if (p) captionHTML += `<p>${p.textContent}</p>`;
          lightboxCaption.innerHTML = captionHTML;

          lightboxModal.classList.add('active');
          lightboxModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      
      const anyOpen = document.querySelector('.modal-overlay.active, .welcome-overlay.active');
      if (!anyOpen) document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightboxModal.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
  }

  /* ── ESC KEY ──────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (contactModal && contactModal.classList.contains('active')) closeModal('contactModal');
    else if (welcomeModal && welcomeModal.classList.contains('active')) closeModal('welcomeModal');
    else if (lightboxModal && lightboxModal.classList.contains('active')) {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      const anyOpen = document.querySelector('.modal-overlay.active, .welcome-overlay.active');
      if (!anyOpen) document.body.style.overflow = '';
    }
  });

  /* ── URL ROUTING (History API) ───────── */
  const routeMap = {
    '/about':    '#about',
    '/services': '#services',
    '/sectors':  '#sectors',
    '/projects': '#projects',
    '/contact':  '#contact',
  };

  function scrollToSection(sectionId) {
    const target = document.querySelector(sectionId);
    if (!target) return;
    const navH = navbar ? navbar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function setActiveNavLink(path) {
    document.querySelectorAll('.nav-link, .mm-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === path);
    });
  }

  // Intercept clicks on route links
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '/') {
        e.preventDefault();
        history.pushState(null, '', '/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveNavLink('/');
        return;
      }
      const sectionId = routeMap[href];
      if (!sectionId) return; // let browser handle real external links
      e.preventDefault();
      history.pushState(null, '', href);
      scrollToSection(sectionId);
      setActiveNavLink(href);
    });
  });

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    const sectionId = routeMap[path];
    if (sectionId) {
      scrollToSection(sectionId);
      setActiveNavLink(path);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveNavLink('/');
    }
  });

  // On page load, scroll to section if URL has a route path
  (function handleInitialRoute() {
    const path = window.location.pathname;
    const sectionId = routeMap[path];
    if (sectionId) {
      // Small delay so page renders before scrolling
      setTimeout(() => {
        scrollToSection(sectionId);
        setActiveNavLink(path);
      }, 300);
    }
  })();

  // Update URL as user scrolls through sections
  const sections = [
    { id: 'about',    path: '/about'    },
    { id: 'services', path: '/services' },
    { id: 'sectors',  path: '/sectors'  },
    { id: 'projects', path: '/projects' },
    { id: 'contact',  path: '/contact'  },
  ];

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const match = sections.find(s => s.id === entry.target.id);
      if (!match) return;
      history.replaceState(null, '', match.path);
      setActiveNavLink(match.path);
    });
  }, { threshold: 0.35 });

  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) scrollObserver.observe(el);
  });

  // Reset URL to '/' when scrolled back near top (above about section)
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          history.replaceState(null, '', '/');
          setActiveNavLink('/');
        }
      });
    }, { threshold: 0.4 });
    heroObserver.observe(heroSection);
  }

  /* ── HERO ENTRANCE ANIMATION ─────────── */
  const heroCopy = document.querySelector('.hero-copy');
  if (heroCopy) {
    heroCopy.style.opacity = '0';
    heroCopy.style.transform = 'translateY(30px)';
    heroCopy.style.transition = 'opacity .8s cubic-bezier(.4,0,.2,1) .2s, transform .8s cubic-bezier(.4,0,.2,1) .2s';
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroCopy.style.opacity = '1';
        heroCopy.style.transform = 'translateY(0)';
      }, 100);
    });
  }

  const moreToggle = document.querySelector('.more-toggle');
  const hiddenChecklistItems = document.querySelectorAll('.check-list .hidden-item');
  if (moreToggle && hiddenChecklistItems.length) {
    moreToggle.addEventListener('click', () => {
      const expanded = moreToggle.getAttribute('aria-expanded') === 'true';
      hiddenChecklistItems.forEach(item => {
        item.style.display = expanded ? 'none' : 'flex';
      });
      moreToggle.setAttribute('aria-expanded', (!expanded).toString());
      moreToggle.textContent = expanded ? 'View more points' : 'Show fewer points';
    });
  }

});
