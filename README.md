# Wordfinder game for remote play

A little project that you can run on your own server and invite friends to play a game of finding a secret word.

## Prerequisites

You need a server that runs php and has access to a MySQL database.

## Building the server code

In the scripts directory, run the deploy.sh script (for Linux, presumably also runs on MacOS, and the basic steps should also be the same on Windows).
It will first install the required node packages and build the node project, and then copy the required files into one place (by default a directory called server).
In this directory you find the code that needs to be accessible on your server, so you have to copy it for example to `/var/www/html` or a subdirectory thereof.

## Preparing the database

Connect to the database (either using the `mysql` command line tool or through a webinterface provided by your hoster).
Run the command `use [database_name]` followed by the contents of `scripts/db_definitions.txt` to create the required tables and stored functions and procedures.
In the server directory, make a copy of the file `mysql_template.php` named `mysql.php` and fill in the credentials needed to connect to the database in that file.

## Filling the Words table

I have not created a wordlist on my own but used one I found in a freely available Android app.  Using the Android debug bridge client with command `adb pull /data/app/[appname]/base.apk` and unzipping the apk file you may find the wordlists e.g. in the assets directory.  Find the available packages on your phone using `adb shell cmd package list packages -f -3` to see the full path of third-party packages.

Once you have a list, preferably in csv (comma separated values) format, you can use `scripts/prepare_fill_cmd.py` to generate an SQL statement that can be used to import all the words into your database.
