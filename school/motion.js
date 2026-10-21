// ==========================================================================
// KCB GURUKULAM - FLUID MOTION & ANIMATION ENGINE
// ==========================================================================

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

  // 4. Smooth Anchor Scrolling with Easing
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#' || href === '#top') {
        if (href === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 5. Button Ripple / Click Micro-Feedback
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-submit-form, .btn-apply-header').forEach(function(btn) {
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

  // 6. Web3Forms Smart Client-Side Submission (Generic Forms)
  document.querySelectorAll('form[action="https://api.web3forms.com/submit"]').forEach(function(form) {
    if (form.id === 'admissions-enquiry' || form.id === 'careerContactForm') {
      return; // Handled by specialized OTP verification engines
    }
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    
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

    form.addEventListener('submit', function(e) {
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
      
      // Cyber Defense: Sanitize, trim and limit string lengths to stop payload abuse
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
      .then(function(res) {
        if (res.success) {
          resultBox.style.background = '#e6f8ed';
          resultBox.style.color = '#0e7039';
          resultBox.style.border = '1px solid #34c759';
          form.reset();
          setTimeout(function() {
            window.location.href = 'thankyou.html';
          }, 1200);
        } else {
          resultBox.style.background = '#fdebee';
          resultBox.style.color = '#c5221f';
          resultBox.style.border = '1px solid #ea4335';
          resultBox.textContent = '⚠ ' + (res.message || 'Submission error. Please call +91 8331949000.');
        }
      })
      .catch(function(err) {
        console.warn('AJAX submission error, using native form submit:', err);
        // Fallback: If network/CORS blocks fetch, submit natively so lead is NEVER lost
        form.removeEventListener('submit', arguments.callee);
        form.submit();
      })
      .finally(function() {
        // Cooldown: Keep button disabled for 3 seconds to prevent double/spam submissions
        setTimeout(function() {
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = originalBtnHtml;
          }
        }, 3000);
      });
    });
  });

  // 7. Admission Enquiry Form: Send Enquiry -> SMS OTP Verification -> Auto Submit
  (function initEnquirySmsOtpFlow() {
    var form = document.getElementById('admissions-enquiry') || document.querySelector('.enquiry-form-card form');
    var mobileInput = document.getElementById('mobile');
    var studentNameInput = document.getElementById('student_name');
    var parentNameInput = document.getElementById('parent_name');
    var gradeSelect = document.getElementById('grade');
    var submitBtn = document.getElementById('btnEnquirySubmit');
    var submitText = document.getElementById('btnSubmitText');
    var submitIcon = document.getElementById('btnSubmitIcon');
    var smsOtpBox = document.getElementById('otpInputContainer') || document.getElementById('smsOtpBox');
    var smsOtpInput = document.getElementById('smsOtp') || document.getElementById('smsOtpInput');
    var verifySmsBtn = document.getElementById('btnVerifySmsOtp');
    var resendSmsBtn = document.getElementById('btnResendSmsOtp');
    var sentMobileNumber = document.getElementById('sentMobileNumber');
    var statusNotice = document.getElementById('otpVerificationStatus') || document.getElementById('smsStatusNotice');
    var timerCountdown = document.getElementById('otpCountdown');
    var timerVal = document.getElementById('timerVal');
    var waBtn = document.getElementById('btnWhatsAppDirect');

    if (!form || !mobileInput || !submitBtn) return;

    var isVerified = false;
    var isSendingOtp = false;
    var timerInterval = null;
    var auth = null;
    window.confirmationResult = null;

    if (window.firebase && window.firebaseConfig) {
      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(window.firebaseConfig);
        }
        auth = firebase.auth();
      } catch (e) {
        console.warn('Firebase init error:', e);
      }
    }

    function setNotice(msg, type) {
      if (!statusNotice) return;
      statusNotice.style.display = 'block';
      if (type === 'error') {
        statusNotice.style.background = '#fdebee';
        statusNotice.style.color = '#c5221f';
        statusNotice.style.border = '1px solid #ea4335';
        statusNotice.style.padding = '0.5rem 0.75rem';
        statusNotice.style.borderRadius = '0.35rem';
        statusNotice.style.marginTop = '0.5rem';
        statusNotice.innerHTML = '⚠ ' + msg;
      } else if (type === 'success') {
        statusNotice.style.background = '#e6f8ed';
        statusNotice.style.color = '#0e7039';
        statusNotice.style.border = '1px solid #34c759';
        statusNotice.style.padding = '0.5rem 0.75rem';
        statusNotice.style.borderRadius = '0.35rem';
        statusNotice.style.marginTop = '0.5rem';
        statusNotice.innerHTML = '✓ ' + msg;
      } else {
        statusNotice.style.background = '#eef3ff';
        statusNotice.style.color = '#12306b';
        statusNotice.style.border = '1px solid #1D9BD8';
        statusNotice.style.padding = '0.5rem 0.75rem';
        statusNotice.style.borderRadius = '0.35rem';
        statusNotice.style.marginTop = '0.5rem';
        statusNotice.innerHTML = msg;
      }
    }

    function getRecaptchaVerifier() {
      var containerId = document.getElementById('otpRecaptcha') ? 'otpRecaptcha' : 'recaptcha-container';
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerId, {
          'size': 'invisible',
          'callback': function(response) {
            // reCAPTCHA solved
          },
          'expired-callback': function() {
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        });
      }
      return window.recaptchaVerifier;
    }

    function startCooldown(seconds) {
      clearInterval(timerInterval);
      var timeLeft = seconds;
      if (resendSmsBtn) resendSmsBtn.style.display = 'none';
      if (timerCountdown) timerCountdown.style.display = 'inline';

      timerInterval = setInterval(function() {
        timeLeft--;
        if (timerVal) timerVal.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          if (resendSmsBtn && !isVerified) resendSmsBtn.style.display = 'inline-block';
          if (timerCountdown) timerCountdown.style.display = 'none';
        }
      }, 1000);
    }

    function validateFields() {
      if (studentNameInput && !studentNameInput.value.trim()) {
        alert('Please enter Student Name.');
        studentNameInput.focus();
        return false;
      }
      if (parentNameInput && !parentNameInput.value.trim()) {
        alert('Please enter Parent / Guardian Name.');
        parentNameInput.focus();
        return false;
      }
      var mob = mobileInput.value.replace(/[^0-9]/g, '');
      if (mob.length !== 10 || !/^[6-9]\d{9}$/.test(mob)) {
        alert('Please enter a valid 10-digit Indian mobile number.');
        mobileInput.focus();
        return false;
      }
      if (gradeSelect && !gradeSelect.value) {
        alert('Please select Seeking Admission For class/grade.');
        gradeSelect.focus();
        return false;
      }
      return true;
    }

    function sendSmsOtp() {
      if (!validateFields()) return;
      var mobile = mobileInput.value.replace(/[^0-9]/g, '');

      isSendingOtp = true;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.75';
      if (submitText) submitText.textContent = 'Sending SMS OTP...';
      if (submitIcon) submitIcon.textContent = 'hourglass_top';

      setNotice('Sending 6-digit SMS verification code to +91 ' + mobile + '...', 'info');

      if (sentMobileNumber) sentMobileNumber.textContent = '+91 ' + mobile;
      if (smsOtpBox) {
        smsOtpBox.style.display = 'block';
        smsOtpBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (smsOtpInput) {
        smsOtpInput.value = '';
        smsOtpInput.focus();
      }

      startCooldown(30);

      if (window.firebase && auth) {
        try {
          var verifier = getRecaptchaVerifier();
          var fullNumber = '+91' + mobile;

          auth.signInWithPhoneNumber(fullNumber, verifier)
            .then(function(confirmationResult) {
              window.confirmationResult = confirmationResult;
              isSendingOtp = false;
              submitBtn.disabled = false;
              submitBtn.style.opacity = '1';
              if (submitText) submitText.textContent = 'Enter SMS OTP Below';
              if (submitIcon) submitIcon.textContent = 'sms';
              setNotice('✓ 6-Digit SMS OTP sent to +91 ' + mobile + '! Please enter the code below to complete your enquiry.', 'success');
            })
            .catch(function(error) {
              console.warn('Firebase SMS error:', error);
              isSendingOtp = false;
              submitBtn.disabled = false;
              submitBtn.style.opacity = '1';
              if (submitText) submitText.textContent = 'Send Enquiry';
              if (submitIcon) submitIcon.textContent = 'send';

              var errMessage = 'Unable to deliver SMS OTP to +91 ' + mobile + '. Please check the number or use 1-Click WhatsApp Enquiry.';
              if (error && error.code === 'auth/invalid-phone-number') {
                errMessage = 'Invalid mobile number format. Please check the 10-digit number.';
              } else if (error && error.code === 'auth/too-many-requests') {
                errMessage = 'SMS attempt limit reached for this number. Please try again later or use 1-Click WhatsApp.';
              }
              setNotice(errMessage, 'error');
              if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
              }
            });
        } catch (err) {
          console.warn('Firebase signInWithPhoneNumber error:', err);
          isSendingOtp = false;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          if (submitText) submitText.textContent = 'Send Enquiry';
          if (submitIcon) submitIcon.textContent = 'send';
          setNotice('SMS service unavailable. Please contact us via 1-Click WhatsApp Enquiry below.', 'error');
        }
      } else {
        isSendingOtp = false;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        if (submitText) submitText.textContent = 'Send Enquiry';
        if (submitIcon) submitIcon.textContent = 'send';
        setNotice('SMS service initializing. Please verify mobile number or use 1-Click WhatsApp.', 'error');
      }
    }

    // Main Button Click: "Send Enquiry"
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (isVerified) {
        submitForm();
        return;
      }
      if (!window.confirmationResult) {
        sendSmsOtp();
      } else {
        if (smsOtpInput && smsOtpInput.value.length === 6) {
          verifyOtpAndSubmit();
        } else {
          if (smsOtpBox) smsOtpBox.style.display = 'block';
          if (smsOtpInput) smsOtpInput.focus();
          setNotice('Please enter the 6-digit SMS code received on your phone.', 'info');
        }
      }
    });

    if (resendSmsBtn) {
      resendSmsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sendSmsOtp();
      });
    }

    function verifyOtpAndSubmit() {
      var code = smsOtpInput ? smsOtpInput.value.trim() : '';

      if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
        setNotice('Please enter the complete 6-digit SMS verification code.', 'error');
        if (smsOtpInput) smsOtpInput.focus();
        return;
      }

      if (!window.confirmationResult) {
        setNotice('Please click "Send Enquiry" first to receive your SMS code.', 'error');
        return;
      }

      if (verifySmsBtn) {
        verifySmsBtn.disabled = true;
        verifySmsBtn.innerHTML = '<span>Verifying...</span>';
      }

      window.confirmationResult.confirm(code)
        .then(function(result) {
          isVerified = true;
          clearInterval(timerInterval);

          setNotice('✓ Mobile verified successfully via SMS! Submitting your enquiry...', 'success');

          if (verifySmsBtn) {
            verifySmsBtn.disabled = true;
            verifySmsBtn.style.background = '#34c759';
            verifySmsBtn.innerHTML = '<span>Verified ✓</span>';
          }
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.9';
            if (submitText) submitText.textContent = 'Enquiry Confirmed! Redirecting...';
            if (submitIcon) submitIcon.textContent = 'check_circle';
          }

          // Submit the form
          setTimeout(function() {
            submitForm();
          }, 600);
        })
        .catch(function(smsErr) {
          console.warn('SMS verify error:', smsErr);
          setNotice('Incorrect 6-digit SMS OTP code. Please check your phone SMS and try again.', 'error');
          if (verifySmsBtn) {
            verifySmsBtn.disabled = false;
            verifySmsBtn.innerHTML = '<span>Confirm &amp; Submit</span><span class="material-symbols-outlined" style="font-size: 18px;">verified</span>';
          }
        });
    }

    function submitForm() {
      if (form) {
        form.submit();
      }
    }

    if (verifySmsBtn) {
      verifySmsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        verifyOtpAndSubmit();
      });
    }

    if (smsOtpInput) {
      smsOtpInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length === 6 && !isVerified) {
          verifyOtpAndSubmit();
        }
      });
    }

    // Dynamic 1-Click WhatsApp Enquiry Link
    if (waBtn) {
      function syncWhatsAppLink() {
        var sName = studentNameInput ? studentNameInput.value.trim() : '';
        var pName = parentNameInput ? parentNameInput.value.trim() : '';
        var grade = gradeSelect ? gradeSelect.value : '';
        var mob = mobileInput ? mobileInput.value.trim() : '';
        var text = 'Namaste KCB Gurukulam! I would like to enquire about Admissions 2026-27.';
        if (sName) text += ' Student: ' + sName + '.';
        if (grade) text += ' Grade: ' + grade + '.';
        if (pName) text += ' Parent: ' + pName + '.';
        if (mob) text += ' Phone: +91 ' + mob + '.';
        waBtn.href = 'https://wa.me/918332949000?text=' + encodeURIComponent(text);
      }
      form.addEventListener('input', syncWhatsAppLink);
      form.addEventListener('change', syncWhatsAppLink);
    }
  })();

  // 8. Career / Direct Contact Form: Email OTP Verification Engine
  (function initCareerEmailOtpFlow() {
    var form = document.getElementById('careerContactForm');
    var nameInput = document.getElementById('career_name');
    var phoneInput = document.getElementById('career_phone');
    var emailInput = document.getElementById('career_email');
    var typeSelect = document.getElementById('career_type');
    var messageInput = document.getElementById('career_message');
    var submitBtn = document.getElementById('btnCareerSubmit');
    var submitText = document.getElementById('btnCareerSubmitText');
    var submitIcon = document.getElementById('btnCareerSubmitIcon');
    var otpContainer = document.getElementById('careerOtpContainer');
    var otpInput = document.getElementById('careerOtpInput');
    var verifyBtn = document.getElementById('btnVerifyCareerOtp');
    var resendBtn = document.getElementById('btnResendCareerOtp');
    var sentEmailSpan = document.getElementById('sentCareerEmail');
    var statusNotice = document.getElementById('careerOtpStatus');
    var timerCountdown = document.getElementById('careerOtpCountdown');
    var timerVal = document.getElementById('careerTimerVal');

    if (!form || !emailInput || !submitBtn) return;

    var isVerified = false;
    var isSendingOtp = false;
    var timerInterval = null;
    var currentToken = '';

    function setNotice(msg, type) {
      if (!statusNotice) return;
      statusNotice.style.display = 'block';
      if (type === 'error') {
        statusNotice.style.background = '#fdebee';
        statusNotice.style.color = '#c5221f';
        statusNotice.style.border = '1px solid #ea4335';
        statusNotice.style.padding = '0.5rem 0.75rem';
        statusNotice.style.borderRadius = '0.35rem';
        statusNotice.style.marginTop = '0.5rem';
        statusNotice.innerHTML = '⚠ ' + msg;
      } else if (type === 'success') {
        statusNotice.style.background = '#e6f8ed';
        statusNotice.style.color = '#0e7039';
        statusNotice.style.border = '1px solid #34c759';
        statusNotice.style.padding = '0.5rem 0.75rem';
        statusNotice.style.borderRadius = '0.35rem';
        statusNotice.style.marginTop = '0.5rem';
        statusNotice.innerHTML = '✓ ' + msg;
      } else {
        statusNotice.style.background = '#eef3ff';
        statusNotice.style.color = '#12306b';
        statusNotice.style.border = '1px solid #1D9BD8';
        statusNotice.style.padding = '0.5rem 0.75rem';
        statusNotice.style.borderRadius = '0.35rem';
        statusNotice.style.marginTop = '0.5rem';
        statusNotice.innerHTML = msg;
      }
    }

    function startCooldown(seconds) {
      clearInterval(timerInterval);
      var timeLeft = seconds;
      if (resendBtn) resendBtn.style.display = 'none';
      if (timerCountdown) timerCountdown.style.display = 'inline';

      timerInterval = setInterval(function() {
        timeLeft--;
        if (timerVal) timerVal.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          if (resendBtn && !isVerified) resendBtn.style.display = 'inline-block';
          if (timerCountdown) timerCountdown.style.display = 'none';
        }
      }, 1000);
    }

    function validateFields() {
      if (nameInput && !nameInput.value.trim()) {
        alert('Please enter your full name.');
        nameInput.focus();
        return false;
      }
      var ph = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : '';
      if (phoneInput && (ph.length !== 10 || !/^[6-9]\d{9}$/.test(ph))) {
        alert('Please enter a valid 10-digit mobile number.');
        phoneInput.focus();
        return false;
      }
      var em = emailInput.value.trim();
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!em || !emailRegex.test(em)) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return false;
      }
      if (typeSelect && !typeSelect.value) {
        alert('Please select enquiry type.');
        typeSelect.focus();
        return false;
      }
      if (messageInput && !messageInput.value.trim()) {
        alert('Please enter your message or qualifications.');
        messageInput.focus();
        return false;
      }
      return true;
    }

    // Helper to send request with fallback to PHP endpoint
    function callApi(endpoint, fallbackEndpoint, payload) {
      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(res) {
        if (!res.ok && res.status === 404 && fallbackEndpoint) {
          return fetch(fallbackEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(function(r) { return r.json(); });
        }
        return res.json();
      });
    }

    function sendEmailOtp() {
      if (!validateFields()) return;
      var email = emailInput.value.trim().toLowerCase();

      isSendingOtp = true;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.75';
      if (submitText) submitText.textContent = 'Sending Verification OTP...';
      if (submitIcon) submitIcon.textContent = 'hourglass_top';

      setNotice('Sending 6-digit verification code to ' + email + '...', 'info');
      if (sentEmailSpan) sentEmailSpan.textContent = email;
      if (otpContainer) {
        otpContainer.style.display = 'block';
        otpContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (otpInput) {
        otpInput.value = '';
        otpInput.focus();
      }

      startCooldown(30);

      callApi('/api/send-otp', 'api/send-otp.php', { email: email })
        .then(function(data) {
          isSendingOtp = false;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          if (submitText) submitText.textContent = 'Resend Verification OTP';
          if (submitIcon) submitIcon.textContent = 'refresh';

          if (data && data.success) {
            currentToken = data.token || '';
            setNotice('Verification code sent to <strong>' + email + '</strong>! Please check your inbox or spam folder.', 'info');
          } else {
            setNotice(data && data.message ? data.message : 'Unable to send OTP. Please check your email and try again.', 'error');
          }
        })
        .catch(function(err) {
          console.warn('Send OTP network error:', err);
          isSendingOtp = false;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          if (submitText) submitText.textContent = 'Resend Verification OTP';
          setNotice('Could not connect to verification server. Please verify your internet connection or contact us directly.', 'error');
        });
    }

    function verifyEmailOtp() {
      var otp = (otpInput.value || '').trim();
      var email = emailInput.value.trim().toLowerCase();

      if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        setNotice('Please enter the 6-digit numeric verification code received on your email.', 'error');
        if (otpInput) otpInput.focus();
        return;
      }

      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.style.opacity = '0.75';
        verifyBtn.innerHTML = 'Verifying...';
      }

      callApi('/api/verify-otp', 'api/verify-otp.php', {
        email: email,
        otp: otp,
        token: currentToken
      })
      .then(function(data) {
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.style.opacity = '1';
          verifyBtn.innerHTML = '<span>Confirm &amp; Submit</span><span class="material-symbols-outlined" style="font-size:18px;">verified</span>';
        }

        if (data && (data.verified || data.success)) {
          isVerified = true;
          clearInterval(timerInterval);
          setNotice('Email verified successfully! Submitting your application now...', 'success');
          
          var verInput = document.getElementById('career_email_verified');
          if (verInput) verInput.value = 'true';

          setTimeout(function() {
            form.submit();
          }, 800);
        } else {
          setNotice(data && data.message ? data.message : 'Invalid OTP. Please check your email or request a new code.', 'error');
          if (otpInput) {
            otpInput.value = '';
            otpInput.focus();
          }
        }
      })
      .catch(function(err) {
        console.warn('Verify OTP error:', err);
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.style.opacity = '1';
          verifyBtn.innerHTML = '<span>Confirm &amp; Submit</span><span class="material-symbols-outlined" style="font-size:18px;">verified</span>';
        }
        setNotice('Network error while verifying OTP. Please try again.', 'error');
      });
    }

    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!isVerified) {
        sendEmailOtp();
      } else {
        form.submit();
      }
    });

    if (verifyBtn) {
      verifyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        verifyEmailOtp();
      });
    }

    if (resendBtn) {
      resendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sendEmailOtp();
      });
    }

    if (otpInput) {
      otpInput.addEventListener('input', function() {
        var clean = this.value.replace(/[^0-9]/g, '');
        if (this.value !== clean) this.value = clean;
        if (this.value.length === 6) {
          verifyEmailOtp();
        }
      });
    }
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
      if (btnOsm) { btnOsm.style.background = '#12306b'; btnOsm.style.color = '#ffffff'; }
      if (btnGmap) { btnGmap.style.background = 'transparent'; btnGmap.style.color = '#12306b'; }
    } else {
      osm.style.display = 'none';
      gmap.style.display = 'block';
      if (btnGmap) { btnGmap.style.background = '#12306b'; btnGmap.style.color = '#ffffff'; }
      if (btnOsm) { btnOsm.style.background = 'transparent'; btnOsm.style.color = '#12306b'; }
    }
  };

})();
