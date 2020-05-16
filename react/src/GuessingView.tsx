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
      <div className={"player-container " + this.props.role + "-container"}>
        <div className="player-info">
          {this.props.secret && <div>Das Zauberwort ist: {this.props.secret}</div>}
          <SecretRole role={this.props.role} other_werewolves={this.props.other_werewolves}/>
          {this.getInstructions()}
        </div>
      </div>
    );
  }
}
