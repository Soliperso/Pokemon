import React, { Component } from "react";
import "./Pokecard.css";

const POKE_URL = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
let padToThree = number => (number <= 999 ? `00${number}`.slice(-3) : number);

class Pokecard extends Component {
  render() {
    const { id, name, type, exp } = this.props;
    let srcImg = `${POKE_URL}${padToThree(id)}.png`;
    return (
      <div className="Pokecard">
        <h1>{name}</h1>
        <div className="Pokecard-image">
          <img src={srcImg} alt={name} />
        </div>
        <div>Type: {type}</div>
        <div>EXP: {exp}</div>
      </div>
    );
  }
}

export default Pokecard;
