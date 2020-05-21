import React, { Component } from 'react'

import { NameGroup } from './NameGroup'

interface IResultViewProps {
  secret_found: boolean;
  role_found: boolean;
  werewolf_names: string[];
  seer_name: string;
  received_votes?: { [votee: string] : string[] };
}

export class ResultView extends Component<IResultViewProps> {
  private getWinnerMessage() {
    // Secret found and seer found => Werewolf wins
    // Secret not found and wolf not found => Werewolf wins
    if (this.props.secret_found === this.props.role_found) {
      return <div>Werwolf <NameGroup items={this.props.werewolf_names} singular="hat" plural="haben"/> gewonnen!</div>
    }
    return (
      <div>
        <div><NameGroup items={this.props.werewolf_names} singular="war der Werwolf" plural="waren die Werwölfe"/>.</div>
        <div>Die Dorfbewohner haben gewonnen!</div>
      </div>
      );
  }

  render() {
    return (
      <div>
        <div>Die Runde ist zu Ende:</div>
        {this.props.received_votes && <VoteResults received_votes={this.props.received_votes}/>}
        <div><b>{this.props.seer_name}</b> war die Seherin.</div>
        {this.getWinnerMessage()}
      </div>
    );
  }
}

interface IVoteResults {
  received_votes: { [votee: string] : string[] };
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
