<?php
// ==============================================================================
// KCB GURUKULAM - RESEND EMAIL OTP CONFIGURATION
// ==============================================================================

// 1. Enter your Resend API Key here (from https://resend.com/api-keys)
define('RESEND_API_KEY', 're_YOUR_RESEND_API_KEY');

// 2. Sender Email
// - After verifying kcbgurukulam.in on Resend: 'KCB Gurukulam <admissions@kcbgurukulam.in>'
// - Default onboarding address (works instantly): 'KCB Gurukulam <onboarding@resend.dev>'
define('RESEND_FROM_EMAIL', 'KCB Gurukulam <onboarding@resend.dev>');

// 3. OTP Expiry Time (in seconds - 300s = 5 minutes)
define('OTP_EXPIRY_SECONDS', 300);

// 4. Rate Limiting: Minimum seconds between consecutive OTP requests
define('OTP_COOLDOWN_SECONDS', 15);

// 5. Max Failed Verification Attempts
define('MAX_OTP_ATTEMPTS', 5);
