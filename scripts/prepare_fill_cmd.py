#!python3
import sys

difficulties = ["easy", "medium", "hard", "ridiculous"]

if len(sys.argv) != 3 or sys.argv[2] not in difficulties:
    print("Usage: {} [csvfile] [difficulty]\n".format(sys.argv[0]))
    print("Allowed values for difficulty: easy medium hard ridiculous\n")
    sys.exit(1)

filename = sys.argv[1]
difficulty = difficulties.index(sys.argv[2]) + 1

try:
    with open(filename, encoding="utf-8") as f:
        words = f.read().split(",")
except (FileNotFoundError, PermissionError):
    print("Could not open {}".format(filename))
    sys.exit(2)

print("USE [database_name]")
print("INSERT INTO Words(word, difficulty) VALUES " + ", ".join('("{}",{})'.format(word, difficulty) for word in words) + ";")
