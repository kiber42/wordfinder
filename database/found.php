<?php
header('Content-Type: application/json');

if (!isset($_REQUEST["token"]))
    exit(json_encode(["error" => "Invalid request."]));
include 'mysql.php';
if ($sql->connect_error)
    exit(json_encode(["error" => "Could not connect to database."]));
$token = $sql->real_escape_string($_REQUEST["token"]);

$sql->query("UPDATE Rooms NATURAL JOIN Players SET game_state = \"vote\", secret_found = 1, timer_start = NOW() WHERE token = \"$token\" AND game_state = \"main\" AND player_id = mayor");
if ($sql->affected_rows != 1)
    exit(json_encode(["error" => "Failed to update room information."]));
echo json_encode(["error" => ""]);
?>
