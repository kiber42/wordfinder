<?php
header('Content-Type: application/json');
include 'mysql.php';

if (isset($_REQUEST["difficulty"]))
{
    $difficulty = (int)$_REQUEST["difficulty"] + 1; // SQL enums start at 1
    $query_str = "UPDATE Rooms NATURAL JOIN Players SET difficulty = ? WHERE token = ?";
    $token = @$_REQUEST['token'];
    $success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('ii', $difficulty, $token) && $stmt->execute();
    if (!$success || $sql->affected_rows != 1)
        exit(json_encode(["error" => "Failed to set difficulty."]));
}

if (isset($_REQUEST["num_werewolves"]))
{
    $num_werewolves = (int)$_REQUEST["num_werewolves"];
    $query_str = "UPDATE Rooms NATURAL JOIN Players SET num_werewolves = ? WHERE token = ?";
    $token = @$_REQUEST['token'];
    $success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('ii', $num_werewolves, $token) && $stmt->execute();
    if (!$success || $sql->affected_rows != 1)
        exit(json_encode(["error" => "Failed to set number of werewolves."]));
}

echo json_encode(["error" => ""]);
?>
