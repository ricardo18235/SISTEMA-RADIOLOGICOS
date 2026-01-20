<?php
// Email logs disabled.
http_response_code(410);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'message' => 'Email logs disabled']);
?>