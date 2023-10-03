import React from "react";

export class WaitView extends React.Component {
    render() {
        return (
            <div className="waiting">
                <div>Es läuft bereits eine Partie, du kannst erst in der nächsten teilnehmen.</div>
            </div>
        );
    }
}
