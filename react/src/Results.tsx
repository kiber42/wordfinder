import React, { Component } from 'react'

import { NameGroup } from './NameGroup'

interface IResultViewProps extends IVoteResultProps {
  secret_found?: number;
  role_found?: number;
  werewolf_names: string[];
  seer_name: string;
}

export class ResultView extends Component<IResultViewProps> {
  private getWinnerMessage() {
    // Secret found and seer found => Werewolf wins
    // Secret not found and wolf not found => Werewolf wins
    if (!!this.props.secret_found === !!this.props.role_found) {
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
    if (this.props.secret_found === undefined || this.props.role_found === undefined)
      return null;
    return (
      <div>
        <div>Die Runde ist zu Ende:</div>
        <VoteResults received_votes={this.props.received_votes}/>
        <div><b>{this.props.seer_name}</b> war die Seherin.</div>
        {this.getWinnerMessage()}
      </div>
    );
  }
}

interface IVoteResultProps {
  received_votes?: { [votee: string] : string[] };
}

class VoteResults extends Component<IVoteResultProps> {
  render() {
    if (!this.props.received_votes)
      return null;
    const votes = this.props.received_votes;
    const list = Object.keys(votes).map((vote_recipient, index) => {
      const voters = votes[vote_recipient];
      return (
        <li key={index} className="vote-result">
          <NameGroup items={voters} singular="stimmte" plural="stimmten"/> für <b>{vote_recipient}</b>
        </li>
      );
    });
    return <ul className="vote-results-container">{list}</ul>
  }
}
