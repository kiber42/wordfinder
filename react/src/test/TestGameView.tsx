import React from 'react'

import { GameView } from '../GameView'

interface ISettings {
  state: string;
  role: string;
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
    switch (this.state.state) {
      case "lobby":
      case "waiting":
        role = "";
        is_mayor = false;
        break;
      case "choosing":
        if (this.state.is_mayor)
          words = ["geheim", "streng geheim", "unheimlich"];
        break;
      case "main":
        if (this.state.is_mayor || role !== "villager")
          words = ["geheim"];
        break;
      case "voting":
        words = ["geheim"];
    }

    let other_werewolves : string[] | undefined;
    if (role === "werewolf")
      other_werewolves = ["Tick", "Trick", "Track"];

    const gameView = <GameView
      state={this.state.state}
      invite_link=""
      num_players={4}
      other_players={[[1, "X"], [2, "Y"], [3, "Z"]]}
      is_mayor={is_mayor}
      mayor="Dieter"
      role={role}
      difficulty={1}
      num_werewolves={1}
      other_werewolves={other_werewolves}
      words={words}
      secret_found={1}
      role_found={0}
      werewolf_names={["Trick", "Track"]}
      seer_name="Gundula"
      received_votes={{"X": ["Y"]}}
      />

    const states = ["lobby", "choosing", "main", "vote", "waiting"].map((state, index) =>
        <label key={index}><input type='radio' checked={state===this.state.state}
               onClick={() => this.setState({state: state})} />{state}</label>);
    const roles = ["villager", "werewolf", "seer"].map((role, index) =>
        <label key={index}><input type='radio' checked={role===this.state.role}
               onClick={() => this.setState({role: role})} />{role}</label>);
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
