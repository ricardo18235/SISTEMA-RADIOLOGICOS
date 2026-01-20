<?php
// mail_config.php
// Email functionality has been disabled per project request.
// This file provides no-op stubs to avoid fatal errors from includes.

function sendPatientNotificationEmail(...$args) { return ['success' => false, 'message' => 'disabled']; }
function sendDoctorNotificationEmail(...$args) { return ['success' => false, 'message' => 'disabled']; }
function logEmailSend(...$args) { return false; }

?>
