<?php
header('Content-Type: application/json');

$room_name = trim(@$_REQUEST['room_name']);
$nickname = trim(@$_REQUEST['nickname']);
if (!$room_name || !$nickname)
    exit(json_encode(["error" => "Missing input"]));

include 'mysql.php';

$success =
    ($stmt = $sql->prepare("SELECT add_player_to_room(?, ?)")) &&
    $stmt->bind_param('ss', $nickname, $room_name) &&
    $stmt->execute() &&
    ($result = $stmt->get_result()) &&
    ($row = $result->fetch_row());
if (!$success)
    exit(json_encode(["error" => "Error while joining room."]));

$token = $row[0];
echo json_encode(["token" => $token]);
?>
