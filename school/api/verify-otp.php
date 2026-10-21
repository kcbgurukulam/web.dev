<?php
// ==============================================================================
// KCB GURUKULAM - VERIFY OTP
// ==============================================================================

header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. POST required.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$otp = isset($input['otp']) ? trim($input['otp']) : '';
$email = isset($input['email']) ? strtolower(trim($input['email'])) : '';

if (empty($otp) || strlen($otp) !== 6 || !ctype_digit($otp)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid 6-digit OTP code.']);
    exit;
}

$token = isset($input['token']) ? trim($input['token']) : '';
if (!empty($token) && strpos($token, '.') !== false) {
    list($expiryStr, $originalHash) = explode('.', $token, 2);
    $expiry = (int)$expiryStr;
    if (time() > $expiry) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'OTP has expired. Please request a new one.']);
        exit;
    }
    $expectedHash = hash_hmac('sha256', $email . ':' . $otp . ':' . $expiry, 'kcb_gurukulam_admissions_secret_salt_2026');
    if (hash_equals($expectedHash, $originalHash)) {
        echo json_encode([
            'success' => true,
            'verified' => true,
            'message' => 'Email verified successfully!'
        ]);
        exit;
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'verified' => false,
            'message' => 'Incorrect verification code. Please check your email.'
        ]);
        exit;
    }
}

// Check if OTP was ever requested in this session
if (!isset($_SESSION['otp_code']) || !isset($_SESSION['otp_expires'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No OTP found. Please click Send OTP first.']);
    exit;
}

// Check email match
if (isset($_SESSION['otp_email']) && $_SESSION['otp_email'] !== $email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email address does not match the one OTP was sent to.']);
    exit;
}

// Check expiry
if (time() > $_SESSION['otp_expires']) {
    unset($_SESSION['otp_code']);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'OTP has expired. Please request a new one.']);
    exit;
}

// Brute-force protection
$_SESSION['otp_attempts'] = isset($_SESSION['otp_attempts']) ? $_SESSION['otp_attempts'] + 1 : 1;
if ($_SESSION['otp_attempts'] > MAX_OTP_ATTEMPTS) {
    unset($_SESSION['otp_code']);
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many failed attempts. Please request a new OTP.']);
    exit;
}

// Compare codes
if (hash_equals((string)$_SESSION['otp_code'], (string)$otp)) {
    $_SESSION['otp_verified'] = true;
    unset($_SESSION['otp_code']); // Invalidate OTP after successful use
    
    echo json_encode([
        'success' => true,
        'verified' => true,
        'message' => 'Email verified successfully!'
    ]);
} else {
    $remaining = MAX_OTP_ATTEMPTS - $_SESSION['otp_attempts'];
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'verified' => false,
        'message' => "Incorrect OTP. {$remaining} attempts remaining."
    ]);
}
