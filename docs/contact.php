<?php
declare(strict_types=1);

$allowedOrigins = ['https://vindem.tech', 'https://www.vindem.tech', 'http://693filler.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'https://vindem.tech';
$responseOrigin = in_array($origin, $allowedOrigins, true) ? $origin : 'https://vindem.tech';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $responseOrigin);
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

function request_origin(): string
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin !== '') {
        return strtolower(rtrim($origin, '/'));
    }

    $referer = $_SERVER['HTTP_REFERER'] ?? '';

    if ($referer === '') {
        return '';
    }

    $scheme = parse_url($referer, PHP_URL_SCHEME);
    $host = parse_url($referer, PHP_URL_HOST);
    $port = parse_url($referer, PHP_URL_PORT);

    if (!$scheme || !$host) {
        return '';
    }

    $source = strtolower($scheme . '://' . $host);

    if ($port) {
        $source .= ':' . $port;
    }

    return $source;
}

function client_ip(): string
{
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_TRUE_CLIENT_IP'] ?? '',
        explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];

    foreach ($candidates as $candidate) {
        $ip = trim($candidate);

        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return 'unknown';
}

function enforce_rate_limit(string $ip): void
{
    $limit = 5;
    $windowSeconds = 3600;
    $directory = sys_get_temp_dir() . '/vindem-contact-rate';

    if (!is_dir($directory) && !mkdir($directory, 0700, true)) {
        return;
    }

    $file = $directory . '/' . hash('sha256', $ip) . '.json';
    $now = time();
    $timestamps = [];
    $handle = fopen($file, 'c+');

    if (!$handle) {
        return;
    }

    flock($handle, LOCK_EX);
    $contents = stream_get_contents($handle);
    $decoded = $contents !== '' ? json_decode($contents, true) : [];

    if (is_array($decoded)) {
        $timestamps = array_filter($decoded, static function ($timestamp) use ($now, $windowSeconds): bool {
            return is_int($timestamp) && $timestamp > ($now - $windowSeconds);
        });
    }

    if (count($timestamps) >= $limit) {
        flock($handle, LOCK_UN);
        fclose($handle);
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
        exit;
    }

    $timestamps[] = $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode(array_values($timestamps)));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

if (!in_array(request_origin(), $allowedOrigins, true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Request source is not allowed.']);
    exit;
}

enforce_rate_limit(client_ip());

$rawInput = file_get_contents('php://input') ?: '';
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

function clean_input($value): string
{
    return trim((string) ($value ?? ''));
}

if (clean_input($input['botcheck'] ?? '') !== '') {
    echo json_encode(['success' => true]);
    exit;
}

$name = clean_input($input['name'] ?? '');
$company = clean_input($input['company'] ?? '');
$email = clean_input($input['email'] ?? '');
$interest = clean_input($input['interest'] ?? '');
$message = clean_input($input['message'] ?? '');

if ($name === '' || $email === '' || $interest === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please complete the required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

$to = 'info@vindem.tech';
$subject = 'New inquiry from vindem.tech';
$body = implode("\n", [
    'New inquiry from vindem.tech',
    '',
    'Name: ' . $name,
    'Company: ' . ($company !== '' ? $company : 'Not provided'),
    'Email: ' . $email,
    'Area of interest: ' . $interest,
    '',
    'Project details:',
    $message,
]);
$headers = [
    'From: Vindem Labs <info@vindem.tech>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Unable to send message right now.']);
    exit;
}

echo json_encode(['success' => true]);
