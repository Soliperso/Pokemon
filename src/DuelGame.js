import React, { Component } from "react";
import Pokecard from "./Pokecard";
import Scoreboard from "./Scoreboard";
import "./DuelGame.css";

const TEAM_SIZE = 4;
const STATS = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["speed", "Speed"],
];

const DUEL_LABELS = { left: "You", right: "CPU" };

const initialDuelState = {
  phase: "draft", // draft | duel | result
  playerTeam: [],
  cpuTeam: [],
  playerHand: [],
  cpuHand: [],
  selectedCardId: null,
  selectedStat: null,
  roundWins: { you: 0, cpu: 0 },
  round: 1,
  lastResult: null,
};

class DuelGame extends Component {
  state = { ...initialDuelState, scores: { p1: 0, p2: 0 } };

  componentDidUpdate(prevProps) {
    // A fresh roster arrived from the shell — restart the draft (keep tally).
    if (prevProps.pool !== this.props.pool) {
      this.setState({ ...initialDuelState });
    }
  }

  // ---- Draft phase ----
  handleDraftToggle = (pokemon) => {
    this.setState((prev) => {
      const picked = prev.playerTeam.some((p) => p.id === pokemon.id);
      if (picked) {
        return {
          playerTeam: prev.playerTeam.filter((p) => p.id !== pokemon.id),
        };
      }
      if (prev.playerTeam.length >= TEAM_SIZE) return null;
      return { playerTeam: [...prev.playerTeam, pokemon] };
    });
  };

  handleAutoPick = () => {
    this.setState((prev) => {
      const team = [...prev.playerTeam];
      for (const p of this.props.pool) {
        if (team.length >= TEAM_SIZE) break;
        if (!team.some((c) => c.id === p.id)) team.push(p);
      }
      return { playerTeam: team };
    });
  };

  handleStartDuel = () => {
    this.setState((prev) => {
      const ids = new Set(prev.playerTeam.map((p) => p.id));
      const cpuTeam = this.props.pool.filter((p) => !ids.has(p.id));
      return {
        ...initialDuelState,
        phase: "duel",
        playerTeam: prev.playerTeam,
        cpuTeam,
        playerHand: prev.playerTeam,
        cpuHand: cpuTeam,
      };
    });
  };

  // ---- Duel phase ----
  handleSelectCard = (pokemon) =>
    this.setState((prev) => ({
      selectedCardId: prev.selectedCardId === pokemon.id ? null : pokemon.id,
    }));

  handleSelectStat = (stat) =>
    this.setState((prev) => ({
      selectedStat: prev.selectedStat === stat ? null : stat,
    }));

  handleAttack = () => {
    const { playerHand, cpuHand, selectedCardId, selectedStat } = this.state;
    if (!selectedCardId || !selectedStat || !cpuHand.length) return;

    const playerCard = playerHand.find((c) => c.id === selectedCardId);
    const cpuCard = cpuHand[Math.floor(Math.random() * cpuHand.length)];
    const pv = playerCard.stats[selectedStat];
    const cv = cpuCard.stats[selectedStat];
    const outcome = pv > cv ? "you" : cv > pv ? "cpu" : "draw";

    this.setState((prev) => {
      const roundWins = { ...prev.roundWins };
      if (outcome === "you") roundWins.you += 1;
      else if (outcome === "cpu") roundWins.cpu += 1;
      return {
        playerHand: prev.playerHand.filter((c) => c.id !== playerCard.id),
        cpuHand: prev.cpuHand.filter((c) => c.id !== cpuCard.id),
        roundWins,
        lastResult: { playerCard, cpuCard, stat: selectedStat, outcome },
        selectedCardId: null,
        selectedStat: null,
      };
    });
  };

  handleContinue = () => {
    this.setState((prev) => {
      if (prev.playerHand.length === 0) {
        // Duel finished — award the winner a duel point.
        const scores = { ...prev.scores };
        if (prev.roundWins.you > prev.roundWins.cpu) scores.p1 += 1;
        else if (prev.roundWins.cpu > prev.roundWins.you) scores.p2 += 1;
        return { phase: "result", scores, lastResult: null };
      }
      return { lastResult: null, round: prev.round + 1 };
    });
  };

  // ---- Result / reset ----
  handleRedraft = () => this.setState({ ...initialDuelState });

  handleResetScores = () => this.setState({ scores: { p1: 0, p2: 0 } });

  renderDraft() {
    const { playerTeam } = this.state;
    const full = playerTeam.length >= TEAM_SIZE;
    return (
      <section className="Duel-phase">
        <div className="Duel-bar">
          <p className="Duel-instruction">
            Draft your team — pick <strong>{TEAM_SIZE}</strong> Pokémon. The rest
            go to the CPU.
          </p>
          <div className="Duel-bar-actions">
            <span className="Duel-counter">
              {playerTeam.length} / {TEAM_SIZE}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={this.handleAutoPick}
              disabled={full}
            >
              Auto-pick
            </button>
            <button
              type="button"
              className="btn"
              onClick={this.handleStartDuel}
              disabled={!full}
            >
              Start Duel
            </button>
          </div>
        </div>

        <div className="Duel-grid">
          {this.props.pool.map((p) => {
            const selected = playerTeam.some((c) => c.id === p.id);
            return (
              <Pokecard
                key={p.id}
                pokemon={p}
                showStats
                selected={selected}
                disabled={full && !selected}
                onSelect={this.handleDraftToggle}
              />
            );
          })}
        </div>
      </section>
    );
  }

