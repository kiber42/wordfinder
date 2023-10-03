import React from "react";

import {GuessingView} from "./GuessingView";
import {MayorView} from "./MayorView";
import {Role, SecretRoleCard} from "./SecretRole"; // eslint-disable-line no-unused-vars
import {VoteView} from "./Voting";

interface IGameProps {
    state: "choosing" | "main" | "vote";
    other_players: [number, string][];
    words?: string[];
    secret?: string;
    secret_found?: number;
    mayor: string;
    werewolf_names?: string[];
}

interface IPlayerProps {
    is_mayor: boolean;
    role: Role;
    other_werewolves?: string[];
    voted_name?: string;
}

export class GameView extends React.Component<IGameProps & IPlayerProps> {
    private getMayorAndRoleTag() {
        if (!this.props.is_mayor) return this.props.role;
        if (this.props.role === "villager") return "mayor";
        return this.props.role + "-mayor";
    }

    private getMainContent() {
        switch (this.props.state) {
            case "choosing":
                return this.props.is_mayor ? (
                    <MayorView
                        role={this.props.role}
                        words={this.props.words}
                        other_werewolves={this.props.other_werewolves}
                    />
                ) : (
                    <GuessingView
                        mayor={this.props.mayor}
                        has_chosen={false}
                        role={this.props.role}
                        other_werewolves={this.props.other_werewolves}
                    />
                );
            case "main":
                return this.props.is_mayor ? (
                    <MayorView
                        role={this.props.role}
                        secret={this.props.secret}
                        other_werewolves={this.props.other_werewolves}
                    />
                ) : (
                    <GuessingView
                        mayor={this.props.mayor}
                        has_chosen={true}
                        role={this.props.role}
                        secret={this.props.secret}
                        other_werewolves={this.props.other_werewolves}
                    />
                );
            case "vote":
                return (
                    <VoteView
                        secret={this.props.secret ?? ""}
                        secret_found={this.props.secret_found === 1}
                        role={this.props.role}
                        werewolf_names={this.props.werewolf_names ?? []}
                        voted_name={this.props.voted_name}
                        other_players={this.props.other_players}
                    />
                );
        }
    }

    public render() {
        return (
            <div className={"player-container " + this.getMayorAndRoleTag()}>
                <SecretRoleCard role={this.props.role} is_mayor={this.props.is_mayor} />
                {this.getMainContent()}
            </div>
        );
    }

    public componentDidUpdate() {
        // Verify that optional input is as expected
        switch (this.props.state) {
            case "choosing":
                if (
                    this.props.is_mayor &&
                    (this.props.words === undefined || this.props.words.length < 3)
                )
                    console.error("Missing input: Not enough words");
                if (this.props.role === "werewolf" && !this.props.other_werewolves)
                    console.error("Missing input: Other werewolves");
                break;
            case "main":
                if (this.props.role !== "villager" && !this.props.secret)
                    console.error("Missing input: Secret word");
                if (this.props.role === "werewolf" && !this.props.other_werewolves)
                    console.error("Missing input: Other werewolves");
                break;
            case "vote":
                if (!this.props.secret) console.error("Missing input: Secret word");
                if (this.props.secret_found === undefined)
                    console.error("Missing input: Secret found status");
                if (this.props.other_players.length < 2)
                    console.error("Missing input: Player names");
                if (
                    this.props.secret_found === 1 &&
                    (this.props.werewolf_names === undefined ||
                        this.props.werewolf_names.length === 0)
                )
                    console.error("Missing input: Werewolf names");
                break;
            default:
                console.error("Invalid state: " + this.props.state);
        }
    }
}
