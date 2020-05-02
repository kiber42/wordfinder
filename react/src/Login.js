import React from 'react';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {room_name: this.props.room_name, nickname: ""};
    this.roomChanged = (event) => this.setState({room_name: event.target.value});
    this.nameChanged = (event) => this.setState({nickname: event.target.value});
    this.handleSubmit = (event) => {
      //TODO
      //fetch
      event.preventDefault();
    };
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
      <table>
        <tr>
          <td><label for="room_name">Room name:</label></td>
          <td><input id="room_name" type="text" value={this.state.room_name} onChange={this.roomChanged}/></td>
        </tr>
        <tr>
          <td><label for="nickname">Your nickname:</label></td>
          <td><input id="nickname" type="text" maxlength="25" value={this.state.nickname} onChange={this.nameChanged}/></td>
        </tr>
        <tr><td colspan="2"><input type="submit" value="Go"/></td></tr>
      </table>
    </form>
    );
  }
}

export default Login;
