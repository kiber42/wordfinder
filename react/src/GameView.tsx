import React from 'react'

import { GuessingView } from './GuessingView'
import { LobbyView } from './Lobby'
import { MayorView } from './MayorView'
import { ResultView } from './Results'
import { SecretRole } from './SecretRole'
import { VoteView } from './Voting'
import { WaitView } from './WaitView'

interface IGameProps {
  state: string;
  invite_link: string;
  num_players: number;
  players: [number, string][];
  words?: string[];
  secret_found?: number;
  role_found?: number;
  mayor?: string;
  werewolf_names?: string[];
  seer_name?: string;
  received_votes?: [string, string[]][];
}

interface IPlayerProps {
  is_mayor: boolean;
  role: string;
  other_werewolves?: string[];
  voted_name?: string;
}

interface ISettings {
  difficulty: number;
  num_werewolves: number;
}

export class GameView extends React.Component<IGameProps & IPlayerProps & ISettings> {
  // TODO: Implement componentDidUpdate that checks that required props are defined
  //       (here or in a component further down the hierarchy)

  render() {
    const secret = this.props.words !== undefined ? this.props.words[0] : "";
    switch (this.props.state)
    {
      case "lobby": {
        // Lobby is also used to show results of previous game
        const lobby = <LobbyView num_players={this.props.num_players}
                                 difficulty={this.props.difficulty}
                                 num_werewolves={this.props.num_werewolves}
                                 invite_link={this.props.invite_link}/>;
        if (this.props.secret_found !== undefined)
        {
          // Secret found and seer found => Werewolf wins
          // Secret not found and wolf not found => Werewolf wins
          const winner = (this.props.secret_found + (this.props.role_found ?? 0)) === 1 ? "villagers" : "werewolf";
          return (
            <>
              <ResultView winner={winner} werewolf_names={this.props.werewolf_names ?? []} seer_name={this.props.seer_name ?? ""} received_votes={this.props.received_votes}/>
              {lobby}
            </>
          );
        }
        return lobby;
      }
      case "choosing":
        if (this.props.is_mayor)
        {
          if (!this.props.words)
            console.warn("Have no words to choose from!");
          return <MayorView words={this.props.words ?? []} role={this.props.role} other_werewolves={this.props.other_werewolves}/>
        }
        return (
          <div>
            <div>Bürgermeister <b>{this.props.mayor}</b> wählt das Zauberwort aus.</div>
            <SecretRole role={this.props.role} other_werewolves={this.props.other_werewolves}/>
          </div>
        );
      case "main":
        return this.props.is_mayor ?
          <MayorView role={this.props.role} secret={secret}/> :
          <GuessingView role={this.props.role} secret={secret} other_werewolves={this.props.other_werewolves}/>;
      case "vote": {
        return <VoteView secret={secret}
                         secret_found={this.props.secret_found === 1}
                         role={this.props.role}
                         werewolf_names={this.props.werewolf_names ?? []}
                         voted_name={this.props.voted_name}
                         players={this.props.players}/>
      }
      case "waiting":
        return <WaitView/>
      default:
        return <div>Aktueller Spiel-Zustand ({this.props.state}) nicht implementiert!</div>
    }
  }
}
