import React, { Component } from "react";
import { typeColor, readableText } from "./pokeTypes";
import "./CardModal.css";

const STAT_MAX = 200; // visual cap for stat bars

const STAT_LABELS = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["speed", "Speed"],
];

class CardModal extends Component {
  componentDidMount() {
    document.addEventListener("keydown", this.handleKey);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKey);
  }

  handleKey = (e) => {
    if (e.key === "Escape") this.props.onClose();
  };

  render() {
    const { pokemon, onClose } = this.props;
    if (!pokemon) return null;

    const { name, types, base_experience, image, stats } = pokemon;
    const accent = typeColor(types[0]);

    return (
      <div className="Modal-backdrop" onClick={onClose}>
        <div
          className="Modal"
          style={{ "--accent": accent }}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} details`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="Modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>

          <div className="Modal-head">
            <div className="Modal-image">
              <img src={image} alt={name} />
            </div>
            <h2 className="Modal-name">{name}</h2>
            <div className="Modal-types">
              {types.map((t) => (
                <span
                  key={t}
                  className="Modal-type"
                  style={{ background: typeColor(t), color: readableText(typeColor(t)) }}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="Modal-exp">Base experience: {base_experience}</p>
          </div>

          <div className="Modal-stats">
            {STAT_LABELS.map(([key, label]) => {
              const value = (stats && stats[key]) || 0;
              const pct = Math.min(100, (value / STAT_MAX) * 100);
              return (
                <div className="Stat" key={key}>
                  <span className="Stat-label">{label}</span>
                  <span className="Stat-value">{value}</span>
                  <div className="Stat-track">
                    <div className="Stat-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default CardModal;
