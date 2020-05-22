import React from 'react'

import { GameView } from '../GameView'
import { Role } from '../SecretRole' // eslint-disable-line no-unused-vars

interface ISettings {
  state: "choosing" | "main" | "vote";
  role: Role;
  is_mayor: boolean;
}

export class TestGameView extends React.Component<ISettings, ISettings> {
  constructor(props) {
    super(props);
    this.state = {
      state: this.props.state,
      role: this.props.role,
      is_mayor: this.props.is_mayor
    };
  }

  render() {
    let role = this.state.role;
    let is_mayor = this.state.is_mayor;
    let words : string[] | undefined;
    let secret : string | undefined;
    switch (this.state.state) {
      case "choosing":
        if (this.state.is_mayor)
          words = ["geheim", "streng geheim", "unheimlich"];
        break;
      case "main":
        if (this.state.is_mayor || role !== "villager")
          secret = "geheim";
        break;
      case "vote":
        secret = "geheim";
    }

    let other_werewolves : string[] | undefined;
    if (role === "werewolf")
      other_werewolves = ["Tick", "Trick", "Track"];

    const gameView = <GameView
      state={this.state.state}
      other_players={[[1, "X"], [2, "Y"], [3, "Z"]]}
      is_mayor={is_mayor}
      mayor="Dieter"
      role={role}
      other_werewolves={other_werewolves}
      words={words}
      secret={secret}
      secret_found={1}
      werewolf_names={["Trick", "Track"]}
      />

    const states = ["choosing", "main", "vote"].map((state, index) =>
        <label key={index}><input type='radio' checked={state===this.state.state}
               onClick={() => this.setState({state: state as any})} />{state}</label>);
    const roles = ["villager", "werewolf", "seer"].map((role, index) =>
        <label key={index}><input type='radio' checked={role===this.state.role}
               onClick={() => this.setState({role: role as Role})} />{role}</label>);
    const mayor = ["yes", "no"].map((is_mayor, index) =>
        <label key={index}><input type='radio' checked={(index===0)===this.state.is_mayor}
               onClick={() => this.setState({is_mayor: index===0})} />{is_mayor}</label>);
    return (
      <>
        <div>State: {states}</div>
        <div>Role: {roles}</div>
        <div>Mayor: {mayor}</div>
        {gameView}
      </>
    );
  }
}
