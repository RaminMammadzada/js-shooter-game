import Emitter from '../util/emitter';
import Model from '../mc/model'

class Controller {
  constructor() {
    Emitter.on(G.SET_SCORE, this.setScore);
    Emitter.on(G.UP_POINTS, this.upPoints);
    Emitter.on(G.TOGGLE_SOUND, this.toggleSound);
    Emitter.on(G.TOGGLE_MUSIC, this.toggleMusic);
  }

  toggleSound(val) {
    Model.soundOn = val;
  }

  toggleMusic(val) {
    Model.musicOn = val;
  }

  setScore(score) {
    Model.score = score;
  }

  upPoints(points) {
    let score = Model.score;
    score += points;
    Model.score = score;
  }
}