import EventEmitter from '../util/eventEmitter';
import Model from './model';
import Constants from '../../constants';

class Controller {
  setEmitters() {
    EventEmitter.on(Constants.SET_SCORE, this.setScore);
    EventEmitter.on(Constants.UP_POINTS, this.upPoints);
    EventEmitter.on(Constants.TOGGLE_SOUND, this.toggleSound);
    EventEmitter.on(Constants.TOGGLE_MUSIC, this.toggleMusic);
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
    let { score } = Model;
    score += points;
    Model.score = score;
  }
}

export default (new Controller());