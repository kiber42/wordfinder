<?php
header('Content-Type: application/json');
include 'mysql.php';

$query_str = "SELECT room_id FROM Players WHERE token = ?";
$token = @$_REQUEST['token'];
$success = ($stmt = $sql->prepare($query_str)) && $stmt->bind_param('s', $token) && $stmt->execute() &&
    ($result = $stmt->get_result()) && ($row = $result->fetch_row());
if (!$success)
    exit(json_encode(["error" => "Invalid token."]));
$room_id = $row[0];

if (!isset($_REQUEST['index']))
{
    # TODO: Modify stored procedure start_game such that it takes a player token as argument
    if (!$sql->query("CALL start_game(${room_id})"))
        exit(json_encode(["error" => "Could not start game."]));
}
else
{
    # TODO: Modify stored procedure choose_word such that it takes a player token as argument
    # TODO: Consider moving this functionality to a separate file
    $index = (int)$_REQUEST['index'];
    $result = $sql->query("CALL choose_word(${room_id}, $index)");
    if (!$result || $sql->affected_rows != 1)
        exit(json_encode(["error" => "Could not choose word."]));
}
exit(json_encode(["error" => ""]));
?>
