// Cloudflare Pages Function: /api/verify-otp
const SECRET_SALT = "kcb_gurukulam_admissions_secret_salt_2026";

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

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const otp = (body.otp || "").trim();
    const token = (body.token || "").trim();

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return new Response(JSON.stringify({ success: false, message: "Please enter a valid 6-digit code." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!token || !token.includes(".")) {
      return new Response(JSON.stringify({ success: false, message: "Invalid session token. Please request a new OTP." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const [expiryStr, originalHash] = token.split(".");
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) {
      return new Response(JSON.stringify({ success: false, message: "OTP has expired. Please request a new one." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const expectedHash = await generateHmac(`${email}:${otp}:${expiry}`, SECRET_SALT);

    if (expectedHash === originalHash) {
      return new Response(JSON.stringify({
        success: true,
        verified: true,
        message: "Email verified successfully!"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        message: "Incorrect verification code. Please check your email."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
