import React from 'react'

interface IProps {
  items: string[];
  singular: string;
  plural: string;
}

export class NameGroup extends React.Component<IProps> {
  render() {
    if (!this.props.items || this.props.items.length === 0)
      return null;
    const items = this.props.items.map(item => <b>{item}</b>);
    if (items.length === 1)
      return <>{items[0]} {this.props.singular}</>;
    return <>{items.slice(0, -1).reduce((a, b) => <>{a}, {b}</>)} und {items.slice(-1)} {this.props.plural}</>
  }
}

