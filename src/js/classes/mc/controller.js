import Emitter from '../util/emitter';
import Model from '../mc/model';
import Constants from '../../constants';

class Controller {
  constructor() {
    Emitter.on(Constants.SET_SCORE, this.setScore);
    Emitter.on(Constants.UP_POINTS, this.upPoints);
    Emitter.on(Constants.TOGGLE_SOUND, this.toggleSound);
    Emitter.on(Constants.TOGGLE_MUSIC, this.toggleMusic);
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

export default (new Controller());