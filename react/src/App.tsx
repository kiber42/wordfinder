import React, { Component } from 'react'

import { Connection } from './Context'

import { Banner } from './Banner'
import { Countdown } from './Countdown'
import { GameView } from './GameView'
import { LobbyView } from './Lobby'
import { Login } from './Login'
import { ResultView } from './Results'
import { Role } from './SecretRole' // eslint-disable-line no-unused-vars
import { Team } from './Team'
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
  player_role: Role;
  is_mayor: boolean;
  mayor?: string;
  difficulty: number;
  num_werewolves: number;
  words?: string[];
  secret?: string;
  secret_found?: number;
  role_found?: number;
  werewolf_names?: string[];
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
      player_role: "villager",
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
    const active_players = this.state.players.map((player) => player[1]);
    const waiting_players = this.state.players_waiting ? this.state.players_waiting.map((player) => player[1]) : [];
    switch (this.state.game_state) {
      case "lobby":
        return (
          <>
            <Banner name={this.state.nickname} room={this.state.room_name}/>
            <ResultView secret_found={this.state.secret_found}
                        role_found={this.state.role_found} 
                        werewolf_names={this.state.werewolf_names ?? []}
                        seer_name={this.state.seer_name ?? ""}
                        received_votes={this.state.received_votes ?? {}} />
            <Team active={active_players} waiting={waiting_players}/>
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
      case "vote": {
        const other_werewolves = this.state.werewolf_names ?
          this.state.werewolf_names.filter(name => name !== this.state.nickname) : undefined;
        return (
          <>
            <Banner name={this.state.nickname} room={this.state.room_name}/>
            <GameView state={this.state.game_state}
                      role={this.state.player_role}
                      is_mayor={this.state.is_mayor}
                      mayor={this.state.mayor ?? ""}
                      words={this.state.words}
                      secret={this.state.secret}
                      secret_found={this.state.secret_found}
                      werewolf_names={this.state.werewolf_names}
                      other_werewolves={other_werewolves}
                      voted_name={this.state.voted_name}
                      other_players={this.state.players}/>
            <Countdown seconds_initial={this.state.seconds_left}/>
            <Team active={active_players} waiting={waiting_players}/>
          </>
        );
      }
    }
  }

  render() {
    if (!this.state.token)
      return <Login room_name={this.props.room_name} tokenAvailable={this.enterRoom.bind(this)}/>

    if (this.state.is_valid) {
      return (
        <Connection.Provider value={{token: this.state.token}}>
          {this.state.connected || <div className="connection-error">No connection to server!</div>}
          {this.getMainContent()}
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

  componentDidUpdate() {
    // Verify that optional input is as expected
    // Several checks are deferred to individual components
    if (this.state.game_state === "lobby" || this.state.game_state === "waiting")
      return;
    if (!this.state.players_waiting)
      console.error("Missing input: Players waiting in lobby");
    if (this.state.seconds_left === undefined)
      console.error("Missing input: Countdown status");
    if (this.state.game_state === "choosing") {
      if (!this.state.is_mayor && !this.state.mayor)
        console.error("Missing input: Mayor name");
    } else if (this.state.game_state === "vote") {
      if (!this.state.werewolf_names || this.state.werewolf_names.length === 0)
        console.error("Missing input: Werewolf name(s)");
      if (!this.state.seer_name)
        console.error("Missing input: Seer name");
      if (!this.state.received_votes)
        console.error("Missing input: Voting results");
    }
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
          // Not all of the possible items will be sent by state.php in each
          // state of the game.  It is important to set missing items to
          // undefined, to avoid presenting outdated values.
          // TODO: Pull backend connection logic into separate class?
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
            secret: result.secret,
            secret_found: result.secret_found,
            role_found: result.role_found,
            werewolf_names: result.werewolf_names,
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
