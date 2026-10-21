<?php
// ==============================================================================
// KCB GURUKULAM - SEND OTP VIA RESEND API
// ==============================================================================

header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. POST required.']);
    exit;
}

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';

// Validate email format
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

// Check cooldown rate limit to prevent spam
$now = time();
if (isset($_SESSION['otp_last_sent']) && ($now - $_SESSION['otp_last_sent']) < OTP_COOLDOWN_SECONDS) {
    $remaining = OTP_COOLDOWN_SECONDS - ($now - $_SESSION['otp_last_sent']);
    http_response_code(429);
    echo json_encode([
        'success' => false, 
        'message' => "Please wait {$remaining} seconds before requesting a new OTP."
    ]);
    exit;
}

// Generate 6-digit cryptographically secure OTP
$otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

// Save in session
$_SESSION['otp_code'] = $otp;
$_SESSION['otp_email'] = strtolower($email);
$_SESSION['otp_expires'] = $now + OTP_EXPIRY_SECONDS;
$_SESSION['otp_attempts'] = 0;
$_SESSION['otp_last_sent'] = $now;
$_SESSION['otp_verified'] = false;

// Prepare Email HTML template
$emailHtml = '
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
    <div class="otp-badge">' . $otp . '</div>
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
</html>';

// Call Resend REST API via cURL
$resendPayload = [
    'from'    => RESEND_FROM_EMAIL,
    'to'      => [$email],
    'subject' => "{$otp} is your KCB Gurukulam Verification Code",
    'html'    => $emailHtml
];

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($resendPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . RESEND_API_KEY,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to connect to email provider: ' . $curlError
    ]);
    exit;
}

$responseData = json_decode($response, true);

$expiryTimestamp = $now + OTP_EXPIRY_SECONDS;
$token = $expiryTimestamp . '.' . hash_hmac('sha256', strtolower($email) . ':' . $otp . ':' . $expiryTimestamp, 'kcb_gurukulam_admissions_secret_salt_2026');

if ($httpCode >= 200 && $httpCode < 300 && isset($responseData['id'])) {
    echo json_encode([
        'success' => true,
        'token' => $token,
        'message' => 'Verification code sent successfully to ' . htmlspecialchars($email),
        'expires_in' => OTP_EXPIRY_SECONDS
    ]);
} else {
    http_response_code($httpCode >= 400 ? $httpCode : 500);
    $errorMsg = isset($responseData['message']) ? $responseData['message'] : 'Could not deliver OTP. Check Resend API configuration.';
    echo json_encode([
        'success' => false,
        'message' => $errorMsg,
        'debug'   => (RESEND_API_KEY === 're_YOUR_RESEND_API_KEY_HERE') ? 'Please insert your real Resend API Key in api/config.php' : null
    ]);
}
