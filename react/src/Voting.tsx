import React, {useContext} from "react";

import {Connection} from "./Context";
import {NameGroup} from "./NameGroup";
import {Role} from "./SecretRole";

interface IVoteViewProps {
    role: Role;
    secret_found: boolean;
    secret: string;
    werewolf_names: string[];
}

interface IVoteProps {
    other_players: [number, string][];
    voted_name?: string;
}

export function VoteView(props: IVoteViewProps & IVoteProps) {
    const isWerewolf = props.role === "werewolf";
    const hasVote = !props.secret_found || isWerewolf;
    const votePrompt: string = props.secret_found
        ? "Finde die Seherin, um die Partie zu gewinnen!"
        : "Stimmt jetzt darüber ab, wen ihr für den Werwolf haltet!";
    return (
        <div className="player-info">
            {props.secret_found ? (
                <div className="secret-message">
                    Das Zauberwort <div className="secret">{props.secret}</div> wurde erraten!
                </div>
            ) : (
                <div className="secret-message">
                    Ihr habt das Zauberwort <div className="secret">{props.secret}</div> nicht
                    gefunden!
                </div>
            )}
            {hasVote ? (
                <div>
                    <div>{votePrompt}</div>
                    <Vote other_players={props.other_players} voted_name={props.voted_name} />
                </div>
            ) : (
                <>
                    <div>
                        <NameGroup
                            items={props.werewolf_names}
                            singular="ist der Werwolf!"
                            plural="sind die Werwölfe!"
                        />
                    </div>
                    <div>Werwolf, finde die Seherin!</div>
                </>
            )}
        </div>
    );
}

function Vote(props: IVoteProps) {
    const connection = useContext(Connection);
    if (props.voted_name)
        return (
            <div>
                Du hast für <b>{props.voted_name}</b> gestimmt. Warte auf andere Spieler.
            </div>
        );
    const choices = props.other_players.map((player) => (
        <button onClick={() => choose(player[0], connection.token)} key={player[0]}>
            {player[1]}
        </button>
    ));
    return <div className="namelist">{choices}</div>;
}

function choose(index: number, token: number) {
    fetch("vote.php?token=" + token + "&id=" + index)
        .then()
        .catch((err) => console.error(err));
}
