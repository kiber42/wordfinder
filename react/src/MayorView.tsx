import React from 'react';

import { Connection } from './Context'
import { OtherWerewolves, IOtherWerewolvesProps } from './SecretRole' // eslint-disable-line no-unused-vars

interface IProps {
  role: string;
  secret?: string;
  words?: string[];
}

export class MayorView extends React.Component<IProps & IOtherWerewolvesProps> {
  static contextType = Connection;

  private getInstructions() {

    const instructions = {
      "werewolf": "Mache es den Ratern möglichst schwer, ohne dass sie dir auf die Schliche kommen!",
      "seer": "Mache es den Ratern möglichst einfach, ohne dass der Werwolf dich erkennt!",
      "villager": "Viel Erfolg!"
    };
    return (
      <div className="instructions">
        <div>Die anderen müssen das Wort erraten, aber du darfst nur mit Ja, Nein, und Vielleicht antworten.</div>
        <div>{instructions[this.props.role]}</div>
      </div>
    );
  }

  render() {
    if (this.props.words) {
      const words = this.props.words.map((word, index) => <button onClick={() => this.choose_word(index)} key={index}>{word}</button>);
      return (
        <div className="player-info">
          <div className="instructions">Wähle dein Zauberwort:</div>
          <div>{words}</div>
          <OtherWerewolves other_werewolves={this.props.other_werewolves}/>
        </div>
      );
    }

    if (this.props.secret) {
      return (
        <div className="player-info">
          <div className="secret-message">Das Zauberwort ist: <div className="secret">{this.props.secret}</div></div>
          {this.getInstructions()}
          <OtherWerewolves other_werewolves={this.props.other_werewolves}/>
          <button onClick={() => this.secret_found()}>Das Wort wurde erraten!</button>
        </div>
      );
    }

    console.error("No words available");
    return <div>Fehler!</div>
  }

  choose_word(index) {
    fetch("choose.php?token=" + this.context.token + "&index=" + index).then().catch(err => console.error(err));
  }

  secret_found() {
    fetch("found.php?token=" + this.context.token).then().catch(err => console.error(err));
  }
}
