import React from 'react'

interface IHeaderProps {
  name: string;
  room: string;
  active: string[];
  waiting?: string[];
}

export class Header extends React.Component<IHeaderProps> {
  private getTeamNames() {
    const names = this.props.active.join(", ");
    if (this.props.waiting === undefined)
    { // in lobby or waiting for game to finish
      return <div className="teamnames">{this.props.active.length > 0 ? "Mit dir im Raum: " + names : "Du bist alleine im Raum."}</div>;
    }
    return (
      <>
        <div className="teamnames">{this.props.active.length > 0 ? "Im Spiel: " + names : "Du bist alleine im Spiel!"}</div>
        {this.props.waiting.length > 0 && <div className="waitingnames">In der Lobby: {this.props.waiting.join(", ")}</div>}
      </>
    );
  }

  render() {
    return (
      <div>
        <div className="playername">{this.props.name}!</div>
        <div className="roomname">Du spielst in Raum {this.props.room}.</div>
        {this.getTeamNames()}
      </div>
    );
  }
}
