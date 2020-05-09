<?php
header('Content-Type: application/json');

$room_name = trim(@$_REQUEST['room_name']);
$nickname = trim(@$_REQUEST['nickname']);
if (!$room_name || !$nickname)
    exit(json_encode(["error" => "Missing input"]));

include 'mysql.php';

$room_id = request_room($room_name);
$token = create_player($nickname, $room_id);
$sql->close();

exit(json_encode(["token" => $token]));

function request_room($room_name)
{
    global $sql;
    $query_str = "SELECT request_room(?)";
    $success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('s', $room_name) && $stmt->execute() && ($result = $stmt->get_result());
    if (!$success)
        exit(json_encode(["error" => "Failed to request room."]));
    return $result->fetch_row()[0];
}

function create_player($nickname, $room_id)
{
    global $sql;
    $token = substr($nickname, 0, 10) . random_int(100000, 999999);
    $nickname = substr($nickname, 0, 50);
    $query_str = "INSERT INTO Players(nickname, token, room_id, last_seen) VALUES(?, ?, $room_id, NOW())";
    $success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('ss', $nickname, $token) && $stmt->execute();
    if (!$success)
        exit(json_encode(["error" => "Failed to create player."]));
    return $token;
}
?>
