# Wordfinder game for remote play

A little project that you can run on your own server and invite friends to play a game of finding a secret word.

## Game Rules

Once everyone is in the same virtual room and you have agreed on a difficulty, any player can start the game by pressing the corresponding button.

A random player becomes the mayor and may pick the secret word from a short list of words of the selected difficulty level.
Now all others players have to guess the word to win the game.  Any question is allowed, but the mayor must only respond with "Yes", "No", or "Maybe".  If the word is found in time, the mayor presses the corresponding button.

To make things more interesting, there are also secret roles: one or more players are werewolfes, they know the secret word and are trying to slow down the others; one player is a seer, who also knows the word but tries to help the others.  Their most important goal however is to remain undiscovered, since this is what ultimately decides the winning team of the game:

If the secret word is found, the werewolf (or werewolves) will win if they can identify the seer.  If the secret word has not been found, the remaining players can still win if they identify the werewolf (or one of them, if there are several).  To this end, a round of voting takes place once the word has been found or the countdown has expired.

If the word has been found, only the werewolves get to vote.  If there are multiple werewolves, they may (and should) select different players that they suspect to be the seer.  If the word has not been found, then all players can vote; in case of a tie, they will win if any of the tied players was a werewolf.  (There is one exception: if everyone votes for a different player, then the werewolves win automatically.)

## Setup

### Prerequisites

You need a server that runs php and has access to a MySQL database.

### Overview of repository

The repository has three top-level directories:
  - `react` holds the project from which the web front-end is generated
  - `database` holds scripts that are used by the front-end to access the database
  - `scripts` holds the instructions needed to prepare the code you need to serve and to initialize the MySQL database

### Building the server code

In the scripts directory, run the deploy.sh script (for Linux, presumably also runs on MacOS, and the basic steps should also be the same on Windows).
It will first install the required node packages and build the node project, and then copy the required files into one place (by default a directory called server).
In that directory you will find the code that needs to be accessible on your server, so you have to copy it for example to `/var/www/html` or a subdirectory thereof.

### Preparing the database

Connect to the database (either using the `mysql` command line tool or through a webinterface provided by your hoster).
Run the command `use [database_name]` followed by the contents of `scripts/db_definitions.txt` to create the required tables and stored functions and procedures.
In the server directory, make a copy of the file `mysql_template.php` named `mysql.php` and fill in the credentials needed to connect to the database in that file.

### Filling the Words table

I have not created a wordlist on my own but used one I found in a freely available Android app.  Using the Android debug bridge client with command `adb pull /data/app/[appname]/base.apk` and unzipping the apk file you may find the wordlists e.g. in the assets directory.  Find the available packages on your phone using `adb shell cmd package list packages -f -3` to see the full path of third-party packages.

Once you have a list, preferably in csv (comma separated values) format, you can use `scripts/prepare_fill_cmd.py` to generate an SQL statement that can be used to import all the words into your database.
