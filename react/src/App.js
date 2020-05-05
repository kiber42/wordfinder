import React, { Component } from 'react';
import copy from 'copy-to-clipboard';

import Login from './Login'

import './App.css';

const Connection = React.createContext({token: ""});

class App extends Component {
  constructor(props) {
    super(props);
    this.refresh_timer = 0;
    this.timeout_timer = 0;
    this.state = {
      is_valid: false,
      connected: false,
      error: "",
      token: this.props.token,
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
      let items = <>
          <Welcome name={this.state.nickname} room={this.state.room_name}/>
          <Teammates active={this.state.players} waiting={this.state.players_waiting}/>
          <GameView state={this.state.game_state}
                    player={this.state.nickname}
                    role={this.state.player_role}
                    is_mayor={this.state.is_mayor}
                    mayor={this.state.mayor}
                    difficulty={this.state.difficulty}
                    words={this.state.words}
                    secret_found={this.state.secret_found}
                    role_found={this.state.role_found}
                    werewolf_name={this.state.werewolf_name}
                    seer_name={this.state.seer_name}
                    voted_name={this.state.voted_name}
                    players={this.state.players}
                    num_players={this.state.players.length + 1}
                    seconds_left={this.state.seconds_left}/>
      </>
      if (this.state.game_state === "lobby")
        items = <>{items}<Invite link={this.state.join_link}/></>
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
      this.refresh_timer = setTimeout(this.refresh.bind(this), 200);
      return;
    }

    this.timeout_timer = setTimeout(() => this.setState({connected : false}), 5000);
    fetch("state.php?token=" + this.state.token)
    .then(result => result.json())
    .catch((err) => {
      this.refresh_timer = setTimeout(this.refresh.bind(this), 2000);
      throw new Error("Could not reach server");
    })
    .then(
      result => {
        if (!result.error)
        {
          // Not all of the possible items will be sent by state.php in each
          // state of the game.  It is important to set missing items to
          // undefined, to avoid presenting outdated values.
          this.setState({
            nickname: result.nickname,
            room_name: result.room_name,
            game_state: result.game_state,
            players: result.players,
            players_waiting: result.players_waiting,
            mayor: result.mayor,
            difficulty: result.difficulty,
            player_role: result.player_role,
            is_mayor: result.is_mayor,
            words: result.words,
            secret_found: result.secret_found,
            voted_name: result.voted_name,
            werewolf_name: result.werewolf_name,
            seer_name: result.seer_name,
            role_found: result.role_found,
            seconds_left: result.seconds_left,
            join_link: result.join_link,
            is_valid: true,
            connected: true,
          });
          clearTimeout(this.timeout_timer);
          const refresh_delay = this.state.game_state === "main" ? 2000 : 500;
          this.refresh_timer = setTimeout(this.refresh.bind(this), refresh_delay);
        }
        else
        {
          this.setState({is_valid: false, error: result.error});
          if (result.error === "Invalid token.")
            this.setState({token: null});
          else
            this.setTimeout(this.refresh.bind(this), 3000);
        }
      })
    .catch(err => console.error(err));
  }
}

class GameView extends Component {
  render() {
    switch (this.props.state)
    {
      case "lobby":
        // Lobby is also used to show results of previous game
        if (this.props.secret_found !== undefined)
        {
          // Secret found and seer found => Werewolf wins
          // Secret not found and wolf not found => Werewolf wins
          const winner = (this.props.secret_found + this.props.role_found) === 1 ? "villagers" : "werewolf";
          return (
            <div>
              <ResultView winner={winner} werewolf_name={this.props.werewolf_name} seer_name={this.props.seer_name}/>
              <LobbyView num_players={this.props.num_players} difficulty={this.props.difficulty}/>
            </div>
          );
        }
        return <LobbyView num_players={this.props.num_players} difficulty={this.props.difficulty}/>
      case "choosing":
        if (this.props.is_mayor)
          return <WordChoice words={this.props.words} role={this.props.role} seconds_left={this.props.seconds_left}/>
        return (
          <div>
            <div>Bürgermeister <b>{this.props.mayor}</b> wählt das Zauberwort aus.</div>
            <SecretRole role={this.props.role}/>
          </div>
        );
      case "main":
        const secret = this.props.words !== undefined ? this.props.words[0] : "";
        if (this.props.is_mayor)
          return <MayorView role={this.props.role} secret={secret} seconds_left={this.props.seconds_left}/>
        else
          return <GuessingView role={this.props.role} secret={secret} seconds_left={this.props.seconds_left}/>
      case "vote":
        return <VoteView secret={this.props.words[0]}
                         secret_found={this.props.secret_found}
                         role={this.props.role}
                         werewolf_name={this.props.werewolf_name}
                         voted_name={this.props.voted_name}
                         players={this.props.players}
                         seconds_left={this.props.seconds_left}/>
      case "waiting":
        return <WaitView/>
      default:
        return <div>Aktueller Spiel-Zustand ({this.props.state}) nicht implementiert!</div>
    }    
  }

}

