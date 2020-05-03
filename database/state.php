<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if (!isset($_REQUEST["token"]))
    exit(json_encode(["error" => "Invalid request."]));

include 'mysql.php';
if ($sql->connect_error)
    exit(json_encode(["error" => "Could not connect to database."]));

$token = $sql->real_escape_string($_REQUEST["token"]);

// Retrieve information about player and game
$result = $sql->query("SELECT player_id, nickname, role, vote, p.room_id, room_name, game_state, mayor, difficulty - 1, secret_found, role_found, TIME_TO_SEC(TIMEDIFF(NOW(), timer_start)) FROM Players p NATURAL JOIN Rooms WHERE token = \"$token\"");
$row = $result->fetch_row();
if ($row == NULL)
    exit(json_encode(["error" => "Invalid request."]));
list($player_id, $nickname, $role, $vote, $room_id, $room_name, $game_state, $mayor_id, $difficulty, $secret_found, $role_found, $seconds) = $row;
$protocol = isset($_SERVER["HTTPS"]) ? "https://" : "http://";
$link = $protocol . $_SERVER["HTTP_HOST"] . $_SERVER["PHP_SELF"] . "?room_name=$room_name";
$is_mayor = $player_id == $mayor_id;
$timeout = $game_state == "main" ? 4 * 60 : 60;
$seconds_left = $timeout - (int)$seconds;
$response = ["nickname" => htmlspecialchars($nickname),
             "room_name" => htmlspecialchars($room_name),
             "game_state" => $game_state,
             "difficulty" => (int)$difficulty,
             "player_role" => $role,
             "is_mayor" => $is_mayor,
             "seconds_left" => $seconds_left,
             "join_link" => $link];
$result->close();

if ($secret_found != null)
{
    $response["secret_found"] = (int)$secret_found;
    $response["role_found"] = (int)$role_found;
}

// Adjust state to "waiting" when a player joined a room with an on-going game
if ($role == null && $game_state != "lobby")
    $game_state = $response["game_state"] = "waiting";

// Find other players in room (either in game or waiting for next round)
$team_query = "SELECT player_id, nickname FROM Players WHERE room_id = ${room_id} AND player_id != ${player_id}";
$recent = " AND last_seen > ADDTIME(NOW(), -10)";
if ($game_state == "lobby" or $game_state == "waiting")
{
    $result = $sql->query($team_query . $recent);
    $response["players"] = $result->fetch_all();
    $result->close();
}
else
{
    $result = $sql->query($team_query . " AND role IS NOT NULL");
    $response["players"] = $result->fetch_all();
    $result->close();
    $result = $sql->query($team_query . $recent . " AND role IS NULL");
    $response["players_waiting"] = $result->fetch_all();
    $result->close();
}

// Provide additional information depending on current game state and role
if ($game_state == "choosing")
{
    if ($is_mayor)
    {
        $result = $sql->query("SELECT word FROM Words WHERE word_id IN (SELECT word_id FROM WordChoices WHERE room_id = ${room_id})");
        $rows = $result->fetch_all();
        $response["words"] = [];
        foreach ($rows as $row)
            $response["words"][] = $row[0];
        $result->close();
    }
    else
    {
        $result = $sql->query("SELECT nickname FROM Players WHERE player_id = ${mayor_id}");
        $response["mayor"] = htmlspecialchars($result->fetch_row()[0]);
        $result->close();
    }
}
else if (($game_state == "main" and ($is_mayor or $role != "villager")) or $game_state == "vote")
{
    $result = $sql->query("SELECT word FROM Words INNER JOIN Rooms WHERE word_id = secret AND room_id = ${room_id} LIMIT 1");
    $response["words"] = [$result->fetch_row()[0]];
    $result->close();
}

// Report own recorded vote to each player
if ($game_state == "vote" && $vote != null)
{
    $result = $sql->query("SELECT nickname FROM Players WHERE player_id = $vote");
    $response["voted_name"] = $result->fetch_row()[0];
    $result->close();
}
    
// Reveal werewolf if word was found
if ($game_state == "vote" && $secret_found == 1)
{
    $result = $sql->query("SELECT nickname FROM Players WHERE role = \"werewolf\" AND room_id = ${room_id}");
    $response["werewolf_name"] = $result->fetch_row()[0];
    $result->close();
}
// Result phase, reveal special roles
else if ($game_state == "lobby" && $secret_found != null)
{
    $result = $sql->query("SELECT role, nickname FROM Players WHERE role IS NOT NULL AND role != \"villager\" AND room_id = ${room_id}");
    $rows = $result->fetch_all();
    foreach ($rows as $row)
    {
        list($role_, $nickname_) = $row;
        $response[$role_ . "_name"] = $nickname_;
    }
    $result->close();
}

// Guessing has timed out
if ($seconds_left <= 0)
{
    switch ($game_state) {
    case "choosing": $sql->query("CALL choose_word(${room_id}, 0)"); break;
    case "main": $sql->query("UPDATE Rooms SET game_state = \"vote\", secret_found = 0, timer_start = NOW() WHERE room_id = ${room_id}"); break;
    case "vote": $sql->query("CALL check_votes(${room_id}, 1)"); break;
    }
}

$sql->query("UPDATE Players SET last_seen = NOW() WHERE player_id = ${player_id}");
$sql->close();

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
