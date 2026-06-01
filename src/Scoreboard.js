import React, { Component } from "react";
import "./Scoreboard.css";

class Scoreboard extends Component {
  render() {
    const {
      scores,
      rounds,
      onReset,
      labels = { left: "Player 1", right: "Player 2" },
      centerLabel,
    } = this.props;
    const canReset = scores.p1 !== 0 || scores.p2 !== 0;
    return (
      <div className="Scoreboard" aria-label="Scoreboard">
        <div className="Scoreboard-side">
          <span className="Scoreboard-team">{labels.left}</span>
          <span className="Scoreboard-score">{scores.p1}</span>
        </div>

        <div className="Scoreboard-center">
          <span className="Scoreboard-rounds">
            {centerLabel || `Round ${rounds}`}
          </span>
          {onReset && (
            <button
              type="button"
              className="Scoreboard-reset"
              onClick={onReset}
              disabled={!canReset}
            >
              Reset
            </button>
          )}
        </div>

        <div className="Scoreboard-side">
          <span className="Scoreboard-team">{labels.right}</span>
          <span className="Scoreboard-score">{scores.p2}</span>
        </div>
      </div>
    );
  }
}

export default Scoreboard;
