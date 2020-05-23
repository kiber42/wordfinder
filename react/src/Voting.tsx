import React, { Component } from 'react'

import { Connection } from './Context'
import { NameGroup } from './NameGroup'
import { Role } from './SecretRole' // eslint-disable-line no-unused-vars

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

export class VoteView extends Component<IVoteViewProps & IVoteProps> {
  render() {
    const isWerewolf = this.props.role === "werewolf";
    const hasVote = !this.props.secret_found || isWerewolf;
    const votePrompt : string = this.props.secret_found ?
      "Finde die Seherin, um die Partie zu gewinnen!" :
      "Stimmt jetzt darüber ab, wen ihr für den Werwolf haltet!";
    return (
    <div className="player-info">
      {this.props.secret_found ?
        <div className="secret-message">Das Zauberwort <div className="secret">{this.props.secret}</div> wurde erraten!</div> :
        <div className="secret-message">Ihr habt das Zauberwort <div className="secret">{this.props.secret}</div> nicht gefunden!</div>
      }
      {hasVote ?
        <div>{votePrompt}<Vote other_players={this.props.other_players} voted_name={this.props.voted_name}/></div> :
        (<>
          <div><NameGroup items={this.props.werewolf_names} singular="ist der Werwolf!" plural="sind die Werwölfe!"/></div>
          <div>Werwolf, finde die Seherin!</div>
        </>)
      }
    </div>
    );
  }
}

class Vote extends Component<IVoteProps> {
  static contextType = Connection;

  render() {
    if (this.props.voted_name)
      return <div>Du hast für <b>{this.props.voted_name}</b> gestimmt. Warte auf andere Spieler.</div>
    const choices = this.props.other_players.map((player) =>
      <button onClick={() => this.choose(player[0])} key={player[0]}>{player[1]}</button>);
    return <div>{choices}</div>
  }

  choose(index) {
    fetch("vote.php?token=" + this.context.token + "&id=" + index).then().catch(err => console.error(err));
  }
}
