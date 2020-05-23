import React, { Component } from 'react'

import { Connection } from './Context'

interface DifficultyProps {
  current: number
}

export class Difficulty extends Component<DifficultyProps> {
  static contextType = Connection;

  static levels = ["leicht", "normal", "schwer", "unmöglich"];

  render() {
    const choices = Difficulty.levels.map((level, index) =>
      <label key={index}><input type='radio' checked={index===this.props.current} onClick={() => this.setDifficulty(index)} />{level}</label>);
    return <div>Schwierigkeit: {choices}</div>
  }

  setDifficulty(level) {
    fetch("settings.php?token=" + this.context.token + "&difficulty=" + level).then().catch(err => console.error(err));
  }
}

interface NumWerewolvesProps {
  current: number,
  num_players: number
}

export class NumWerewolves extends Component<NumWerewolvesProps> {
  static contextType = Connection;

  render() {
    const choices = [1, 2].map(n =>
      <label key={n}><input type='radio' checked={n===this.props.current} onClick={() => this.setNumber(n)} />{n}</label>);
    const recommended = this.props.num_players <= 6 ? 1 : 2;
    return <div>Anzahl Werwölfe: {choices} (empfohlen: {recommended})</div>
  }

  setNumber(n) {
    fetch("settings.php?token=" + this.context.token + "&num_werewolves=" + n).then().catch(err => console.error(err));
  }
}
