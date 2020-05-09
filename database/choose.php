<?php
header('Content-Type: application/json');
include 'mysql.php';

$query_str = "CALL choose_word(?, ?)";
$token = @$_REQUEST['token'];
$index = @$_REQUEST['index'];
$success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('ii', $token, $index) && $stmt->execute();
if (!$success || $sql->affected_rows != 1)
    exit(json_encode(["error" => "Could not choose word."]));

echo json_encode(["error" => ""]);
?>
