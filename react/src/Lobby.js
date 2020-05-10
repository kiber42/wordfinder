import React, { Component } from 'react';
import copy from 'copy-to-clipboard';

import { Connection } from './Context';

class LobbyView extends Component {
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

class Difficulty extends Component {
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

class NumWerewolves extends Component {
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

class Invite extends Component {
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

export default LobbyView;
