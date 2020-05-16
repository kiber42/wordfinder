import React, { Component } from 'react'

import { Connection } from './Context'
import { Countdown } from './Countdown'
import { NameGroup } from './NameGroup'

interface IVoteViewProps {
  role: string;
  secret_found: boolean;
  secret: string;
  werewolf_names: string[];
  seconds_left: number;
}

interface IVoteProps {
  players: string[];
  voted_name?: string;
}

export class VoteView extends Component<IVoteViewProps & IVoteProps> {
  render() {
    const isWerewolf = this.props.role === "werewolf";
    const hasVote = !this.props.secret_found || isWerewolf;
    const prompt : string = hasVote ?
      (isWerewolf ?
        "Finde die Seherin, um die Partie zu gewinnen!" :
        "Stimmt jetzt darüber ab, wen ihr für den Werwolf haltet!") :
      "Werwolf, finde die Seherin!";
    return (
    <>
      (this.props.secret_found ?
        <div>Das Zauberwort <b>{this.props.secret}</b> wurde erraten!</div> :
        <div>Ihr habt das Zauberwort <b>{this.props.secret}</b> nicht gefunden!</div>
      )
      (hasVote ?
        <Vote players={this.props.players} voted_name={this.props.voted_name}/> :
        <div><NameGroup items={this.props.werewolf_names} singular="ist der Werwolf" plural="sind die Werwölfe"/>!</div>
      )
      <div>{prompt}</div>
      <div><Countdown seconds_initial={this.props.seconds_left}/></div>
    </>
    );
  }
}

class Vote extends Component<IVoteProps> {
  static contextType = Connection;

  render() {
    if (this.props.voted_name !== undefined)
      return <div>Du hast für <b>{this.props.voted_name}</b> gestimmt. Warte auf andere Spieler.</div>
    const choices = this.props.players.map((item) => <button onClick={() => this.choose(item[0])} key={item[0]}>{item[1]}</button>);
    return <div>{choices}</div>
  }

  choose(index) {
    fetch("vote.php?token=" + this.context.token + "&id=" + index).then().catch(err => console.error(err));
  }
}
