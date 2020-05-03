<?php
$sql = new mysqli([SERVER], [USER], [PASSWORD], [DATABASE_NAME]);
$sql->set_charset("utf8");
if ($sql->connect_error)
    exit(json_encode(["error" => "Could not connect to database."]));
?>
