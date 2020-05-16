import React from 'react'

import { Connection } from './Context'
import { SecretRole, ISecretRoleProps } from './SecretRole'

interface IProps {
  words: string[];
}

export class WordChoice extends React.Component<IProps & ISecretRoleProps> {
  static contextType = Connection;

  render() {
    const words = this.props.words.map((word, index) => <button onClick={() => this.choose(index)} key={index}>{word}</button>);
    return (
      <div>
        <div>Du bist der Bürgermeister!</div>
        <SecretRole role={this.props.role} other_werewolfes={this.props.other_werewolfes}/>
        <div>Wähle dein Zauberwort:</div>
        <div>{words}</div>
      </div>
    );
  }

  choose(index) {
    fetch("choose.php?token=" + this.context.token + "&index=" + index).then().catch(err => console.error(err));
  }
}
