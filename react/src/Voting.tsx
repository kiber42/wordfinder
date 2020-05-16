import React, { Component } from 'react'

import { Connection } from './Context'
import { Countdown } from './Countdown'
import { NameGroup } from './NameGroup'

interface IVoteViewProps {
  role: string;
  players: string[];
  werewolf_names: string[];
  voted_name?: string;
  secret_found: boolean;
  secret: string;
  seconds_left: number;
}

export class VoteView extends Component<IVoteViewProps> {
  render() {
    let vote;
    if (!this.props.secret_found)
      vote = <VillagerVote secret={this.props.secret} players={this.props.players} voted_name={this.props.voted_name}/>;
    else if (this.props.role === "werewolf")
       vote = <WolfVote secret={this.props.secret} players={this.props.players} voted_name={this.props.voted_name}/>;
    else vote = (
      <div>
        <div>Das Zauberwort <b>{this.props.secret}</b> wurde erraten!</div>
        <div><NameGroup items={this.props.werewolf_names} singular="ist der Werwolf" plural="sind die Werwölfe"/>!</div>
        <div>Werwolf, finde die Seherin!</div>
      </div>
    );
    return <div>{vote}<Countdown seconds_initial={this.props.seconds_left}/></div>
  }
}

interface IVotePromptProps {
  secret: string;
  players: string[];
  voted_name: string;
}

class WolfVote extends Component<IVotePromptProps> {
  render() {
    return (
      <div>
        <div>Das Zauberwort <b>{this.props.secret}</b>wurde erraten!</div>
        <div>Finde die Seherin, um die Partie zu gewinnen!</div>
        <Vote players={this.props.players} voted_name={this.props.voted_name}/>
      </div>
    );
  }
}

class VillagerVote extends Component<IVotePromptProps> {
  render() {
    return (
      <div>
        <div>Ihr habt das Zauberwort <b>{this.props.secret}</b> nicht gefunden!</div>
        <div>Stimmt jetzt darüber ab, wen ihr für den Werwolf haltet!</div>
        <Vote players={this.props.players} voted_name={this.props.voted_name}/>
      </div>
    );
  }
}

interface IVoteProps {
  players: string[];
  voted_name: string;
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
