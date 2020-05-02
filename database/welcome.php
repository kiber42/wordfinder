<?php
header("Content-Type: text/html; charset=utf-8");

function propose_name()
{
    include 'mysql.php';
    if ($sql->connect_error)
        die("ERROR: Could not connect to MySQL: " . $sql->connect_error);
    $result = $sql->query("SELECT propose_name();");
    $name = $result->fetch_row()[0];
    $sql->close();
    return $name;
}

if (isset($_REQUEST["room_name"]))
    $name = htmlspecialchars($_REQUEST["room_name"]);
else
    $name = propose_name();
?>
<html>
  <body>
    <form action="join.php" method="POST">
      <table>
        <tr>
          <td><label for="room_name">Room name:</label></td>
          <td><input type="text" id="room_name" name="room_name" value="<?php echo $name; ?>"/></td>
        </tr>
        <tr>
          <td><label for="nickname">Your nickname:</label></td>
          <td><input type="text" maxlength=25 id="nickname" name="nickname"/></td>
        </tr>
        <tr><td colspan=2><input type="submit" value="Go"></td></tr>
      </table>
    </form>
  </body>
</html>
