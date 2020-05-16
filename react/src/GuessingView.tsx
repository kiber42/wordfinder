import React from 'react'

import { Countdown } from './Countdown'
import { SecretRole } from './SecretRole'

interface IProps {
  role: string;
  secret?: string;
  other_werewolfes: string[];
  seconds_left: number;
}

export class GuessingView extends React.Component<IProps> {
  render() {
    const secret = <div>Das Zauberwort ist: {this.props.secret}</div>;
    let instructions;
    switch (this.props.role) {
      case "werewolf":
        instructions = <div>{secret}<div>Verhindere, dass die anderen es erraten -- aber ohne erkannt zu werden!</div></div>;
        break;
      case "seer":
        instructions = <div>{secret}<div>Hilf den anderen es zu erraten -- aber ohne erkannt zu werden!</div></div>;
        break;
      case "villager": default:
        instructions = <div>Erratet das Zauberwort, ehe die Zeit abläuft!</div>
    }
    return (
      <div>
        <SecretRole role={this.props.role} other_werewolfes={this.props.other_werewolfes}/>
        {instructions}
        <Countdown seconds_initial={this.props.seconds_left}/>
      </div>
    );
  }
}
