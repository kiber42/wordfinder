<?php
header('Content-Type: application/json');
include 'mysql.php';

$query_str = "UPDATE Rooms NATURAL JOIN Players SET game_state = 'vote', secret_found = 1, timer_start = NOW() WHERE token = ? AND game_state = 'main' AND player_id = mayor";
$token = @$_REQUEST['token'];
$success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('i', $token) && $stmt->execute();
if (!$success || $sql->affected_rows !== 1)
    exit(json_encode(["error" => "Failed to update room information."]));

echo json_encode(["error" => ""]);
?>
