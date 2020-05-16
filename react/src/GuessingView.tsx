import React from 'react'

import { SecretRole, ISecretRoleProps } from './SecretRole' // eslint-disable-line no-unused-vars

interface IProps {
  secret?: string;
}

export class GuessingView extends React.Component<IProps & ISecretRoleProps> {
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
      <>
        <SecretRole role={this.props.role} other_werewolfes={this.props.other_werewolfes}/>
        {instructions}
      </>
    );
  }
}
