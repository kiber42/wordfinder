import React, {useContext} from "react";
import copy from "copy-to-clipboard";

import {Connection} from "./Context";
import {Difficulty, NumWerewolves} from "./Settings";

interface LobbyViewProps {
    difficulty: number;
    invite_link: string;
    num_players: number;
    num_werewolves: number;
}

export function LobbyView(props: LobbyViewProps) {
    const connection = useContext(Connection);
    let startButton;
    if (props.num_players >= 3)
        startButton = (
            <button onClick={() => startGame(connection.token)}>Alle da? Los geht&apos;s!</button>
        );
    else startButton = <button disabled>Warte auf Mitspieler...</button>;
    return (
        <>
            <div className="startbutton">{startButton}</div>
            <div className="settings-container">
                <Difficulty current={props.difficulty} />
                <NumWerewolves current={props.num_werewolves} num_players={props.num_players} />
            </div>
            <Invite link={props.invite_link} />
        </>
    );
}

function startGame(token: number) {
    fetch("start.php?token=" + token)
        .then()
        .catch((err) => console.error(err));
}

function Invite(props: {link: string}) {
    return (
        <div className="invite-link-container">
            <div className="invite-link-message">
                Mit diesem Link kannst du weitere Spieler einladen:
            </div>
            <div className="invite-link">
                <input type="text" id="link" value={props.link} readOnly />
                <button onClick={() => copy(props.link)}>📋</button>
            </div>
        </div>
    );
}
