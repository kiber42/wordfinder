import React, { Component } from 'react'
import copy from 'copy-to-clipboard'

import { Connection } from './Context'
import { Difficulty, NumWerewolves } from './Settings'

interface LobbyViewProps {
  difficulty: number;
  invite_link: string;
  num_players: number;
  num_werewolves: number;
}

export class LobbyView extends Component<LobbyViewProps> {
  static contextType = Connection;

  render() {
    let startButton;
    if (this.props.num_players >= 3)
      startButton = <button onClick={() => this.startGame()}>Spiel starten!</button>
    else
      startButton = <button disabled>Warte auf Mitspieler...</button>
    return (
      <>
        <div className="startbutton">
          {startButton}
        </div>
        <div className="settings-container">
          <Difficulty current={this.props.difficulty}/>
          <NumWerewolves current={this.props.num_werewolves} num_players={this.props.num_players}/>
        </div>
        <Invite link={this.props.invite_link}/>
      </>
    );
  }

  startGame() {
    fetch("start.php?token=" + this.context.token).then().catch(err => console.error(err));
  }
}

interface InviteProps {
  link: string;
}

class Invite extends Component<InviteProps> {
  render() {
    return (
      <div className="invite-link-container">
        <div className="invite-link-message">Mit diesem Link kannst du weitere Spieler einladen:</div>
        <div className="invite-link">
          <input type="text" id="link" value={this.props.link} readOnly/>
          <button onClick={() => copy(this.props.link)}>📋</button>
        </div>
      </div>
    );
  }
}
