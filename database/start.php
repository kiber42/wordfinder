<?php
header('Content-Type: application/json');

if (!isset($_REQUEST["token"]))
    exit(json_encode(["error" => "Invalid request."]));

include 'mysql.php';

$token = $sql->real_escape_string($_REQUEST["token"]);

$result = $sql->query("SELECT room_id FROM Players WHERE token = \"$token\"");
$row = $result->fetch_row();
if ($row == NULL)
    exit(json_encode(["error" => "Invalid token"]));
$room_id = $row[0];

if (!isset($_REQUEST["index"]))
{
    if (!$sql->query("CALL start_game(${room_id})"))
        exit(json_encode(["error" => "Could not start game."]));
}
else
{
    $index = (int)$_REQUEST["index"];
    $result = $sql->query("CALL choose_word(${room_id}, $index)");
    if (!$result || $sql->affected_rows != 1)
        exit(json_encode(["error" => "Could not select word."]));
}
exit(json_encode(["error" => ""]));
?>
