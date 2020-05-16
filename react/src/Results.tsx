import React, { Component } from 'react'

import { NameGroup } from './NameGroup'

interface IResultViewProps {
  winner: string;
  werewolf_names: string[];
  seer_name: string;
  received_votes?: [string, string[]][];
}

export class ResultView extends Component<IResultViewProps> {
  render() {
    let winner;
    if (this.props.winner === "werewolf")
      winner = <div>Werwolf <NameGroup items={this.props.werewolf_names} singular="hat" plural="haben"/> gewonnen!</div>
    else
      winner = (
        <div>
          <div><NameGroup items={this.props.werewolf_names} singular="war der Werwolf" plural="waren die Werwölfe"/>.</div>
          <div>Die Dorfbewohner haben gewonnen!</div>
        </div>
        );
    return (
      <div>
        <div>Die Runde ist zu Ende:</div>
        (this.props.received_votes && <VoteResults received_votes={(this.props.received_votes as [string, string[]][])}/>)
        <div><b>{this.props.seer_name}</b> war die Seherin.</div>
        {winner}
      </div>
    );
  }
}

interface IVoteResults {
  received_votes: [string, string[]][];
}

class VoteResults extends Component<IVoteResults> {
  render() {
    const list = Object.keys(this.props.received_votes).map((vote_recipient, index) => {
      const voters = this.props.received_votes[vote_recipient];
      return <li key={index}><NameGroup items={voters} singular="stimmte" plural="stimmten"/> für <b>{vote_recipient}</b></li>
    });
    return <ul>{list}</ul>
  }
}


