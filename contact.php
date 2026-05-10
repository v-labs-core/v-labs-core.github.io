<?php
declare(strict_types=1);

$allowedOrigins = ['https://vindem.tech', 'https://www.vindem.tech'];
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
