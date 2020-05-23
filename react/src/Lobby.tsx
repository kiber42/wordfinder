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

class LobbyView extends Component<LobbyViewProps> {
  static contextType = Connection;

  render() {
    let startButton;
    if (this.props.num_players >= 3)
      startButton = <div>Alle da? Dann <button onClick={() => this.startGame()}>Spiel starten!</button></div>
    else
      startButton = <div>In der Lobby, warte auf Mitspieler.</div>
    return (
      <div>
        <Difficulty current={this.props.difficulty}/>
        <NumWerewolves current={this.props.num_werewolves} num_players={this.props.num_players}/>
        {startButton}
        <Invite link={this.props.invite_link}/>
      </div>
    );
  }

  startGame() {
    fetch("start.php?token=" + this.context.token).then().catch(err => console.error(err));
  }
}

interface InviteProps {
  link: string
}

class Invite extends Component<InviteProps> {
  render() {
    return (
      <div>
        <div>Verwende diesen Link, um Mitspieler einzuladen:</div>
        <div>
          <input type="text" size={this.props.link.length} id="link" value={this.props.link} readOnly/>
          <button onClick={() => copy(this.props.link)}>Link kopieren</button>
        </div>
      </div>
    );
  }
}

export { LobbyView };
