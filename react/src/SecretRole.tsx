import React from 'react'

import { NameGroup } from './NameGroup'

export interface ISecretRoleProps {
  role: string;
  other_werewolfes?: string[];
}

export class SecretRole extends React.Component<ISecretRoleProps> {
  render() {
    const message = "Deine geheime Rolle:";
    switch (this.props.role)
    {
      case "werewolf":
        return (
          <>
            <div>{message} <b>Werwolf</b>!</div>
            {this.props.other_werewolfes !== undefined && this.props.other_werewolfes.length > 0 &&
              <div><NameGroup items={this.props.other_werewolfes} singular="ist auch ein Werwolf." plural="sind auch Werwölfe."/></div>}
          </>
        );
      case "seer": return <div>{message} <b>Seherin</b></div>
      case "villager": return <div>{message} <b>Dorfbewohner</b></div>
      default: return null;
    }
  }
}
