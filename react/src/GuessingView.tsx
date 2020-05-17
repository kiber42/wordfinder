import React from 'react'

import { SecretRole, ISecretRoleProps } from './SecretRole' // eslint-disable-line no-unused-vars

interface IProps {
  secret?: string;
}

export class GuessingView extends React.Component<IProps & ISecretRoleProps> {
  private getInstructions() {
    switch (this.props.role) {
      case "werewolf":
        return "Verhindere, dass die anderen es erraten — aber ohne erkannt zu werden!";
      case "seer":
        return "Hilf den anderen es zu erraten — aber ohne erkannt zu werden!"
      default:
        return "Erratet das Zauberwort, ehe die Zeit abläuft!";
    }
  }

  render() {
    return (
      <div className="player-info">
        {this.props.secret && <div>Das Zauberwort ist: <b>{this.props.secret}</b></div>}
        <div>{this.getInstructions()}</div>
      </div>
    );
  }
}
