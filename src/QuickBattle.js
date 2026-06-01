import React, { Component } from "react";
import Pokedex from "./Pokedex";
import Scoreboard from "./Scoreboard";
import CardModal from "./CardModal";

const totalExp = (hand) =>
  hand.reduce((sum, p) => sum + (p.base_experience || 0), 0);

// Split a pool evenly into two random hands.
const dealHands = (pool) => {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const mid = Math.ceil(shuffled.length / 2);
  return { hand1: shuffled.slice(0, mid), hand2: shuffled.slice(mid) };
};

class QuickBattle extends Component {
  state = {
    hand1: [],
    hand2: [],
    scores: { p1: 0, p2: 0 },
    rounds: 0,
    selectedCard: null,
  };

  componentDidMount() {
    this.startRound();
  }

  componentDidUpdate(prevProps) {
    // A fresh roster was loaded by the shell — deal a new round.
    if (prevProps.pool !== this.props.pool) this.startRound();
  }

  // Deal a fresh round and award the winner a point.
  startRound = () => {
    this.setState((prev) => {
      const { hand1, hand2 } = dealHands(this.props.pool);
      const exp1 = totalExp(hand1);
      const exp2 = totalExp(hand2);
      const scores = { ...prev.scores };
      if (exp1 > exp2) scores.p1 += 1;
      else if (exp2 > exp1) scores.p2 += 1;
      return { hand1, hand2, scores, rounds: prev.rounds + 1 };
    });
  };

  handleResetScores = () => this.setState({ scores: { p1: 0, p2: 0 } });

  handleSelectCard = (pokemon) => this.setState({ selectedCard: pokemon });

  handleCloseCard = () => this.setState({ selectedCard: null });

  render() {
    const { hand1, hand2, scores, rounds, selectedCard } = this.state;
    if (!hand1.length) return null;

    const exp1 = totalExp(hand1);
    const exp2 = totalExp(hand2);
    const isTie = exp1 === exp2;
    const margin = Math.abs(exp1 - exp2);

    return (
      <>
        <Scoreboard
          scores={scores}
          rounds={rounds}
          onReset={this.handleResetScores}
        />

        <div className="App-controls">
          <button type="button" className="btn" onClick={this.startRound}>
            <span role="img" aria-label="lightning">
              ⚡
            </span>{" "}
            Play Again
          </button>
        </div>

        <div className="battle">
          <Pokedex
            pokemon={hand1}
            exp={exp1}
            isWinner={exp1 > exp2}
            isTie={isTie}
            margin={margin}
            onSelect={this.handleSelectCard}
          />
          <div className="battle-vs" aria-hidden="true">
            VS
          </div>
          <Pokedex
            pokemon={hand2}
            exp={exp2}
            isWinner={exp2 > exp1}
            isTie={isTie}
            margin={margin}
            onSelect={this.handleSelectCard}
          />
        </div>

        {selectedCard && (
          <CardModal pokemon={selectedCard} onClose={this.handleCloseCard} />
        )}
      </>
    );
  }
}

export default QuickBattle;
