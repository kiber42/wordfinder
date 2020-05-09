<?php
header('Content-Type: application/json');
include 'mysql.php';

$result = $sql->query("SELECT propose_name()");
$name = $result->fetch_row()[0];
$sql->close();

exit(json_encode(["room_name" => $name]));
?>
