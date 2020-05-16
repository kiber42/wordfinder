import React from 'react'

interface IProps {
  seconds_initial: number;
}

interface IState {
  seconds_left: number;
  end_time: number;
}

export class Countdown extends React.Component<IProps, IState> {
  private seconds_initial_previous: number;
  private timer?: number;

  constructor(props) {
    super(props);
    this.seconds_initial_previous = this.props.seconds_initial;
    this.state = {
      seconds_left: this.props.seconds_initial,
      end_time: Date.now() + this.props.seconds_initial * 1000
    };
  }

  componentDidMount() {
    this.timer = setInterval((() => this.refresh()) as TimerHandler, 200);
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

// TODO: Move logic to componentDidUpdate

    // Respond to props change if it clearly contradicts current value
    const value = Math.floor((this.state.end_time - Date.now()) / 1000);
    this.setState({seconds_left: Math.max(0, value)});
    if (this.props.seconds_initial !== this.seconds_initial_previous) {
      this.seconds_initial_previous = this.props.seconds_initial;
      if (Math.abs(value - this.props.seconds_initial) > 3) {
        this.setState({
          seconds_left: this.props.seconds_initial,
          end_time: Date.now() + this.props.seconds_initial * 1000
        });
      }
    }
  }
}
