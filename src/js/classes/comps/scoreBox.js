import Phaser from 'phaser';
import EventEmitter from '../util/eventEmitter';
import Model from '../modelAndController/model';
import Constants from '../../constants';

export default class ScoreBox extends Phaser.GameObjects.Container {
  constructor(config) {
    super(config.scene);
    this.scene = config.scene;
    //
    this.textForScore = this.scene.add.text(0, 0, 'SCORE:0', { fontSize: config.scene.game.config.width / 20 });
    this.textForScore.setOrigin(0.5, 0.5);
    this.add(this.textForScore);

    this.scene.add.existing(this);
    this.setScrollFactor(0);

    EventEmitter.on(Constants.SCORE_UPDATED, this.scoreUpdated, this);
  }

  scoreUpdated() {
    console.log('here it is');
    console.log(this.textForScore);
    console.log('Model.score: ', Model.score);
    this.textForScore.setSize(49);
    this.textForScore.setText(`SCORE:\n${Model.score}`);
  }
}