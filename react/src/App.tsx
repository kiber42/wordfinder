import React, { Component } from 'react'

import { Connection } from './Context'

import { Countdown } from './Countdown'
import { GameView } from './GameView'
import { Header } from './Header'
import { LobbyView } from './Lobby'
import { Login } from './Login'
import { ResultView } from './Results'
import { WaitView } from './WaitView'

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
  game_state: "lobby" | "choosing" | "main" | "vote" | "waiting";
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
  other_werewolves?: string[];
  seer_name?: string;
  voted_name?: string;
  received_votes?: { [votee: string] : string[] };
  seconds_left?: number;
  invite_link: string;
}

interface ISettings {
  difficulty: number;
  num_werewolves: number;
}

export class App extends Component<IProps, IState & ISettings> {
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
      game_state: "lobby",
      players: [],
      player_role: "",
      is_mayor: false,
      difficulty: 1,
      num_werewolves: 1,
      invite_link: ""
    }
  }

  private enterRoom(room_name: string, player_token: number) {
    this.setState({token: player_token});
    window.history.pushState({"token": player_token}, "Werewords " + room_name, "?token=" + player_token);
  }

  private getMainContent() {
    switch (this.state.game_state) {
      case "lobby":
        return (
          <>
            <ResultView secret_found={this.state.secret_found}
                        role_found={this.state.role_found} 
                        werewolf_names={this.state.werewolf_names ?? []}
                        seer_name={this.state.seer_name ?? ""}
                        received_votes={this.state.received_votes} />
            <LobbyView num_players={this.state.players.length + 1}
                       difficulty={this.state.difficulty}
                       num_werewolves={this.state.num_werewolves}
                       invite_link={this.state.invite_link} />
          </>
        );
        case "waiting":
          return <WaitView/>
        case "choosing":
        case "main":
        case "vote":
          // TODO: Verify that inputs are complete
          return (
            <GameView state={this.state.game_state}
                      role={this.state.player_role}
                      is_mayor={this.state.is_mayor}
                      mayor={this.state.mayor ?? ""}
                      words={this.state.words ?? []}
                      secret_found={this.state.secret_found}
                      werewolf_names={this.state.werewolf_names}
                      other_werewolves={this.state.other_werewolves}
                      voted_name={this.state.voted_name}
                      other_players={this.state.players}/>
          );
    }
  }

  render() {
    if (!this.state.token)
      return <Login room_name={this.props.room_name} tokenAvailable={this.enterRoom.bind(this)}/>

    if (this.state.is_valid) {
      const active_players = this.state.players.map((player) => player[1]);
      const waiting_players = this.state.players_waiting ? this.state.players_waiting.map((player) => player[1]) : [];
      return (
        <Connection.Provider value={{token: this.state.token}}>
          <Header name={this.state.nickname} room={this.state.room_name} active={active_players} waiting={waiting_players}/>
          {this.getMainContent()}
          <Countdown seconds_initial={this.state.seconds_left}/>
          {this.state.connected || <div>No connection to server!</div>}
        </Connection.Provider>
      );
    }

    if (this.state.error)
      return <div>Server meldet Fehler: {this.state.error}</div>

    return <div>Warte auf Server...</div>
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillUnmount() {
    clearTimeout(this.refresh_timer);
  }

  refresh() {
    if (!this.state.token) {
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
          const other_werewolves = result.werewolf_names ?
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
            other_werewolves: other_werewolves,
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
