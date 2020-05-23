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

  public componentDidMount() {
    this.timer = setInterval((() => this.refresh()) as TimerHandler, 200);
  }

  public componentWillUnmount() {
    clearInterval(this.timer);
  }

  public componentDidUpdate(prevprops: IProps) {
    if (this.props.seconds_initial !== prevprops.seconds_initial) {
      if (this.props.seconds_initial === undefined) {
        this.setState({seconds_left: undefined});
        return;
      }
      const updatedEndTime = Date.now() + (this.props.seconds_initial ?? 0) * 1000;
      const clockSkewInMilliseconds = this.state.end_time - updatedEndTime;
      if (Math.abs(clockSkewInMilliseconds) > 3000) {
        this.setState({
          seconds_left: this.props.seconds_initial,
          end_time: updatedEndTime
        });
      }
    }
  }

  public render() {
    if (this.state.seconds_left === undefined)
      return null;
    const minutes = Math.floor(this.state.seconds_left / 60);
    const seconds = this.state.seconds_left % 60;
    let color = {};
    const threshold = 40;
    if (this.state.seconds_left < threshold) {
      const fadeIn = 255 * (1 - this.state.seconds_left / threshold);
      color = { color: "rgb(" + fadeIn + "," + fadeIn / 3 + "," + fadeIn / 3 + ")"};
    }
    return (
      <div className="countdown">
        <div>
          <div className="countdown-label">Verbleibende Zeit:</div>
          <div className="countdown-value" style={color}>{minutes}:{seconds.toString().padStart(2, '0')}</div>
        </div>
      </div>
    );
  }

  private refresh() {
    if (this.state.seconds_left === undefined)
      return;
    const value = Math.floor((this.state.end_time - Date.now()) / 1000);
    this.setState({seconds_left: Math.max(0, value)});
  }
}
