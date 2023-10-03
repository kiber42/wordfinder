import React from "react";

import {OtherWerewolves, IOtherWerewolvesProps, Role} from "./SecretRole";

interface IProps {
    mayor: string;
    has_chosen: boolean;
    role: Role;
    secret?: string;
}

export class GuessingView extends React.Component<IProps & IOtherWerewolvesProps> {
    private getInstructions() {
        if (!this.props.has_chosen)
            return (
                <div className="instructions wait">
                    Bürgermeister <b>{this.props.mayor}</b> wählt das Zauberwort aus.
                </div>
            );

        let instructions: string;
        switch (this.props.role) {
            case "werewolf":
                instructions =
                    "Verhindere, dass die anderen es erraten — aber ohne erkannt zu werden!";
                break;
            case "seer":
                instructions = "Hilf den anderen es zu erraten — aber ohne erkannt zu werden!";
                break;
            case "villager":
                instructions = "Erratet das Zauberwort, ehe die Zeit abläuft!";
                break;
        }
        return <div className="instructions">{instructions}</div>;
    }

    render() {
        return (
            <div className="player-info">
                {this.props.secret && (
                    <div className="secret-message">
                        Das Zauberwort ist: <div className="secret">{this.props.secret}</div>
                    </div>
                )}
                {this.getInstructions()}
                <OtherWerewolves other_werewolves={this.props.other_werewolves} />
            </div>
        );
    }
}
