import React from 'react'

import { NameGroup } from './NameGroup'

interface IProps {
  role: string;
  other_werewolfes: string[];
}

export class SecretRole extends React.Component<IProps> {
  render() {
    const message = "Deine geheime Rolle:";
    switch (this.props.role)
    {
      case "werewolf":
        return (
          <>
            <div>{message} <b>Werwolf</b>!</div>
            {this.props.other_werewolfes &&
              <div><NameGroup items={this.props.other_werewolfes} singular="ist auch ein Werwolf." plural="sind auch Werwölfe."/></div>}
          </>
        );
      case "seer": return <div>{message} <b>Seherin</b></div>
      case "villager": return <div>{message} <b>Dorfbewohner</b></div>
      default: return null;
    }
  }
}
