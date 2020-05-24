import React, { Component } from 'react'

import { NameGroup } from './NameGroup'

interface IResultViewProps extends IVoteResultProps {
  secret_found?: number;
  role_found?: number;
  werewolf_names: string[];
  seer_name: string;
}

export class ResultView extends Component<IResultViewProps> {
  render() {
    if (this.props.secret_found === undefined || this.props.role_found === undefined)
      return null;

    // Secret found and seer found => Werewolf wins
    // Secret not found and wolf not found => Werewolf wins
    const werewolf_won = !!this.props.secret_found === !!this.props.role_found;
    const werewolf = werewolf_won ?
      <div>Werwolf <NameGroup items={this.props.werewolf_names} singular="hat" plural="haben"/> gewonnen!</div> :
      <div><NameGroup items={this.props.werewolf_names} singular="war der Werwolf" plural="waren die Werwölfe"/>.</div>;
    const seer = <div><b>{this.props.seer_name}</b> war die Seherin.</div>;

    return (
      <div className="results-container">
        <div className="results-title">Runde zu Ende</div>
        <div className="results">
          {!werewolf_won && <div>Die Dorfbewohner haben gewonnen!</div>}
          {werewolf}
          {seer}
        </div>
        <VoteResults received_votes={this.props.received_votes}/>
      </div>
    );
  }
}

interface IVoteResultProps {
  received_votes: { [votee: string] : string[] };
}

class VoteResults extends Component<IVoteResultProps> {
  render() {
    const votes = this.props.received_votes;
    const vote_recipients = Object.keys(votes);
    if (vote_recipients.length === 0)
      return <div className="vote-results-container">Niemand hat abgestimmt!</div>

    const list = vote_recipients.map((vote_recipient, index) => {
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
