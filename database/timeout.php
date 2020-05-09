<?php
// Used for testing: Let timeout for current game state expire
include 'mysql.php';

$query_str = "UPDATE Rooms NATURAL JOIN Players SET timer_start = ADDTIME(NOW(), '-1:00:00') WHERE token = ?";
$token = @$_REQUEST['token'];
$stmt = $sql->prepare($query_str);
$stmt->bind_param('i', $token);
$stmt->execute();
?>
