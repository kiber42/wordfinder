import React, { Component } from 'react'
import copy from 'copy-to-clipboard'

import { Connection } from './Context'

interface LobbyViewProps {
  difficulty: number,
  invite_link: string,
  num_players: number,
  num_werewolves: number
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

interface DifficultyProps {
  current: number
};

class Difficulty extends Component<DifficultyProps> {
  static contextType = Connection;

  static levels = ["leicht", "normal", "schwer", "unmöglich"];

  render() {
    const choices = Difficulty.levels.map((level, index) =>
      <label><input type='radio' checked={index===this.props.current} onClick={() => this.setDifficulty(index)} key={index} />{level}</label>);
    return <div>Schwierigkeit: {choices}</div>
  }

  setDifficulty(level) {
    fetch("settings.php?token=" + this.context.token + "&difficulty=" + level).then().catch(err => console.error(err));
  }
}

interface NumWerewolvesProps {
  current: number,
  num_players: number
};

class NumWerewolves extends Component<NumWerewolvesProps> {
  static contextType = Connection;

  render() {
    const choices = [1, 2].map(n =>
      <label><input type='radio' checked={n===this.props.current} onClick={() => this.setNumber(n)} key={n} />{n}</label>);
    const recommended = this.props.num_players <= 6 ? 1 : 2;
    return <div>Anzahl Werwölfe: {choices} (empfohlen: {recommended})</div>
  }

  setNumber(n) {
    fetch("settings.php?token=" + this.context.token + "&num_werewolves=" + n).then().catch(err => console.error(err));
  }
}

interface InviteProps {
  link: string
};

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
