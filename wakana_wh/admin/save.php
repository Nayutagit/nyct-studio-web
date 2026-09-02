<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$file = $input['file'] ?? '';
$content = $input['content'] ?? '';

if (!isset($ARTICLES[$file])) {
    echo json_encode(['ok' => false, 'error' => 'invalid file']);
    exit;
}

$path = realpath(__DIR__ . '/../' . $file);
$baseDir = realpath(__DIR__ . '/..');
if ($path === false || strpos($path, $baseDir) !== 0) {
    echo json_encode(['ok' => false, 'error' => 'path error']);
    exit;
}

$html = file_get_contents($path);
$startMarker = '<!-- WK_CONTENT_START -->';
$endMarker = '<!-- WK_CONTENT_END -->';

$startPos = strpos($html, $startMarker);
$endPos = strpos($html, $endMarker);

if ($startPos === false || $endPos === false || $endPos < $startPos) {
    echo json_encode(['ok' => false, 'error' => 'marker not found']);
    exit;
}

$startPos += strlen($startMarker);

$newHtml = substr($html, 0, $startPos) . "\n" . $content . "\n        " . substr($html, $endPos);

// バックアップを1世代だけ残す
@copy($path, $path . '.bak');

if (file_put_contents($path, $newHtml) === false) {
    echo json_encode(['ok' => false, 'error' => 'write failed']);
    exit;
}

echo json_encode(['ok' => true]);
