import EventEmitter from '../util/eventEmitter';
import Constants from '../../constants';

class Model {
  constructor() {
    this._score = 0;
    this.soundOn = true;
    this._musicOn = true;
  }

  set musicOn(val) {
    this._musicOn = val;
    EventEmitter.emit(Constants.MUSIC_CHANGED);
  }

  get musicOn() {
    return this._musicOn;
  }

  set score(val) {
    this._score = val;
    console.log("Score upadted!");
    EventEmitter.emit(Constants.SCORE_UPDATED);
  }

  get score() {
    return this._score;
  }
}

export default (new Model());