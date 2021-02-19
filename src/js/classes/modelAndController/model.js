import EventEmitter from '../util/eventEmitter';
import Constants from '../../constants';

class Model {
  constructor() {
    this.a_score = 0;
    this.soundOn = true;
    this.a_musicOn = true;
  }

  set musicOn(val) {
    this.a_musicOn = val;
    EventEmitter.emit(Constants.MUSIC_CHANGED);
  }

  get musicOn() {
    return this.a_musicOn;
  }

  set score(val) {
    this.a_score = val;
    EventEmitter.emit(Constants.SCORE_UPDATED);
  }

  get score() {
    return this.a_score;
  }
}

export default (new Model());