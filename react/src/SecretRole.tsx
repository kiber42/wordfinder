import React, { Component } from 'react'

import { NameGroup } from './NameGroup'

export interface ISecretRoleProps extends IOtherWerewolvesProps {
  role: string;
}

export class SecretRole extends Component<ISecretRoleProps> {
  render() {
    const message = "Deine geheime Rolle:";
    switch (this.props.role)
    {
      case "werewolf":
        return (
          <>
            <div>{message} <b>Werwolf</b>!</div>
            <OtherWerewolves other_werewolves={this.props.other_werewolves}/>
          </>
        );
      case "seer": return <div>{message} <b>Seherin</b></div>
      case "villager": return <div>{message} <b>Dorfbewohner</b></div>
      default: return null;
    }
  }
}

export interface IOtherWerewolvesProps {
  other_werewolves?: string[];
}

export class OtherWerewolves extends Component<IOtherWerewolvesProps> {
  render() {
    if (this.props.other_werewolves !== undefined && this.props.other_werewolves.length > 0)
      return <div><NameGroup items={this.props.other_werewolves} singular="ist auch ein Werwolf." plural="sind auch Werwölfe."/></div>;
    return null;
  }
}
