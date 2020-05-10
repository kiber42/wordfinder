USE [insert-database-name-here];

CREATE TABLE Words
(
  word_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(50) CHARACTER SET utf8mb4 NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard', 'ridiculous') NOT NULL
);

CREATE TABLE Rooms
(
  room_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(50) CHARACTER SET utf8mb4 NOT NULL,
  expires DATETIME NOT NULL,
  game_state ENUM('lobby', 'choosing', 'main', 'vote') NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard', 'ridiculous') NOT NULL DEFAULT 'medium',
  num_werewolves INT DEFAULT 1,
  num_freemasons INT DEFAULT 0,
  sage_mode ENUM('seer', 'sage', 'both'),
  timer_start DATETIME(0),
  mayor INT,
  secret INT,
  secret_found BIT(1),
  role_found BIT(1),
  FOREIGN KEY (secret) REFERENCES Words(word_id)
);

CREATE TABLE Players
(
  player_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  token INT NOT NULL UNIQUE,
  nickname VARCHAR(50) CHARACTER SET utf8mb4 NOT NULL,
  last_seen DATETIME NOT NULL,
  role ENUM('werewolf', 'seer', 'villager', 'sage', 'freemason'),
  vote INT,
  FOREIGN KEY (vote) REFERENCES Players(player_id),
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
);
ALTER TABLE Rooms ADD FOREIGN KEY (mayor) REFERENCES Players(player_id);

CREATE TABLE WordChoices
(
  room_id INT NOT NULL,
  word_id INT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
  FOREIGN KEY (word_id) REFERENCES Words(word_id)
);

DELIMITER //

CREATE FUNCTION propose_name()
RETURNS CHAR(10)
BEGIN
  DECLARE name CHAR(10);
  SELECT CONCAT(word, "-", FLOOR(RAND() * 900 + 100)) INTO name FROM Words WHERE difficulty = "easy" AND LENGTH(word) = 6 ORDER BY RAND() LIMIT 1;
  RETURN name;
END//

CREATE PROCEDURE remove_expired()
BEGIN
  CREATE TEMPORARY TABLE RoomsToDelete SELECT room_id FROM Rooms WHERE expires < NOW();
  SET FOREIGN_KEY_CHECKS = 0;
  DELETE P.* FROM RoomsToDelete NATURAL JOIN Players P;
  DELETE W.* FROM RoomsToDelete NATURAL JOIN WordChoices W;
  DELETE Rooms.* FROM RoomsToDelete NATURAL JOIN Rooms;
  SET FOREIGN_KEY_CHECKS = 1;
  DROP TEMPORARY TABLE RoomsToDelete;
END//

CREATE FUNCTION request_room(name CHAR(50))
RETURNS INT
BEGIN
  SELECT room_id INTO @room FROM Rooms WHERE room_name = name;
  IF @room IS NULL THEN
    INSERT INTO Rooms(room_name, expires, game_state)
    VALUES (name, ADDDATE(NOW(), 1), "lobby");
    SELECT LAST_INSERT_ID() INTO @room;
  ELSE
    UPDATE Rooms SET expires = ADDDATE(NOW(), 1) WHERE room_id = @room;
  END IF;
  CALL remove_expired();
  RETURN @room;
END//

CREATE FUNCTION add_player(name CHAR(50), room_id_ INT)
RETURNS INT
BEGIN
  # Check if name is taken
  SET @token = 0;
  SELECT token, last_seen < ADDTIME(NOW(), -10) AS expired INTO @token, @expired FROM Players WHERE nickname = name AND room_id = room_id_;
  # Permit using name again if it is not currently active; possible even during game
  IF @token > 0 THEN
    IF @expired THEN
      RETURN @token;
    END IF;
    RETURN 0;
  END IF;
  # Find unique token that cannot be predicted
  REPEAT
    SELECT FLOOR(RAND() * 900000000 + 100000000) INTO @token;
    SELECT COUNT(1) INTO @found FROM Players WHERE token = @token;
  UNTIL @found = 0 END REPEAT;
  INSERT INTO Players(nickname, room_id, token, last_seen) VALUES (name, room_id_, @token, NOW());
  RETURN @token;
END//

CREATE FUNCTION add_player_to_room(nickname CHAR(50), roomname CHAR(50))
RETURNS INT
BEGIN
  SELECT request_room(roomname) INTO @room_id;
  SELECT add_player(nickname, @room_id) INTO @token;
  RETURN @token;
END//

CREATE PROCEDURE assign_roles(IN room_id_ INT, IN num_werewolves INT, OUT mayor INT, OUT mayor_special INT)
BEGIN
  CREATE TEMPORARY TABLE PlayersInGame SELECT player_id FROM Players WHERE room_id = room_id_ AND last_seen > ADDTIME(NOW(), -12) ORDER BY RAND();
  SELECT COUNT(1) FROM PlayersInGame INTO @num_players;
  IF @num_players < 3 THEN
    SET mayor = 0;
  ELSE
    # Initially mark all players as villagers
    UPDATE Players SET role = NULL, vote = NULL WHERE room_id = room_id_;
    UPDATE Players NATURAL JOIN PlayersInGame SET role = 'villager';
    # Pick a mayor.  mayor_special is used to compute a difficulty modifier for the mayor's word choices
    SELECT player_id INTO mayor FROM PlayersInGame ORDER BY RAND() LIMIT 1;
    SET mayor_special = 0;
    # Assign special roles; at the very least two players must not be werewolves
    WHILE num_werewolves > 0 AND @num_players > 2 DO
      SELECT player_id INTO @werewolf FROM PlayersInGame LIMIT 1;
      UPDATE Players SET role = 'werewolf' WHERE player_id = @werewolf;
      DELETE FROM PlayersInGame WHERE player_id = @werewolf;
      SET num_werewolves = num_werewolves - 1;
      SET @num_players = @num_players - 1;
      IF mayor = @werewolf THEN
        SET mayor_special = 1;
      END IF;
    END WHILE;
    SELECT player_id INTO @seer FROM PlayersInGame WHERE player_id != @werewolf LIMIT 1;
    UPDATE Players SET role = "seer" WHERE player_id = @seer;
    DROP TEMPORARY TABLE PlayersInGame;
    IF mayor = @seer THEN
      SET mayor_special = -1;
    END IF;
  END IF;  
