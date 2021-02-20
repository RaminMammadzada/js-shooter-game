import EventEmitter from '../util/eventEmitter';
import Model from './model';
import Constants from '../../constants';

class Controller {
  constructor() {
    this.setEmitters();
  }

  setEmitters() {
    EventEmitter.on(Constants.SET_SCORE, this.setScore);
    EventEmitter.on(Constants.UP_POINTS, this.upPoints);
    EventEmitter.on(Constants.TOGGLE_SOUND, this.toggleSound);
    EventEmitter.on(Constants.TOGGLE_MUSIC, this.toggleMusic);
  }

  toggleSound(val) {
    this.val = val;
    Model.soundOn = this.val;
  }

  toggleMusic(val) {
    this.val = val;
    Model.musicOn = this.val;
  }

  setScore(score) {
    this.score = score;
    Model.score = this.score;
  }

  upPoints(points) {
    this.points = points;
    let { score } = Model;
    score += this.points;
    Model.score = score;
  }
}

export default (new Controller());