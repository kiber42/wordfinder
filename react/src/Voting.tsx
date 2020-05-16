import React, { Component } from 'react'

import { Connection } from './Context'
import { NameGroup } from './NameGroup'

interface IVoteViewProps {
  role: string;
  secret_found: boolean;
  secret: string;
  werewolf_names: string[];
}

interface IVoteProps {
  players: [number, string][];
  voted_name?: string;
}

export class VoteView extends Component<IVoteViewProps & IVoteProps> {
  render() {
    const isWerewolf = this.props.role === "werewolf";
    const hasVote = !this.props.secret_found || isWerewolf;
    const votePrompt : string = isWerewolf ?
      "Finde die Seherin, um die Partie zu gewinnen!" :
      "Stimmt jetzt darüber ab, wen ihr für den Werwolf haltet!";
    return (
    <>
      {this.props.secret_found ?
        <div>Das Zauberwort <b>{this.props.secret}</b> wurde erraten!</div> :
        <div>Ihr habt das Zauberwort <b>{this.props.secret}</b> nicht gefunden!</div>
      }
      {hasVote ?
        <div>{votePrompt}<Vote players={this.props.players} voted_name={this.props.voted_name}/></div> :
        (<div>
          <NameGroup items={this.props.werewolf_names} singular="ist der Werwolf!" plural="sind die Werwölfe!"/>
          <div>Werewolf, finde die Seherin!</div>
        </div>)
      }
    </>
    );
  }
}

class Vote extends Component<IVoteProps> {
  static contextType = Connection;

  render() {
    if (this.props.voted_name)
      return <div>Du hast für <b>{this.props.voted_name}</b> gestimmt. Warte auf andere Spieler.</div>
    const choices = this.props.players.map((player) =>
      <button onClick={() => this.choose(player[0])} key={player[0]}>{player[1]}</button>);
    return <div>{choices}</div>
  }

  choose(index) {
    fetch("vote.php?token=" + this.context.token + "&id=" + index).then().catch(err => console.error(err));
  }
}
