// ==============================================================================
// KCB GURUKULAM - CLOUDFLARE PAGES EDGE WORKER (_worker.js)
// 100% Free Serverless Edge Handler for Resend Email OTP Verification
// ==============================================================================

const RESEND_API_KEY = "re_YOUR_RESEND_API_KEY";
const RESEND_FROM_EMAIL = "KCB Gurukulam <onboarding@resend.dev>";
const SECRET_SALT = "kcb_gurukulam_admissions_secret_salt_2026";
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Web Crypto HMAC Generator
async function generateHmac(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    // --------------------------------------------------------------------------
    // 1. ROUTE: SEND OTP (/api/send-otp or /api/send-otp.php)
    // --------------------------------------------------------------------------
    if (url.pathname === "/api/send-otp" || url.pathname === "/api/send-otp.php") {
      if (request.method !== "POST") {
        return jsonResponse({ success: false, message: "POST method required." }, 405);
      }

      try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
          return jsonResponse({ success: false, message: "Please provide a valid email address." }, 400);
        }

        // Generate 6-digit random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + OTP_EXPIRY_MS;

        // Create cryptographic HMAC token
        const hmac = await generateHmac(`${email}:${otp}:${expiry}`, SECRET_SALT);
        const token = `${expiry}.${hmac}`;

        // Branded HTML Email Template
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background-color: #f4f6fb; margin: 0; padding: 24px; color: #161b27; }
  .email-container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #dde2ee; }
  .header-banner { background: #12306b; padding: 28px 24px; text-align: center; color: #ffffff; }
  .school-title { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin: 0; color: #feb62f; }
  .school-sub { font-size: 13px; color: #d6e2ff; margin: 4px 0 0; }
  .content { padding: 32px 28px; text-align: center; }
  .otp-badge { display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #12306b; background: #eef3ff; padding: 14px 28px; border-radius: 12px; border: 2px dashed #1D9BD8; margin: 20px 0; }
  .footer { background: #faf9ff; padding: 18px 24px; font-size: 12px; color: #6e7687; text-align: center; border-top: 1px solid #eef1f8; }
</style>
</head>
<body>
<div class="email-container">
  <div class="header-banner">
    <h1 class="school-title">KCB GURUKULAM</h1>
    <p class="school-sub">Adilabad, Telangana &bull; kcbgurukulam.in</p>
  </div>
  <div class="content">
    <h2 style="font-size: 18px; color: #001b4b; margin-top: 0;">Email Verification Code</h2>
    <p style="font-size: 14px; color: #444650; line-height: 1.6;">
      Thank you for connecting with KCB Gurukulam. Please use the following 6-digit One-Time Password (OTP) to verify your application / enquiry:
    </p>
    <div class="otp-badge">${otp}</div>
    <p style="font-size: 13px; color: #d93025; font-weight: 600; margin: 12px 0 0;">
      Valid for 5 minutes only. Do not share this code with anyone.
    </p>
  </div>
  <div class="footer">
    KCB Gurukulam &bull; Beside KCB Gardens, New Housing Board Road, Adilabad - 504001<br>
    Helpline: +91 8331949000 | +91 8332949000
  </div>
</div>
</body>
</html>`;

        // Send via Resend REST API
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: [email],
            subject: `${otp} is your KCB Gurukulam Verification Code`,
            html: emailHtml,
          }),
        });

        const resendData = await resendRes.json();

        if (resendRes.ok && resendData.id) {
          return jsonResponse({
            success: true,
            token: token,
            message: `Verification code sent to ${email}`,
            expires_in: 300,
          });
        } else {
          return jsonResponse({
            success: false,
            message: resendData.message || "Failed to deliver OTP via Resend.",
          }, resendRes.status || 500);
        }
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Internal server error: " + err.message,
        }, 500);
      }
    }

    // --------------------------------------------------------------------------
    // 2. ROUTE: VERIFY OTP (/api/verify-otp or /api/verify-otp.php)
    // --------------------------------------------------------------------------
    if (url.pathname === "/api/verify-otp" || url.pathname === "/api/verify-otp.php") {
      if (request.method !== "POST") {
        return jsonResponse({ success: false, message: "POST method required." }, 405);
      }

      try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();
        const otp = (body.otp || "").trim();
        const token = (body.token || "").trim();

        if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
          return jsonResponse({ success: false, message: "Please enter a valid 6-digit code." }, 400);
        }

        if (!token || !token.includes(".")) {
          return jsonResponse({ success: false, message: "Invalid session token. Please request a new OTP." }, 400);
        }

        const [expiryStr, originalHash] = token.split(".");
        const expiry = parseInt(expiryStr, 10);

        // Check if expired
        if (Date.now() > expiry) {
          return jsonResponse({ success: false, message: "OTP has expired. Please request a new one." }, 400);
        }

        // Recompute HMAC to verify
        const expectedHash = await generateHmac(`${email}:${otp}:${expiry}`, SECRET_SALT);

        if (expectedHash === originalHash) {
          return jsonResponse({
            success: true,
            verified: true,
            message: "Email verified successfully!",
          });
        } else {
          return jsonResponse({
            success: false,
            verified: false,
            message: "Incorrect verification code. Please check your email.",
          }, 400);
        }
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Verification error: " + err.message,
        }, 500);
      }
    }

    // --------------------------------------------------------------------------
    // 3. DEFAULT: Serve static assets (HTML, CSS, JS, Images)
    // --------------------------------------------------------------------------
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  },
};
