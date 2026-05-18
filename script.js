document.addEventListener('DOMContentLoaded', function () {
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 120,
    });
  }

  if (window.Swiper) {
    const swiper = new Swiper('.project-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 900,
      autoplay: {
        delay: 4200,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: {
          slidesPerView: 1.05,
        },
        1024: {
          slidesPerView: 1.25,
        },
      },
    });
  }

  const counters = document.querySelectorAll('.stat-number');
  counters.forEach((counter) => {
    const updateCount = () => {
      const targetText = counter.textContent.replace(/\D/g, '');
      const target = Number(targetText);
      let count = 0;
      const step = Math.max(1, Math.round(target / 60));
      const interval = setInterval(() => {
        count += step;
        if (count >= target) {
          counter.textContent = targetText;
          clearInterval(interval);
        } else {
          counter.textContent = count + (targetText.includes('+') ? '+' : '');
        }
      }, 18);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateCount();
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 }
    );

    observer.observe(counter);
  });

  /* =========================
     Contact Modal Functionality
     ========================= */
  
  const modal = document.getElementById('contactModal');
  const contactForm = document.getElementById('contactForm');
  const closeBtn = document.querySelector('.modal-close-btn');
  
  // Open modal function
  function openModal() {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  // Close modal function
  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }
  
  // Auto-open modal on page load
  setTimeout(() => {
    openModal();
  }, 500);
  
  // Close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Click on backdrop to close
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  // Keyboard escape to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Open modal on #contact link clicks
  const contactLinks = document.querySelectorAll('a[href="#contact"]');
  contactLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });
  
  // Form submission
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      
      // Log form data (in production, you'd send this to a server)
      console.log('Form submitted:', data);
      
      // Show success message
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Sent Successfully!';
      
      // Reset form
      contactForm.reset();
      
      // Restore button after 3 seconds
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        closeModal();
      }, 3000);
    });
  }
});