END//

CREATE PROCEDURE prepare_word_choices(room_id_ INT, mayor_special INT)
BEGIN
  SELECT difficulty + 0 INTO @diff FROM Rooms WHERE room_id = room_id_;
  DELETE FROM WordChoices WHERE room_id = room_id_;
  CREATE TEMPORARY TABLE ChoicesForThisGame SELECT word_id FROM Words WHERE difficulty = @diff ORDER BY RAND() LIMIT 3;
  # If the mayor has a special role, offer one extra word with adjusted difficulty
  IF mayor_special != 0 THEN
    SET @diff = LEAST(GREATEST(@diff + mayor_special, 1), 4);
    INSERT INTO ChoicesForThisGame SELECT word_id FROM Words WHERE difficulty = @diff ORDER BY RAND() LIMIT 1;
  END IF;
  INSERT INTO WordChoices(room_id, word_id) SELECT room_id_, word_id FROM ChoicesForThisGame ORDER BY RAND();
  DROP TEMPORARY TABLE ChoicesForThisGame;
END//

CREATE PROCEDURE start_game(token_ INT)
proc: BEGIN
  SELECT game_state, num_werewolves, p.room_id INTO @game_state, @num_werewolves, @room_id FROM Rooms NATURAL JOIN Players p WHERE token = token_;
  IF @game_state != 'lobby' THEN LEAVE proc; END IF;
  CALL assign_roles(@room_id, @num_werewolves, @mayor, @mayor_special);
  IF @mayor = 0 THEN LEAVE proc; END IF;
  CALL prepare_word_choices(@room_id, @mayor_special);
  UPDATE Rooms SET game_state = 'choosing', timer_start = NOW(), mayor = @mayor, secret_found = 0, role_found = 0, expires = ADDDATE(NOW(), 1) WHERE room_id = @room_id;
END//

CREATE PROCEDURE choose_word(token_ INT, word_index INT)
proc: BEGIN
  SELECT game_state, p.room_id INTO @game_state, @room_id FROM Rooms NATURAL JOIN Players p WHERE token = token_;
  IF @game_state != "choosing" THEN
    LEAVE proc;
  END IF;
  IF word_index >= 0 THEN
    SELECT word_id INTO @word_id FROM WordChoices WHERE room_id = @room_id LIMIT word_index, 1;
  ELSE
    SELECT word_id INTO @word_id FROM WordChoices WHERE room_id = @room_id ORDER BY RAND() LIMIT 1;
  END IF;
  UPDATE Rooms SET game_state = "main", timer_start = NOW(), secret = @word_id WHERE room_id = @room_id;
END//

CREATE PROCEDURE check_votes(room_id_ INT, time_up BIT(1))
proc: BEGIN
  SELECT game_state, secret_found INTO @game_state, @secret_found FROM Rooms WHERE room_id = room_id_;
  IF @game_state != "vote" THEN
    LEAVE proc;
  END IF;
  SELECT COUNT(player_id) INTO @missing_votes FROM Players WHERE room_id = room_id_ AND role IS NOT NULL AND vote IS NULL AND (@secret_found = 0 OR role = "werewolf");
  IF time_up = 1 OR @missing_votes = 0 THEN
    # Determine highest vote count
    SELECT MAX(subquery.result) INTO @max_count FROM (SELECT COUNT(vote) AS result FROM Players P WHERE room_id = room_id_ GROUP BY vote) subquery;
    # There could be more than one winner of the vote, store in a temporary table
    CREATE TEMPORARY TABLE VotedPlayers SELECT vote, COUNT(1) AS count FROM Players WHERE room_id = room_id_ AND vote IS NOT NULL GROUP BY vote HAVING count = @max_count;
    SET @role_found = -1;
    IF @secret_found = 0 THEN
      # Handle special case: every player received exactly one vote -> werewolf wins automatically
      SELECT COUNT(1) INTO @num_votes FROM Players WHERE room_id = room_id_ AND role IS NOT NULL;
      SELECT COUNT(1) INTO @different_votes FROM VotedPlayers;
      IF @num_votes = @different_votes THEN
        SET @role_found = 0;
      END IF;
    END IF;
    IF @role_found = -1 THEN
      # Check vote result.  Use numerical enum values, this avoids issues with character encoding.
      IF @secret_found = 0 THEN
        SET @target_role = 1; # werewolf
      ELSE
        SET @target_role = 2; # seer
      END IF;
      SELECT COUNT(1) INTO @role_found FROM Players p INNER JOIN VotedPlayers v ON v.vote = player_id WHERE role = @target_role LIMIT 1;
    END IF;
    DROP TEMPORARY TABLE VotedPlayers;
    UPDATE Rooms SET game_state = "lobby", role_found = @role_found, timer_start = NULL WHERE room_id = room_id_;
  END IF;
END//

DELIMITER ;
