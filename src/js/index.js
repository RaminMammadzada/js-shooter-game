import ThreeGame from "./three3d/game";
import "../styles/style.css";

const container = document.getElementById("phaser-game");
window.game = new ThreeGame(container);
