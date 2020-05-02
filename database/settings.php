<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if (!isset($_REQUEST["token"]) || !isset($_REQUEST["difficulty"]))
    exit(json_encode(["error" => "Invalid request."]));

include 'mysql.php';
if ($sql->connect_error)
    exit(json_encode(["error" => "Could not connect to database."]));

$token = $sql->real_escape_string($_REQUEST["token"]);

$difficulty = (int)$_REQUEST["difficulty"] + 1; // SQL enums start at 1
$result = $sql->query("UPDATE Rooms NATURAL JOIN Players SET difficulty = $difficulty WHERE token = \"$token\"");
if (!$result)
    exit(json_encode(["error" => "Invalid request."]));

echo json_encode(["error" => ""]);
?>