class Welcome extends Component {
  render() {
    return (
      <div>
        <div>Hallo, {this.props.name}!</div>
        <div>Du spielst in Raum {this.props.room}.</div>
      </div>
    );
  }
}

class Teammates extends Component {
  render() {
    const names = this.props.active.map((item) => item[1]).join(", ");
    if (this.props.waiting === undefined)
    { // in lobby / waiting for game to finish
      if (this.props.active.length === 0)
        return <div>Du bist alleine im Raum.</div>
      return <div>Mit dir im Raum: {names}</div>;
    }
    const waiting = this.props.waiting.map((item) => item[1]).join(", ");
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

class LobbyView extends Component {
  static contextType = Connection;

  render() {
    const difficulties = ["leicht", "normal", "schwer", "unmöglich"];
    const difficultyButtons = difficulties.map((level, index) => <button onClick={() => this.setDifficulty(index)} key={index}>{level}</button>)
    let startButton;
    if (this.props.num_players >= 3)
     startButton = <div>Alle da? Dann <button onClick={() => this.startGame()}>Spiel starten! (auf {difficulties[this.props.difficulty]})</button></div>
    else
      startButton = <div>In der Lobby, warte auf Mitspieler.</div>
    return (
      <div>
        <div>Schwierigkeit: {difficultyButtons}</div>
        {startButton}
      </div>
    );   
  }

  startGame() {
    fetch("start.php?token=" + this.context.token).then().catch(err => console.error(err));
  }

  setDifficulty(level) {
    fetch("settings.php?token=" + this.context.token + "&difficulty=" + level).then().catch(err => console.error(err));
  }
}

class Invite extends Component {
  render() {
    return (
      <div>
        <div>Verwende diesen Link, um Mitspieler einzuladen:</div>
        <div>
          <input type="text" size={this.props.link.length} id="link" value={this.props.link} readOnly/>
          <button onClick={() => copy(this.props.link)}>Link kopieren</button>
        </div>
      </div>
    );
  }
}

class SecretRole extends Component {
  render() {
    let role = "";
    switch (this.props.role)
    {
      case "werewolf": role = "Werwolf!"; break;
      case "seer": role = "Seherin"; break;
      case "villager": default: role = "Dorfbewohner"; break;
    }
    return <div>Deine geheime Rolle: <b>{role}</b></div>
  }
}

class WordChoice extends Component {
  static contextType = Connection;

  render() {
    const words = this.props.words.map((word, index) => <button onClick={() => this.choose(index)} key={index}>{word}</button>);
    return (
      <div>
        <div>Du bist der Bürgermeister!</div>
        <SecretRole role={this.props.role}/>
        <div>Wähle dein Zauberwort:</div>
        <div>{words}</div>
        <Countdown seconds_initial={this.props.seconds_left}/>
      </div>
    );
  }

  choose(index) {
    fetch("start.php?token=" + this.context.token + "&index=" + index).then().catch(err => console.error(err));
  }
}

class MayorView extends Component {
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
      <div>
        <div>Du bist {title}!</div>
        <div>Die anderen müssen das Wort erraten, aber du darfst nur mit Ja, Nein, und Vielleicht antworten.</div>
        <div>Das Zauberwort ist: {this.props.secret}</div>
        <div>{instructions}</div>
        <Countdown seconds_initial={this.props.seconds_left}/>
        <button onClick={() => this.secret_found()}>Das Wort wurde erraten!</button>
      </div>
    );
  }

