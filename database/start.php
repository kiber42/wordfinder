<?php
header('Content-Type: application/json');
include 'mysql.php';

$query_str = "CALL start_game(?)";
$token = @$_REQUEST['token'];
$success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('i', $token) && $stmt->execute();
if (!$success || $sql->affected_rows != 1)
    exit(json_encode(["error" => "Could not start game."]));

echo json_encode(["error" => ""]);
?>
