<?php
header('Content-Type: application/json');

$room_name = trim(@$_REQUEST["room_name"]);
$nickname = trim(@$_REQUEST["nickname"]);
if (!$room_name || !$nickname)
    exit(json_encode(["error" => "Missing input"]));

include 'mysql.php';

$room_id = request_room($room_name);
$token = create_player($nickname, $room_id);
$sql->close();

exit(json_encode(["token" => $token]));

function sanitize($str, $max_len)
{
    global $sql;
    do {
        $result = $sql->real_escape_string($str);
        $str = substr($str, 0, -1);
    }
    while (strlen($result) > $max_len);
    return $result;
}

function request_room($room_name)
{
    global $sql;
    $room_name = sanitize($room_name, 50);
    $result = $sql->query("SELECT request_room(\"${room_name}\")");
    return $result->fetch_row()[0];
}

function create_player($nickname, $room_id)
{
    global $sql;
    $token = sanitize($nickname, 10) . random_int(100000, 999999);
    $nickname = sanitize($nickname, 50);
    if ($sql->query("INSERT INTO Players(nickname, token, room_id, last_seen) VALUES(\"$nickname\", \"$token\", $room_id, NOW())") === false)
        die("ERROR: SQL query failed in create_players");
    return $token;
}
?>
