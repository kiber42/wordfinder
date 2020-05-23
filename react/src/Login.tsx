import React from 'react'

interface IProps {
  room_name?: string;
  tokenAvailable: (room_name: string, assignedToken: number) => void;
}

interface IState {
  room_name: string;
  nickname: string;
  message?: string;
}

export class Login extends React.Component<IProps, IState> {
  private roomChanged: React.ChangeEventHandler<HTMLInputElement>;
  private nameChanged: React.ChangeEventHandler<HTMLInputElement>;
  private handleSubmit: React.FormEventHandler;

  constructor(props) {
    super(props);
    this.state = {room_name: this.props.room_name ?? "", nickname: "", message: undefined};
    if (!this.props.room_name)
      this.getNameSuggestion();

    this.roomChanged = (event) => this.setState({room_name: event.target.value});
    this.nameChanged = (event) => this.setState({nickname: event.target.value, message: undefined});
    this.handleSubmit = (event) => {
      if (!!this.state.room_name && !!this.state.nickname)
      {
        this.setState({message: undefined});
        fetch("join.php?room_name=" + this.state.room_name + "&nickname=" + this.state.nickname)
        .then(res => res.json())
        .then(res => {
          if (res.token) this.props.tokenAvailable(this.state.room_name, res.token);
          else if (res.token === 0) this.setState({message: "Dieser Name ist bereits vergeben."});
        })
        .catch(err => console.error(err));
      }
      event.preventDefault();
    };
  }

  getNameSuggestion()
  {
    fetch("roomname.php")
    .then(res => res.json())
    .then(res => this.setState({room_name: res.room_name}))
    .catch(err => console.error(err));
  }

  render() {
    return (
      <form className="login" onSubmit={this.handleSubmit}>
      <table>
      <tbody>
        <tr>
          <td><label htmlFor="room_name">Name des Raums:</label></td>
          <td><input id="room_name" type="text" value={this.state.room_name} onChange={this.roomChanged}/></td>
        </tr>
        <tr>
          <td><label htmlFor="nickname">Spielername:</label></td>
          <td><input id="nickname" type="text" maxLength={50} value={this.state.nickname} onChange={this.nameChanged}/></td>
        </tr>
        {this.state.message && (
          <tr>
            <td colSpan={2}>{this.state.message}</td>
          </tr>
        )}
      </tbody>
      </table>
      <input type="submit" value="Start"/>
    </form>
    );
  }
}
