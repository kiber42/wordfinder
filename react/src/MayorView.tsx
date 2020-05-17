import React from 'react';

import { Connection } from './Context'
import { SecretRole, ISecretRoleProps } from './SecretRole' // eslint-disable-line no-unused-vars

interface IProps {
  role: string;
  secret?: string;
  words?: string[];
}

export class MayorView extends React.Component<IProps & ISecretRoleProps> {
  static contextType = Connection;

  private getTitle() {
    switch (this.props.role) {
      case "werewolf":
        return "der Bürgermeister-Werwolf";
      case "seer":
        return "die Bürgermeister-Seherin";
      default:
        return "der Bürgermeister";
    }
  }

  private getInstructions() {
    switch (this.props.role) {
      case "werewolf":
        return "Mache es den Ratern möglichst schwer, ohne dass sie dir auf die Schliche kommen!";
      case "seer":
        return "Mache es den Ratern möglichst einfach, ohne dass der Werwolf dich erkennt!"
      default:
        return "Viel Erfolg!";
    }
  }

  render() {
    if (this.props.words)
    {
      const words = this.props.words.map((word, index) => <button onClick={() => this.choose_word(index)} key={index}>{word}</button>);
      return (
        <div className="player-container mayor-container">
          <div className="player-info">
            <div>Du bist der Bürgermeister!</div>
            <SecretRole role={this.props.role} other_werewolves={this.props.other_werewolves}/>
            <div>Wähle dein Zauberwort:</div>
            <div>{words}</div>
          </div>
        </div>
      );
    }

    return (
      <>
      <div className="player-container mayor-container">
        <div className="player-info">
          <div>Du bist {this.getTitle()}!</div>
          <div>Die anderen müssen das Wort erraten, aber du darfst nur mit Ja, Nein, und Vielleicht antworten.</div>
          <div>Das Zauberwort ist: {this.props.secret}</div>
          <div>{this.getInstructions()}</div>
          <button onClick={() => this.secret_found()}>Das Wort wurde erraten!</button>
        </div>
      </div>
      </>
    );
  }

  choose_word(index) {
    fetch("choose.php?token=" + this.context.token + "&index=" + index).then().catch(err => console.error(err));
  }

  secret_found() {
    fetch("found.php?token=" + this.context.token).then().catch(err => console.error(err));
  }
}
