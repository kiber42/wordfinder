import React from "react";

interface IBannerProps {
    name: string;
    room: string;
}

export class Banner extends React.Component<IBannerProps> {
    render() {
        return (
            <div className="header">
                <div className="playername">{this.props.name}</div>
                <div className="roomname">{this.props.room}</div>
            </div>
        );
    }
}
