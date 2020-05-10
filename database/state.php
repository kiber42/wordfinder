<?php
header('Content-Type: application/json');
include 'mysql.php';

// Retrieve information about player and game state.
// Not using a prepared statement here since this is the most frequently called script.
$token = (int)@$_REQUEST['token'];
$query_str =
    "SELECT player_id, nickname, role, vote, p.room_id, room_name, game_state, mayor, difficulty - 1, num_werewolves, " .
    "secret_found, role_found, TIME_TO_SEC(TIMEDIFF(NOW(), timer_start)) FROM Players p NATURAL JOIN Rooms WHERE token = $token";
$success = ($result = $sql->query($query_str)) && ($row = $result->fetch_row());
if (!$success)
    exit(json_encode(["error" => "Invalid token."]));
$result->close();
// $token can be considered safe from here on

list($player_id, $nickname, $role, $vote, $room_id, $room_name, $game_state, $mayor_id, $difficulty, $num_werewolves, $secret_found, $role_found, $seconds) = $row;

$protocol = isset($_SERVER["HTTPS"]) ? "https://" : "http://";
$link = $protocol . $_SERVER["HTTP_HOST"] . dirname($_SERVER["PHP_SELF"]) . "/?room_name=$room_name";
$is_mayor = $player_id == $mayor_id;
$response = ["nickname" => htmlspecialchars($nickname),
             "room_name" => htmlspecialchars($room_name),
             "game_state" => $game_state,
             "difficulty" => (int)$difficulty,
             "num_werewolves" => (int)$num_werewolves,
             "player_role" => $role,
             "is_mayor" => $is_mayor,
             "join_link" => $link];

if ($secret_found !== null)
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
    $result = $sql->query("SELECT nickname FROM Players WHERE role = 'werewolf' AND room_id = ${room_id}");
    $response["werewolf_name"] = $result->fetch_row()[0];
    $result->close();
}
// Result phase: reveal special roles and votes
else if ($game_state == "lobby" && $secret_found !== null)
{
    $result = $sql->query("SELECT role, nickname FROM Players WHERE role IS NOT NULL AND role != 'villager' AND room_id = ${room_id}");
    $rows = $result->fetch_all();
    foreach ($rows as $row)
    {
        list($role_, $nickname_) = $row;
        $response[$role_ . "_name"] = $nickname_;
    }
    $result->close();

    $result = $sql->query("SELECT p1.nickname, p2.nickname FROM Players p1 INNER JOIN Players p2 ON p1.vote = p2.player_id WHERE p1.vote IS NOT NULL AND p1.room_id = ${room_id}");
    $rows = $result->fetch_all();
    $received_votes = [];
    foreach ($rows as $row) { $received_votes[$row[1]] = []; }
    foreach ($rows as $row) { $received_votes[$row[1]][] = $row[0]; }
    uasort($received_votes, function ($a, $b) { return count($b) - count($a); });
    $response["received_votes_from"] = $received_votes;
    $result->close();
}

// Report time remaining and check for time-out
if ($game_state != "lobby")
{
    $timeout = $game_state == "main" ? 4 * 60 : 60;
    $seconds_left = $timeout - (int)$seconds;
    $response["seconds_left"] = $seconds_left;
    if ($seconds_left <= 0)
    {
        switch ($game_state) {
        case "choosing": $sql->query("CALL choose_word($token, -1)"); break;
        case "main": $sql->query("UPDATE Rooms SET game_state = 'vote', secret_found = 0, timer_start = NOW() WHERE room_id = ${room_id}"); break;
        case "vote": $sql->query("CALL check_votes(${room_id}, 1)"); break;
        }
    }
}

$sql->query("UPDATE Players SET last_seen = NOW() WHERE player_id = ${player_id}");
$sql->close();

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
