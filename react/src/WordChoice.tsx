import React from 'react'

import { Connection } from './Context'
import { Countdown } from './Countdown'
import { SecretRole } from './SecretRole'

interface IProps {
  role: string;
  other_werewolfes: string[];
  words: string[];
  seconds_left: number;
}

export class WordChoice extends React.Component<IProps> {
  static contextType = Connection;

  render() {
    const words = this.props.words.map((word, index) => <button onClick={() => this.choose(index)} key={index}>{word}</button>);
    return (
      <div>
        <div>Du bist der Bürgermeister!</div>
        <SecretRole role={this.props.role} other_werewolfes={this.props.other_werewolfes}/>
        <div>Wähle dein Zauberwort:</div>
        <div>{words}</div>
        <Countdown seconds_initial={this.props.seconds_left}/>
      </div>
    );
  }

  choose(index) {
    fetch("choose.php?token=" + this.context.token + "&index=" + index).then().catch(err => console.error(err));
  }
}
