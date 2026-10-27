// ==========================================================================
// KCB GURUKULAM - FLUID MOTION & ANIMATION ENGINE
// ==========================================================================

// Enforce HTTPS
if (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}

(function() {
  'use strict';

  // 1. Check for reduced motion preference
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 2. Header Scroll Effect (Blur & Elevation)
  var header = document.querySelector('.site-header');
  var btt = document.querySelector('.back-to-top-fab');

  function handleScroll() {
    var top = window.pageYOffset || document.documentElement.scrollTop;
    if (header) {
      if (top > 20) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }
    if (btt) {
      if (top > 250) {
        btt.classList.add('btt-visible');
      } else {
        btt.classList.remove('btt-visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 3. Scroll Reveal Engine (IntersectionObserver)
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    // Auto-select elements to animate
    var selectors = [
      '.subpage-hero-content > *',
      '.hero-left-content > *',
      '.content-card',
      '.profile-card',
      '.section-header-centered',
      '.gurukul-card',
      '.wing-card',
      '.feature-card',
      '.photo-placeholder-box',
      '.styled-bullet-item',
      '.gal-scroll figure',
      '.life-slide-card',
      '.hours-table',
      '.quote-card'
    ];

    document.querySelectorAll(selectors.join(',') + ', .reveal-on-scroll').forEach(function(el, idx) {
      el.classList.add('reveal-on-scroll');
      
      // Calculate gentle stagger for adjacent siblings in grids
      var parent = el.parentElement;
      if (parent && (parent.classList.contains('content-grid-2') || 
                     parent.classList.contains('content-grid-3') || 
                     parent.classList.contains('content-grid-4') ||
                     parent.classList.contains('wings-grid') ||
                     parent.classList.contains('features-grid') ||
                     parent.classList.contains('gal-scroll'))) {
        var sibIdx = Array.prototype.indexOf.call(parent.children, el);
        el.style.transitionDelay = (sibIdx * 0.08) + 's';
      }

      revealObserver.observe(el);
    });
  } else {
    // If reduced motion or no IntersectionObserver, reveal everything immediately
    document.querySelectorAll('.reveal-on-scroll').forEach(function(el) {
      el.classList.add('is-revealed');
    });
  }

  // 4. Smooth Anchor Scrolling & Navigation Engine
  function smoothScrollToTarget(targetEl) {
    if (!targetEl) return;
    var headerEl = document.querySelector('.site-header');
    var offset = headerEl ? (headerEl.offsetHeight + 15) : 85;
    var topPos = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: Math.max(0, topPos),
      behavior: 'smooth'
    });
  }

  document.querySelectorAll('a[href*="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (!href) return;
      var hashIdx = href.indexOf('#');
      if (hashIdx === -1) return;

      var hash = href.slice(hashIdx);
      var path = href.slice(0, hashIdx);

      if (hash === '#' || hash === '#top') {
        if (hash === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      var currentPath = window.location.pathname.split('/').pop() || 'index.html';
      var cleanPath = path.replace(/^\//, '');
      var isSamePage = !cleanPath || cleanPath === currentPath || (currentPath === '' && cleanPath === 'index.html');

      if (isSamePage) {
        var target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          smoothScrollToTarget(target);

          // Close mobile drawer if open
          var drawer = document.getElementById('mobileDrawer');
          if (drawer && drawer.classList.contains('open')) {
            drawer.classList.remove('open');
          }

          if (hash === '#admissions-enquiry') {
            setTimeout(function() {
              var input = document.getElementById('student_name') || target.querySelector('input');
              if (input) input.focus();
            }, 450);
          }
        }
      }
    });
  });

  // Handle direct hash navigation on page load
  if (window.location.hash) {
    setTimeout(function() {
      var target = document.querySelector(window.location.hash);
      if (target) {
        smoothScrollToTarget(target);
        if (window.location.hash === '#admissions-enquiry') {
          var input = document.getElementById('student_name') || target.querySelector('input');
          if (input) input.focus();
        }
      }
    }, 300);
  }

  // 5. Button Ripple / Click Micro-Feedback
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-submit-form, .btn-apply-header, .mobile-menu-toggle').forEach(function(btn) {
    btn.addEventListener('mousedown', function() {
      this.style.transform = 'scale(0.97)';
    });
    btn.addEventListener('mouseup', function() {
      this.style.transform = '';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // 6. Web3Forms Smart Client-Side Submission (With 1-Minute Anti-Spam Cooldown)
  document.querySelectorAll('form[action="https://api.web3forms.com/submit"]').forEach(function(form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    var formId = form.id || ('form_' + Math.random().toString(36).substr(2, 6));
    var cooldownStorageKey = 'kcb_form_cooldown_' + formId;
    var COOLDOWN_MS = 60 * 1000; // 1-minute anti-spam cooldown

    var resultBox = document.createElement('div');
    resultBox.className = 'form-result-box';
    resultBox.style.display = 'none';
    resultBox.style.padding = '0.9rem 1.25rem';
    resultBox.style.borderRadius = '0.75rem';
    resultBox.style.fontSize = '0.925rem';
    resultBox.style.fontWeight = '600';
    resultBox.style.marginTop = '0.75rem';
    resultBox.style.textAlign = 'center';
    resultBox.style.transition = 'all 0.3s ease';
    form.appendChild(resultBox);

    var isSubmitting = false;
    var cooldownInterval = null;

    function startCooldownTimer(secondsLeft) {
      if (cooldownInterval) clearInterval(cooldownInterval);
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.75';
        submitBtn.style.cursor = 'not-allowed';
      }

      function tick() {
        if (secondsLeft <= 0) {
          clearInterval(cooldownInterval);
          cooldownInterval = null;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.innerHTML = originalBtnHtml;
          }
          if (resultBox && resultBox.textContent.indexOf('Please wait') !== -1) {
            resultBox.style.display = 'none';
          }
        } else {
          if (submitBtn) {
            submitBtn.innerHTML = '<span>Please wait (' + secondsLeft + 's)...</span><span class="material-symbols-outlined" style="font-size:18px;">hourglass_bottom</span>';
          }
          secondsLeft--;
        }
      }

      tick();
      cooldownInterval = setInterval(tick, 1000);
    }

    // Check if in active cooldown from previous submission
    try {
      var lastSubmit = parseInt(localStorage.getItem(cooldownStorageKey) || '0', 10);
      var elapsed = Date.now() - lastSubmit;
      if (elapsed < COOLDOWN_MS) {
        startCooldownTimer(Math.ceil((COOLDOWN_MS - elapsed) / 1000));
      }
    } catch (e) {}

    form.addEventListener('submit', function(e) {
      // 1-minute anti-spam verification
      try {
        var last = parseInt(localStorage.getItem(cooldownStorageKey) || '0', 10);
        var diff = Date.now() - last;
        if (diff < COOLDOWN_MS) {
          e.preventDefault();
          var remaining = Math.ceil((COOLDOWN_MS - diff) / 1000);
          resultBox.style.display = 'block';
          resultBox.style.background = '#fff8e6';
          resultBox.style.color = '#7f5700';
          resultBox.style.border = '1px solid #feb62f';
          resultBox.textContent = '⏱ Please wait ' + remaining + ' seconds before submitting another enquiry.';
          startCooldownTimer(remaining);
          return;
        }
      } catch (err) {}

      if (isSubmitting) return;
      e.preventDefault();
      isSubmitting = true;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.75';
        submitBtn.innerHTML = '<span>Submitting...</span><span class="material-symbols-outlined" style="animation: spin 1s linear infinite; font-size:20px;">sync</span>';
      }

      resultBox.style.display = 'block';
      resultBox.style.background = '#eef3ff';
      resultBox.style.color = '#12306b';
      resultBox.style.border = '1px solid #1D9BD8';
      resultBox.textContent = 'Sending your request, please wait...';

      var formData = new FormData(form);
      var object = Object.fromEntries(formData);
      
      for (var key in object) {
        if (typeof object[key] === 'string') {
          object[key] = object[key].trim().slice(0, 1500);
        }
      }
      var json = JSON.stringify(object);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.success) {
          try {
            localStorage.setItem(cooldownStorageKey, Date.now().toString());
          } catch (e) {}

          resultBox.style.background = '#e6f8ed';
          resultBox.style.color = '#0e7039';
          resultBox.style.border = '1px solid #34c759';
          resultBox.textContent = '✓ Thank you! Your enquiry has been received. Our team will contact you shortly.';
          form.reset();
          startCooldownTimer(60);

          var redirectUrl = form.querySelector('input[name="redirect"]');
          if (redirectUrl && redirectUrl.value) {
            setTimeout(function() {
              window.location.href = redirectUrl.value;
            }, 800);
          }
        } else {
          resultBox.style.background = '#fdebee';
          resultBox.style.color = '#c5221f';
          resultBox.style.border = '1px solid #ea4335';
          
          var msg = data.message || 'Something went wrong. Please call us directly.';
          if (msg.toLowerCase().indexOf('captcha') !== -1) {
            resultBox.innerHTML = '⚠️ <strong>Verification required:</strong> Please tick the "I am not a robot" box above and click submit, or <a href="https://wa.me/918332949000?text=' + encodeURIComponent('Hello KCB Gurukulam, I would like to submit my enquiry directly.') + '" target="_blank" rel="noopener noreferrer" style="color:#001b4b; text-decoration:underline; font-weight:700;">Submit via WhatsApp &rarr;</a>';
          } else {
            resultBox.innerHTML = msg + ' &mdash; <a href="https://wa.me/918332949000?text=' + encodeURIComponent('Hello KCB Gurukulam, I would like to submit my enquiry directly.') + '" target="_blank" rel="noopener noreferrer" style="color:#001b4b; text-decoration:underline; font-weight:700;">Chat on WhatsApp &rarr;</a>';
          }

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = originalBtnHtml;
          }
        }
      })
      .catch(function(error) {
        resultBox.style.background = '#fdebee';
        resultBox.style.color = '#c5221f';
        resultBox.style.border = '1px solid #ea4335';
        resultBox.innerHTML = 'Unable to send online right now. <a href="https://wa.me/918332949000?text=' + encodeURIComponent('Hello KCB Gurukulam, I would like to submit my enquiry.') + '" target="_blank" rel="noopener noreferrer" style="color:#001b4b; text-decoration:underline; font-weight:700;">Click to Send via WhatsApp &rarr;</a> or Call +91 8331949000.';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerHTML = originalBtnHtml;
        }
      })
      .finally(function() {
        isSubmitting = false;
      });
    });
  });

  // 7. Dynamic WhatsApp Prefill Sync
  (function initWhatsAppSync() {
    var form = document.getElementById('admissionsEnquiryForm') || document.getElementById('admissions-enquiry');
    var waBtn = document.getElementById('btnWhatsAppDirect');
    if (!form || !waBtn) return;
    function sync() {
      var sName = (document.getElementById('student_name') || {}).value || '';
      var grade = (document.getElementById('grade') || {}).value || '';
      var text = 'Hello KCB Gurukulam, I would like to enquire about Admissions 2027-28.';
      if (sName) text += ' Student: ' + sName.trim() + '.';
      if (grade) text += ' Grade: ' + grade + '.';
      waBtn.href = 'https://wa.me/918332949000?text=' + encodeURIComponent(text);
    }
    form.addEventListener('input', sync);
    form.addEventListener('change', sync);
  })();

  // 9. Interactive Campus Map Switcher (Google Maps / OpenStreetMap)
  window.switchCampusMap = function(provider) {
    var gmap = document.getElementById('map-gmap');
    var osm = document.getElementById('map-osm');
    var btnGmap = document.getElementById('btn-map-gmap');
    var btnOsm = document.getElementById('btn-map-osm');
    if (!gmap || !osm) return;

    if (provider === 'osm') {
      gmap.style.display = 'none';
      osm.style.display = 'block';
      if (btnOsm) { btnOsm.style.background = '#0284c7'; btnOsm.style.color = '#ffffff'; }
      if (btnGmap) { btnGmap.style.background = 'transparent'; btnGmap.style.color = '#0284c7'; }
    } else {
      osm.style.display = 'none';
      gmap.style.display = 'block';
      if (btnGmap) { btnGmap.style.background = '#0284c7'; btnGmap.style.color = '#ffffff'; }
      if (btnOsm) { btnOsm.style.background = 'transparent'; btnOsm.style.color = '#0284c7'; }
    }
  };

})();
