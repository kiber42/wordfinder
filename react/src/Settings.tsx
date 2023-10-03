import React, {useContext} from "react";

import {Connection} from "./Context";

const levels = ["leicht", "normal", "schwer", "unmöglich"];

export function Difficulty(props: {current: number}) {
    const connection = useContext(Connection);
    const choices = levels.map((level, index) => (
        <label key={index}>
            <input
                type="radio"
                checked={index === props.current}
                onClick={() => setDifficulty(index, connection.token)}
            />
            {level}
        </label>
    ));
    return (
        <div className="setting difficulty">
            <div>Schwierigkeit</div>
            {choices}
        </div>
    );
}

export function NumWerewolves(props: {current: number; num_players: number}) {
    const connection = useContext(Connection);
    const choices = [1, 2].map((n) => (
        <label key={n}>
            <input
                type="radio"
                checked={n === props.current}
                onClick={() => setNumWerewolves(n, connection.token)}
            />
            {n}
        </label>
    ));
    const recommended = props.num_players <= 6 ? 1 : 2;
    return (
        <div className="setting numwerewolves">
            <div>Anzahl Werwölfe</div>
            {choices}
            <div>Empfohlen: {recommended}</div>
        </div>
    );
}

function setDifficulty(level: number, token: number) {
    fetch("settings.php?token=" + token + "&difficulty=" + level)
        .then()
        .catch((err) => console.error(err));
}

function setNumWerewolves(n: number, token: number) {
    fetch("settings.php?token=" + token + "&num_werewolves=" + n)
        .then()
        .catch((err) => console.error(err));
}
