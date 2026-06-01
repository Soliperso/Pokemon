import React, { Component } from "react";
import Pokecard from "./Pokecard";
import "./Pokedex.css";

class Pokedex extends Component {
  render() {
    const { pokemon, exp, isWinner, isTie, margin, onSelect } = this.props;

    let status = "Losing Hand";
    let statusClass = "Pokedex-loser";
    if (isTie) {
      status = "Tie";
      statusClass = "Pokedex-tie";
    } else if (isWinner) {
      status = "Winning Hand";
      statusClass = "Pokedex-winner";
    }

    return (
      <section className={`Pokedex ${isWinner && !isTie ? "is-winner" : ""}`}>
        <header className="Pokedex-head">
          <h2 className={`Pokedex-status ${statusClass}`}>
            {isWinner && !isTie && (
              <span className="Pokedex-crown" role="img" aria-label="winner">
                👑
              </span>
            )}
            {status}
          </h2>
          <p className="Pokedex-exp">
            {exp} <span>total XP</span>
          </p>
          {isWinner && !isTie && margin > 0 && (
            <p className="Pokedex-margin">Wins by {margin} XP</p>
          )}
        </header>

        <div className="Pokedex-cards">
          {pokemon.map((p) => (
            <Pokecard key={p.id} pokemon={p} onSelect={onSelect} />
          ))}
        </div>
      </section>
    );
  }
}

export default Pokedex;
