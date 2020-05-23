import React from 'react'

interface ITeamProps {
  active: string[];
  waiting?: string[];
}

export class Team extends React.Component<ITeamProps> {
  public render() {
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
}
