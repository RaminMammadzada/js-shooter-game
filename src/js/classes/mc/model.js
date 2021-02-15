class Model {
  constructor() {
    this._score = 0;
    this.soundOn = true;
  }

  set score(val) {
    this._score = val;
  }

  get score() {
    return this._score;
  }
}

export default Model;