<?php
// backend/test_send_email.php
// Email tests disabled to remove email functionality.
header('Content-Type: application/json');
http_response_code(410);
echo json_encode(['success' => false, 'message' => 'Email tests disabled']);
?>