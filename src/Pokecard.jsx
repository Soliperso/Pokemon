import React, { Component } from "react";
import { typeColor, readableText } from "./pokeTypes";
import "./Pokecard.css";

// Fallback sprite source (official site art) when the primary image fails.
const FALLBACK_URL = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
const padToThree = (n) => (n <= 999 ? `00${n}`.slice(-3) : `${n}`);
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='none'/><text x='50%' y='52%' font-size='90' text-anchor='middle' dominant-baseline='middle'>?</text></svg>`
  );

// Compact stat row shown in draft/duel mode.
const STAT_ROW = [
  ["hp", "HP"],
  ["attack", "ATK"],
  ["defense", "DEF"],
  ["speed", "SPD"],
];

class Pokecard extends Component {
  state = { triedFallback: false };

  handleImgError = (e) => {
    const { pokemon } = this.props;
    if (!this.state.triedFallback) {
      this.setState({ triedFallback: true });
      e.target.src = `${FALLBACK_URL}${padToThree(pokemon.id)}.png`;
    } else {
      e.target.src = PLACEHOLDER;
    }
  };

  render() {
    const {
      pokemon,
      onSelect,
      showStats = false,
      highlightStat = null,
      selected = false,
      disabled = false,
    } = this.props;
    const { id, name, types, base_experience, image, stats } = pokemon;
    const accent = typeColor(types[0]);

    const className = [
      "Pokecard",
      selected && "is-selected",
      disabled && "is-disabled",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        type="button"
        className={className}
        style={{ "--accent": accent }}
        onClick={() => onSelect(pokemon)}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={`${name}, ${types.join("/")} type, ${base_experience} experience.`}
      >
        {selected && (
          <span className="Pokecard-check" aria-hidden="true">
            ✓
          </span>
        )}
        <span className="Pokecard-exp">{base_experience} XP</span>
        <span className="Pokecard-id">#{padToThree(id)}</span>

        <div className="Pokecard-image">
          <img src={image} alt={name} onError={this.handleImgError} />
        </div>

        <h3 className="Pokecard-name">{name}</h3>

        <div className="Pokecard-types">
          {types.map((t) => (
            <span
              key={t}
              className="Pokecard-type"
              style={{ background: typeColor(t), color: readableText(typeColor(t)) }}
            >
              {t}
            </span>
          ))}
        </div>

        {showStats && stats && (
          <ul className="Pokecard-stats">
            {STAT_ROW.map(([key, label]) => (
              <li
                key={key}
                className={
                  "Pokecard-stat" +
                  (highlightStat === key ? " is-highlight" : "")
                }
              >
                <span className="Pokecard-stat-label">{label}</span>
                <span className="Pokecard-stat-value">{stats[key]}</span>
              </li>
            ))}
          </ul>
        )}
      </button>
    );
  }
}

export default Pokecard;
