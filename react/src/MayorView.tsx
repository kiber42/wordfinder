import React, {useContext} from "react";

import {Connection} from "./Context";
import {OtherWerewolves, IOtherWerewolvesProps, Role} from "./SecretRole";

interface IProps {
    role: Role;
    secret?: string;
    words?: string[];
}

export function MayorView(props: IProps & IOtherWerewolvesProps) {
    const connection = useContext(Connection);
    if (props.words) {
        const words = props.words.map((word, index) => (
            <button onClick={() => choose_word(index, connection.token)} key={index}>
                {word}
            </button>
        ));
        return (
            <div className="player-info">
                <div className="instructions">Wähle dein Zauberwort:</div>
                <div className="wordlist">{words}</div>
                <OtherWerewolves other_werewolves={props.other_werewolves} />
            </div>
        );
    }

    if (props.secret) {
        return (
            <div className="player-info">
                <div className="secret-message">
                    Das Zauberwort ist: <div className="secret">{props.secret}</div>
                </div>
                {getInstructions(props.role)}
                <OtherWerewolves other_werewolves={props.other_werewolves} />
                <button className="word-found" onClick={() => secret_found(connection.token)}>
                    Das Wort wurde erraten!
                </button>
            </div>
        );
    }

    console.error("No words available");
    return <div>Fehler!</div>;
}

function getInstructions(role: Role) {
    let instructions: string;
    switch (role) {
        case "werewolf":
            instructions =
                "Mache es den Ratern möglichst schwer, ohne dass sie dir auf die Schliche kommen!";
            break;
        case "seer":
            instructions =
                "Mache es den Ratern möglichst einfach, ohne dass der Werwolf dich erkennt!";
            break;
        case "villager":
            instructions = "Viel Erfolg!";
            break;
    }
    return (
        <div className="instructions">
            <div>
                Die anderen müssen das Wort erraten, aber du darfst nur mit <i>Ja</i>, <i>Nein</i>{" "}
                und <i>Vielleicht</i> antworten.
            </div>
            <div>{instructions}</div>
        </div>
    );
}

function choose_word(index: number, token: number) {
    fetch("choose.php?token=" + token + "&index=" + index)
        .then()
        .catch((err) => console.error(err));
}

function secret_found(token: number) {
    fetch("found.php?token=" + token)
        .then()
        .catch((err) => console.error(err));
}
