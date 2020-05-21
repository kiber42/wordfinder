import React, { Component } from 'react'

import { NameGroup } from './NameGroup'

export interface ISecretRoleCardProps {
  role: string;
  is_mayor: boolean;
}

export class SecretRoleCard extends Component<ISecretRoleCardProps> {
  private getTitle() {
    switch (this.props.role)
    {
      case "werewolf": return this.props.is_mayor ? "Bürgermeister-Werwolf" : "Werwolf";
      case "seer": return this.props.is_mayor ? "Bürgermeister-Seherin" : "Seherin";
      case "villager": return this.props.is_mayor ? "Bürgermeister" : "Dorfbewohner";
      default: return null;
    }
  }

  private getCard() {
    if (this.props.is_mayor && this.props.role !== "villager") {
      return (
        <div className="special-mayor">
          <div className="mayor card special"/>
          <div className={this.props.role + " card special"}/>
        </div>
      );
    }

    const tag = this.props.is_mayor ? "mayor" : this.props.role;
    return <div className={tag + " card regular"}/>
  }

  render() {
    return (
      <div className="role">
        {this.getCard()}
        <div className="role-label">
          {this.getTitle()}
        </div>
      </div>
    );
  }
}

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