  secret_found() {
    fetch("found.php?token=" + this.context.token).then().catch(err => console.error(err));
  }
}

class Countdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds_left: this.props.seconds_initial,
      end_time: Date.now() + this.props.seconds_initial * 1000
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => this.refresh(), 200);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    if (this.state.seconds_left === undefined)
      return null;
    return <div>Verbleibende Zeit: {Math.floor(this.state.seconds_left / 60)}:{(this.state.seconds_left % 60).toString().padStart(2, '0')}</div>
  }

  refresh() {
    this.setState({seconds_left: Math.max(0, Math.floor((this.state.end_time - Date.now()) / 1000))});
  }
}

class GuessingView extends Component {
  render() {
    const secret = <div>Das Zauberwort ist: {this.props.secret}</div>;
    let instructions;
    switch (this.props.role) {
      case "werewolf":
        instructions = <div>{secret}<div>Verhindere, dass die anderen es erraten -- aber ohne erkannt zu werden!</div></div>;
        break;
      case "seer":
        instructions = <div>{secret}<div>Hilf den anderen es zu erraten -- aber ohne erkannt zu werden!</div></div>;
        break;
      case "villager": default:
        instructions = <div>Erratet das Zauberwort, ehe die Zeit abläuft!</div>        
    }
    return (
      <div>
        <SecretRole role={this.props.role}/>
        {instructions}
        <Countdown seconds_initial={this.props.seconds_left}/>
      </div>
    );
  }
}

class VoteView extends Component {
  render() {   
    let vote;
    if (!this.props.secret_found)
      vote = <VillagerVote secret={this.props.secret} players={this.props.players} voted_name={this.props.voted_name}/>;
    else if (this.props.role === "werewolf")
       vote = <WolfVote players={this.props.players} voted_name={this.props.voted_name}/>;
    else vote = (
      <div>
        <div>Das Zauberwort <b>{this.props.secret}</b> wurde erraten!</div>
        <div><b>{this.props.werewolf_name}</b> ist der Werwolf!</div>
        <div>Werwolf, finde die Seherin!</div>
      </div>
    );
    return <div>{vote}<Countdown seconds_initial={this.props.seconds_left}/></div>
  }
}

class WolfVote extends Component {
  render() {
    return (
      <div>
        <div>Das Zauberwort <b>{this.props.secret}</b>wurde erraten!</div>
        <div>Finde die Seherin, um die Partie zu gewinnen!</div>
        <Vote players={this.props.players} voted_name={this.props.voted_name}/>
      </div>
    );
  }
}

class VillagerVote extends Component {
  render() {
    return (
      <div>
        <div>Ihr habt das Zauberwort <b>{this.props.secret}</b> nicht gefunden!</div>
        <div>Stimmt jetzt darüber ab, wen ihr für den Werwolf haltet!</div>
        <Vote players={this.props.players} voted_name={this.props.voted_name}/>
      </div>
    );
  }
}

class Vote extends Component {
  static contextType = Connection;

  render() {
    if (this.props.voted_name !== undefined)
      return <div>Du hast für {this.props.voted_name} gestimmt. Warte auf andere Spieler.</div>
    const choices = this.props.players.map((item) => <button onClick={() => this.choose(item[0])} key={item[0]}>{item[1]}</button>);
    return <div>{choices}</div>
  }

  choose(index) {
    fetch("vote.php?token=" + this.context.token + "&id=" + index).then().catch(err => console.error(err));
  }
}

class ResultView extends Component {
  render() {
    let winner;
    if (this.props.winner === "werewolf")
      winner = <div>Werwolf <b>{this.props.werewolf_name}</b> hat gewonnen!</div>
    else
      winner = (
        <div>
          <div>Die Dorfbewohner haben gewonnen!</div>
          <div><b>{this.props.werewolf_name}</b> war der Werwolf.</div>
        </div>
        );
    return (
      <div>
        <div>Die Runde ist zu Ende:</div>
        {winner}
        <div><b>{this.props.seer_name}</b> war die Seherin.</div>
      </div>
    );
  }
}

class WaitView extends Component {
  render() {
    return <div>Es läuft bereits eine Partie, du kannst erst in der nächsten teilnehmen.</div>;
  }
}

export default App;
