import React from 'react'

interface ITeamProps {
  active: string[];
  waiting: string[];
}

export class Team extends React.Component<ITeamProps> {
  public render() {
    const names = this.props.active.join(", ");
    return (
      <>
        <div className="teamnames">{this.props.active.length > 0 ? "Mitspieler: " + names : "Du bist alleine hier."}</div>
        {this.props.waiting.length > 0 && <div className="waitingnames">In der Lobby: {this.props.waiting.join(", ")}</div>}
      </>
    );
  }
}