  renderReveal() {
    const { lastResult, playerHand } = this.state;
    const { playerCard, cpuCard, stat, outcome } = lastResult;
    const banner =
      outcome === "you"
        ? "You win the round!"
        : outcome === "cpu"
        ? "CPU wins the round"
        : "Draw — no points";
    const statLabel = STATS.find(([k]) => k === stat)[1];

    return (
      <div className="Duel-reveal">
        <p className={`Duel-banner is-${outcome}`}>{banner}</p>
        <p className="Duel-reveal-sub">
          Compared on <strong>{statLabel}</strong>: {playerCard.stats[stat]} vs{" "}
          {cpuCard.stats[stat]}
        </p>
        <div className="Duel-reveal-cards">
          <div className={outcome === "you" ? "Duel-win" : ""}>
            <Pokecard pokemon={playerCard} showStats highlightStat={stat} onSelect={() => {}} />
          </div>
          <div className="battle-vs" aria-hidden="true">
            VS
          </div>
          <div className={outcome === "cpu" ? "Duel-win" : ""}>
            <Pokecard pokemon={cpuCard} showStats highlightStat={stat} onSelect={() => {}} />
          </div>
        </div>
        <button type="button" className="btn" onClick={this.handleContinue}>
          {playerHand.length === 0 ? "See Result" : "Next Round"}
        </button>
      </div>
    );
  }

  renderDuel() {
    const {
      playerHand,
      cpuHand,
      selectedCardId,
      selectedStat,
      roundWins,
      round,
      lastResult,
    } = this.state;

    if (lastResult) return this.renderReveal();

    const canAttack = selectedCardId && selectedStat && cpuHand.length;

    return (
      <section className="Duel-phase">
        <div className="Duel-status">
          <span className="Duel-round">Round {round} / {TEAM_SIZE}</span>
          <span className="Duel-tally">
            You {roundWins.you} – {roundWins.cpu} CPU
          </span>
        </div>

        <div className="Duel-cpu">
          <span className="Duel-cpu-label">CPU has {cpuHand.length} card(s)</span>
          <div className="Duel-cpu-backs">
            {cpuHand.map((c) => (
              <span key={c.id} className="cardback" aria-hidden="true" />
            ))}
          </div>
        </div>

        <div className="Duel-statpick">
          <span className="Duel-statpick-label">Attack with:</span>
          {STATS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={
                "Duel-statbtn" + (selectedStat === key ? " is-active" : "")
              }
              onClick={() => this.handleSelectStat(key)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="btn Duel-attack"
            onClick={this.handleAttack}
            disabled={!canAttack}
          >
            <span role="img" aria-label="crossed swords">
              ⚔️
            </span>{" "}
            Attack!
          </button>
        </div>

        <p className="Duel-hint">
          Pick one of your cards and a stat, then attack. Highest stat wins the
          round.
        </p>

        <div className="Duel-grid">
          {playerHand.map((p) => (
            <Pokecard
              key={p.id}
              pokemon={p}
              showStats
              selected={selectedCardId === p.id}
              highlightStat={selectedCardId === p.id ? selectedStat : null}
              onSelect={this.handleSelectCard}
            />
          ))}
        </div>
      </section>
    );
  }

  renderResult() {
    const { roundWins } = this.state;
    const outcome =
      roundWins.you > roundWins.cpu
        ? "you"
        : roundWins.cpu > roundWins.you
        ? "cpu"
        : "draw";
    const title =
      outcome === "you"
        ? "🏆 You win the duel!"
        : outcome === "cpu"
        ? "CPU wins the duel"
        : "It's a draw!";

    return (
      <section className="Duel-phase Duel-result">
        <h2 className={`Duel-result-title is-${outcome}`}>
          <span role="img" aria-label="result">
            {outcome === "you" ? "🏆" : outcome === "cpu" ? "🤖" : "🤝"}
          </span>{" "}
          {title.replace(/^[^ ]+ /, "")}
        </h2>
        <p className="Duel-result-score">
          Final round score — You {roundWins.you} : {roundWins.cpu} CPU
        </p>
        <div className="App-controls">
          <button type="button" className="btn" onClick={this.handleRedraft}>
            Draft New Team
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={this.props.onNewRoster}
          >
            <span role="img" aria-label="refresh">
              🔄
            </span>{" "}
            New Roster
          </button>
        </div>
      </section>
    );
  }

  render() {
    const { phase, scores } = this.state;
    return (
      <>
        <Scoreboard
          scores={scores}
          labels={DUEL_LABELS}
          centerLabel="Duels"
          onReset={this.handleResetScores}
        />
        {phase === "draft" && this.renderDraft()}
        {phase === "duel" && this.renderDuel()}
        {phase === "result" && this.renderResult()}
      </>
    );
  }
}

export default DuelGame;
