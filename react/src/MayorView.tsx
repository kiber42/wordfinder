import React from "react";

import {Connection} from "./Context";
import {OtherWerewolves, IOtherWerewolvesProps, Role} from "./SecretRole"; // eslint-disable-line no-unused-vars

interface IProps {
    role: Role;
    secret?: string;
    words?: string[];
}

export class MayorView extends React.Component<IProps & IOtherWerewolvesProps> {
    context!: React.ContextType<typeof Connection>;

    private getInstructions() {
        let instructions: string;
        switch (this.props.role) {
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
                    Die anderen müssen das Wort erraten, aber du darfst nur mit <i>Ja</i>,{" "}
                    <i>Nein</i> und <i>Vielleicht</i> antworten.
                </div>
                <div>{instructions}</div>
            </div>
        );
    }

    public render() {
        if (this.props.words) {
            const words = this.props.words.map((word, index) => (
                <button onClick={() => this.choose_word(index)} key={index}>
                    {word}
                </button>
            ));
            return (
                <div className="player-info">
                    <div className="instructions">Wähle dein Zauberwort:</div>
                    <div className="wordlist">{words}</div>
                    <OtherWerewolves other_werewolves={this.props.other_werewolves} />
                </div>
            );
        }

        if (this.props.secret) {
            return (
                <div className="player-info">
                    <div className="secret-message">
                        Das Zauberwort ist: <div className="secret">{this.props.secret}</div>
                    </div>
                    {this.getInstructions()}
                    <OtherWerewolves other_werewolves={this.props.other_werewolves} />
                    <button className="word-found" onClick={() => this.secret_found()}>
                        Das Wort wurde erraten!
                    </button>
                </div>
            );
        }

        console.error("No words available");
        return <div>Fehler!</div>;
    }

    choose_word(index: number) {
        fetch("choose.php?token=" + this.context.token + "&index=" + index)
            .then()
            .catch((err) => console.error(err));
    }

    secret_found() {
        fetch("found.php?token=" + this.context.token)
            .then()
            .catch((err) => console.error(err));
    }
}
