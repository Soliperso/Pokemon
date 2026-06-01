import React, { Component } from "react";
import QuickBattle from "./QuickBattle";
import DuelGame from "./DuelGame";

const API = "https://pokeapi.co/api/v2/pokemon/";
const ROSTER_SIZE = 8; // 4 cards per hand / team
const GEN1_MAX = 151;

const artwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// Used when the PokéAPI request fails (offline / blocked).
const FALLBACK_POOL = [
  { id: 4, name: "charmander", types: ["fire"], base_experience: 62, stats: { hp: 39, attack: 52, defense: 43, speed: 65 } },
  { id: 7, name: "squirtle", types: ["water"], base_experience: 63, stats: { hp: 44, attack: 48, defense: 65, speed: 43 } },
  { id: 11, name: "metapod", types: ["bug"], base_experience: 72, stats: { hp: 50, attack: 20, defense: 55, speed: 30 } },
  { id: 12, name: "butterfree", types: ["bug", "flying"], base_experience: 178, stats: { hp: 60, attack: 45, defense: 50, speed: 70 } },
  { id: 25, name: "pikachu", types: ["electric"], base_experience: 112, stats: { hp: 35, attack: 55, defense: 40, speed: 90 } },
  { id: 39, name: "jigglypuff", types: ["normal", "fairy"], base_experience: 95, stats: { hp: 115, attack: 45, defense: 20, speed: 20 } },
  { id: 94, name: "gengar", types: ["ghost", "poison"], base_experience: 225, stats: { hp: 60, attack: 65, defense: 60, speed: 110 } },
  { id: 133, name: "eevee", types: ["normal"], base_experience: 65, stats: { hp: 55, attack: 55, defense: 50, speed: 55 } },
].map((p) => ({ ...p, image: artwork(p.id) }));

const pickRandomIds = (count, max) => {
  const ids = new Set();
  while (ids.size < count) ids.add(1 + Math.floor(Math.random() * max));
  return [...ids];
};

const normalize = (data) => {
  const statOf = (name) => {
    const s = data.stats.find((x) => x.stat.name === name);
    return s ? s.base_stat : 0;
  };
  const art =
    (data.sprites.other &&
      data.sprites.other["official-artwork"] &&
      data.sprites.other["official-artwork"].front_default) ||
    data.sprites.front_default ||
    artwork(data.id);
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    base_experience: data.base_experience || 0,
    image: art,
    stats: {
      hp: statOf("hp"),
      attack: statOf("attack"),
      defense: statOf("defense"),
      speed: statOf("speed"),
    },
  };
};

const MODES = [
  { id: "quick", label: "Quick Battle", icon: "⚡", iconLabel: "lightning" },
  { id: "duel", label: "Duel", icon: "⚔️", iconLabel: "crossed swords" },
];

class Pokegame extends Component {
  state = {
    status: "loading", // loading | ready
    usingFallback: false,
    pool: [],
    mode: "quick",
  };

  componentDidMount() {
    this.loadRoster();
  }

  loadRoster = async () => {
    this.setState({ status: "loading" });
    try {
      const ids = pickRandomIds(ROSTER_SIZE, GEN1_MAX);
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`${API}${id}`).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
        )
      );
      this.setState({
        status: "ready",
        usingFallback: false,
        pool: results.map(normalize),
      });
    } catch (err) {
      // Graceful degradation: play with the bundled offline roster.
      this.setState({
        status: "ready",
        usingFallback: true,
        pool: FALLBACK_POOL,
      });
    }
  };

  setMode = (mode) => this.setState({ mode });

  render() {
    const { status, usingFallback, pool, mode } = this.state;

    if (status === "loading") {
      return (
        <div className="App-status">
          <div className="spinner" />
          <p>Summoning Pokémon…</p>
        </div>
      );
    }

    return (
      <>
        <header className="App-header">
          <h1 className="App-title">Pokémon Battle</h1>
          <p className="App-subtitle">
            {mode === "quick"
              ? "Two hands are dealt at random — the higher total experience wins."
              : "Draft a team, then duel the CPU card-by-card on the stat you choose."}
          </p>
        </header>

        <div
          className="mode-toggle"
          role="tablist"
          aria-label="Game mode"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={"mode-btn" + (mode === m.id ? " is-active" : "")}
              onClick={() => this.setMode(m.id)}
            >
              <span role="img" aria-label={m.iconLabel}>
                {m.icon}
              </span>{" "}
              {m.label}
            </button>
          ))}
          <button
            type="button"
            className="mode-refresh"
            onClick={this.loadRoster}
            title="Load a fresh set of Pokémon"
          >
            <span role="img" aria-label="refresh">
              🔄
            </span>{" "}
            New Roster
          </button>
        </div>

        {usingFallback && (
          <p className="App-error">
            Couldn’t reach PokéAPI — playing with the offline roster.
          </p>
        )}

        {mode === "quick" ? (
          <QuickBattle pool={pool} />
        ) : (
          <DuelGame pool={pool} onNewRoster={this.loadRoster} />
        )}
      </>
    );
  }
}

export default Pokegame;
