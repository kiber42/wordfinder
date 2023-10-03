import React, {Component} from "react";

import {Connection} from "./Context";

interface IDifficultyProps {
    current: number;
}

export class Difficulty extends Component<IDifficultyProps> {
    context!: React.ContextType<typeof Connection>;

    static levels = ["leicht", "normal", "schwer", "unmöglich"];

    render() {
        const choices = Difficulty.levels.map((level, index) => (
            <label key={index}>
                <input
                    type="radio"
                    checked={index === this.props.current}
                    onClick={() => this.setDifficulty(index)}
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

    setDifficulty(level: number) {
        fetch("settings.php?token=" + this.context.token + "&difficulty=" + level)
            .then()
            .catch((err) => console.error(err));
    }
}

interface INumWerewolvesProps {
    current: number;
    num_players: number;
}

export class NumWerewolves extends Component<INumWerewolvesProps> {
    context!: React.ContextType<typeof Connection>;

    render() {
        const choices = [1, 2].map((n) => (
            <label key={n}>
                <input
                    type="radio"
                    checked={n === this.props.current}
                    onClick={() => this.setNumber(n)}
                />
                {n}
            </label>
        ));
        const recommended = this.props.num_players <= 6 ? 1 : 2;
        return (
            <div className="setting numwerewolves">
                <div>Anzahl Werwölfe</div>
                {choices}
                <div>Empfohlen: {recommended}</div>
            </div>
        );
    }

    setNumber(n: number) {
        fetch("settings.php?token=" + this.context.token + "&num_werewolves=" + n)
            .then()
            .catch((err) => console.error(err));
    }
}
