<?php
header('Content-Type: application/json');
include 'mysql.php';

if (!isset($_REQUEST['id']))
    exit(json_encode(["error" => "Incomplete request."]));
$voted_id = (int)$_REQUEST['id'];

// Retrieve information about player and game
$query_str = "SELECT role, game_state, secret_found, vote, p.room_id FROM Players p NATURAL JOIN Rooms WHERE token = ?";
$token = @$_REQUEST['token'];
$success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('i', $token) && $stmt->execute() &&
    ($result = $stmt->get_result()) && ($row = $result->fetch_row());
if (!$success)
    exit(json_encode(["error" => "Invalid token."]));
list($role, $game_state, $secret_found, $vote, $room_id) = $row;
$stmt->close();

if ($game_state != "vote" || $vote != null || ($secret_found == true && $role != "werewolf"))
    exit(json_encode(["error" => "Voting not possible."]));

$query_str = "UPDATE Players SET vote = ? WHERE token = ?";
$success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('ii', $voted_id, $token) && $stmt->execute();
if (!$success || $sql->affected_rows != 1)
    exit(json_encode(["error" => "Failed to count vote."]));

$sql->commit();
// Possible race condition here if there are multiple concurrent votes?
usleep(10000); // 10 ms
$sql->query("CALL check_votes(${room_id}, 0)");
$sql->close();

echo json_encode(["error" => ""]);
?>
