import React from 'react'

import { OtherWerewolves, IOtherWerewolvesProps } from './SecretRole' // eslint-disable-line no-unused-vars

interface IProps {
  mayor: string;
  has_chosen: boolean;
  role: string;
  secret?: string;
}

export class GuessingView extends React.Component<IProps & IOtherWerewolvesProps> {
  private getInstructions() {
    if (!this.props.has_chosen)
      return <div className="instructions wait">Bürgermeister <b>{this.props.mayor}</b> wählt das Zauberwort aus.</div>

    const instructions = {
      "werewolf": "Verhindere, dass die anderen es erraten — aber ohne erkannt zu werden!",
      "seer": "Hilf den anderen es zu erraten — aber ohne erkannt zu werden!",
      "villager": "Erratet das Zauberwort, ehe die Zeit abläuft!"
    };
    return <div className="instructions">{instructions[this.props.role]}</div>
  }

  render() {
    return (
      <div className="player-info">
        {this.props.secret && <div className="secret-message">Das Zauberwort ist: <div className="secret">{this.props.secret}</div></div>}
        {this.getInstructions()}
        <OtherWerewolves other_werewolves={this.props.other_werewolves}/>
      </div>
    );
  }

}
