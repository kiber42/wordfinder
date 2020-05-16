import React from 'react'

interface IProps {
  seconds_initial?: number;
}

interface IState {
  seconds_left?: number;
  end_time: number;
}

export class Countdown extends React.Component<IProps, IState> {
  private timer?: number;

  constructor(props) {
    super(props);
    this.state = {
      seconds_left: this.props.seconds_initial,
      end_time: Date.now() + (this.props.seconds_initial ?? 0) * 1000
    };
  }

  componentDidMount() {
    this.timer = setInterval((() => this.refresh()) as TimerHandler, 200);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidUpdate(prevprops: IProps) {
    if (this.props.seconds_initial !== prevprops.seconds_initial) {
      const updatedEndTime = Date.now() + (this.props.seconds_initial ?? 0) * 1000;
      const clockSkewInSeconds = this.state.end_time - updatedEndTime;
      if (Math.abs(clockSkewInSeconds) > 3) {
        this.setState({
          seconds_left: this.props.seconds_initial,
          end_time: updatedEndTime
        });
      }
    }
  }

  render() {
    if (this.state.seconds_left === undefined)
      return null;
    const minutes = Math.floor(this.state.seconds_left / 60);
    const seconds = this.state.seconds_left % 60;
    return <div>Verbleibende Zeit: {minutes}:{seconds.toString().padStart(2, '0')}</div>
  }

  refresh() {
    if (this.state.seconds_left === undefined)
      return;
    const value = Math.floor((this.state.end_time - Date.now()) / 1000);
    this.setState({seconds_left: Math.max(0, value)});
  }
}
