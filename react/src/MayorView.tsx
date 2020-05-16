import React from 'react';

import { Connection } from './Context'

import './main.css'

interface IProps {
  role: string;
  secret: string;
  seconds_left?: number;
}

export class MayorView extends React.Component<IProps> {
  static contextType = Connection;

  render() {
    let title = "der Bürgermeister";
    let instructions = "Viel Erfolg!";
    switch (this.props.role) {
      case "werewolf":
        title = "der Bürgermeister-Werwolf";
        instructions = "Mache es den Ratern möglichst schwer, ohne dass sie dir auf die Schliche kommen!";
        break;
      case "seer":
        title = "die Bürgermeister-Seherin";
        instructions = "Mache es den Ratern möglichst einfach, ohne dass der Werwolf dich erkennt!";
        break;
      default:
        break;
    }
    return (
      <>
      <div className="mayor-container">
        <div className="mayor-info">
          <div>Du bist {title}!</div>
          <div>Die anderen müssen das Wort erraten, aber du darfst nur mit Ja, Nein, und Vielleicht antworten.</div>
          <div>Das Zauberwort ist: {this.props.secret}</div>
          <div>{instructions}</div>
          <button onClick={() => this.secret_found()}>Das Wort wurde erraten!</button>
        </div>
      </div>
      </>
    );
  }

  secret_found() {
    fetch("found.php?token=" + this.context.token).then().catch(err => console.error(err));
  }
}
