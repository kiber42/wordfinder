<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if (!isset($_REQUEST["token"]) || !isset($_REQUEST["id"]))
    exit(json_encode(["error" => "Invalid request."]));

include 'mysql.php';
if ($sql->connect_error)
    exit(json_encode(["error" => "Could not connect to database."]));

$token = $sql->real_escape_string($_REQUEST["token"]);

// Retrieve information about player and game
$result = $sql->query("SELECT role, game_state, secret_found, vote, p.room_id FROM Players p NATURAL JOIN Rooms WHERE token = \"$token\"");
$row = $result->fetch_row();
if ($row == NULL)
    exit(json_encode(["error" => "Invalid request."]));
list($role, $game_state, $secret_found, $vote, $room_id) = $row;
$result->close();

if ($game_state != "vote" || $vote != null || ($secret_found == true && $role != "werewolf"))
    exit(json_encode(["error" => "Invalid request."]));

$id = (int)($_REQUEST["id"]);
if (!$sql->query("UPDATE Players SET vote = $id WHERE token = \"$token\""))
    exit(json_encode(["error" => "Invalid request."]));

$sql->commit();
// Possible race condition here if there are multiple concurrent votes!
usleep(10000); // 10 ms
$sql->query("CALL check_votes(${room_id})");
$sql->close();

echo json_encode(["error" => ""]);
?>
