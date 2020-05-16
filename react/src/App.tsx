import React, { Component } from 'react'

import { Connection } from './Context'

import { GameView } from './GameView'
import { Login } from './Login'

import './App.css'

interface IProps {
  token?: number;
  room_name?: string;
}

interface IState {
  is_valid: boolean;
  connected: boolean;
  error: "";
  token?: number;
  nickname: string;
  room_name: string;
  game_state: string;
  players: [number, string][];
  players_waiting?: [number, string][];
  player_role: string;
  is_mayor: boolean;
  mayor?: string;
  difficulty: number;
  num_werewolves: number;
  words?: string[];
  secret_found?: number;
  role_found?: number;
  werewolf_names?: string[];
  other_werewolfes?: string[];
  seer_name?: string;
  voted_name?: string;
  received_votes?: [string, string[]][];
  seconds_left?: number;
  invite_link: string;
}

export class App extends Component<IProps, IState> {
  private refresh_timer?: number;
  private timeout_timer?: number;

  constructor(props) {
    super(props);
    this.state = {
      is_valid: false,
      connected: false,
      error: "",
      token: this.props.token,
      nickname: "",
      room_name: "",
      game_state: "",
      players: [],
      player_role: "",
      is_mayor: false,
      difficulty: 1,
      num_werewolves: 1,
      invite_link: ""
    }
  }

  enterRoom(room_name, player_token)
  {
    this.setState({token: player_token});
    window.history.pushState({"token": player_token}, "Werewords " + room_name, "?token=" + player_token);
  }

  render() {
    if (!this.state.token)
      return <Login room_name={this.props.room_name} tokenAvailable={this.enterRoom.bind(this)}/>

    if (this.state.is_valid) {
      const active_players = this.state.players.map((player) => player[1]);
      const waiting_players = this.state.players_waiting ? this.state.players_waiting.map((player) => player[1]) : [];
      let items = <>
          <Welcome name={this.state.nickname} room={this.state.room_name}/>
          <Teammates active={active_players} waiting={waiting_players}/>
          <GameView state={this.state.game_state}
                    role={this.state.player_role}
                    is_mayor={this.state.is_mayor}
                    mayor={this.state.mayor}
                    difficulty={this.state.difficulty}
                    num_werewolves={this.state.num_werewolves}
                    words={this.state.words}
                    secret_found={this.state.secret_found}
                    role_found={this.state.role_found}
                    werewolf_names={this.state.werewolf_names}
                    other_werewolfes={this.state.other_werewolfes}
                    seer_name={this.state.seer_name}
                    voted_name={this.state.voted_name}
                    received_votes={this.state.received_votes}
                    players={this.state.players}
                    num_players={this.state.players.length + 1}
                    seconds_left={this.state.seconds_left}
                    invite_link={this.state.invite_link}/>
      </>
      if (!this.state.connected)
        items = <>{items}<div>No connection to server!</div></>

      return (
        <Connection.Provider value={{token: this.state.token}}>
          {items}
        </Connection.Provider>
      );
    }

    if (this.state.error)
      return <div>Server meldet Fehler: {this.state.error}</div>

    return <div>Waiting for server response...</div>
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillUnmount() {
    clearTimeout(this.refresh_timer);
  }

  refresh() {
    if (!this.state.token)
    {
      // User did not join a room yet, do not request state
      this.refresh_timer = setTimeout((this.refresh.bind(this)) as TimerHandler, 200);
      return;
    }

    this.timeout_timer = setTimeout((() => this.setState({connected : false})) as TimerHandler, 5000);
    fetch("state.php?token=" + this.state.token)
    .then(result => result.json())
    .catch((err) => {
      this.refresh_timer = setTimeout((this.refresh.bind(this)) as TimerHandler, 2000);
      throw new Error("Could not reach server " + err.toString());
    })
    .then(
      result => {
        if (!result.error)
        {
          const other_werewolfes = result.werewolf_names ?
            result.werewolf_names.filter(name => name !== result.nickname) : undefined;
          // Not all of the possible items will be sent by state.php in each
          // state of the game.  It is important to set missing items to
          // undefined, to avoid presenting outdated values.
          this.setState({
            nickname: result.nickname,
            room_name: result.room_name,
            players: result.players,
            players_waiting: result.players_waiting,
            game_state: result.game_state,
            player_role: result.player_role,
            is_mayor: result.is_mayor,
            mayor: result.mayor,
            difficulty: result.difficulty,
            num_werewolves: result.num_werewolves,
            words: result.words,
            secret_found: result.secret_found,
            role_found: result.role_found,
            werewolf_names: result.werewolf_names,
            other_werewolfes: other_werewolfes,
            seer_name: result.seer_names ? result.seer_names[0] : undefined,
            voted_name: result.voted_name,
            received_votes: result.received_votes_from,
            seconds_left: result.seconds_left,
            invite_link: result.join_link,
            is_valid: true,
            connected: true,
          });
          clearTimeout(this.timeout_timer);
          const refresh_delay = this.state.game_state === "main" ? 2000 : 500;
          this.refresh_timer = setTimeout((this.refresh.bind(this) as TimerHandler), refresh_delay);
        }
        else
        {
          this.setState({is_valid: false, error: result.error});
          if (result.error === "Invalid token.")
            this.setState({token: undefined});
          else
            setTimeout((this.refresh.bind(this) as TimerHandler), 3000);
        }
      })
    .catch(err => console.error(err));
  }
}

interface IWelcomeProps {
  name: string;
  room: string;
}

class Welcome extends Component<IWelcomeProps> {
  render() {
    return (
      <div>
        <div>Hallo, {this.props.name}!</div>
        <div>Du spielst in Raum {this.props.room}.</div>
      </div>
    );
  }
}

interface ITeamProps {
  active: string[];
  waiting?: string[];
}

class Teammates extends Component<ITeamProps> {
  render() {
    const names = this.props.active.join(", ");
    if (this.props.waiting === undefined)
    { // in lobby / waiting for game to finish
      if (this.props.active.length === 0)
        return <div>Du bist alleine im Raum.</div>
      return <div>Mit dir im Raum: {names}</div>;
    }
    const waiting = this.props.waiting.join(", ");
    if (this.props.active.length === 0)
    { 
      if (this.props.waiting.length === 0)
        return <div>Du bist alleine im Raum.</div>;
      return <div>Du bist alleine im Spiel, aber es wartet jemand in der Lobby: {waiting}</div>;
    }
    if (this.props.waiting.length === 0)
      return <div>Mit dir im Spiel: {names}</div>;
    return <div><div>Mit dir im Spiel: {names}</div><div>In der Lobby: {waiting}</div></div>;
  }
}
