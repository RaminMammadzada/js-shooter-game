import Phaser from 'phaser';
import EventEmitter from '../util/eventEmitter';
import Model from '../modelAndController/model';
import Constants from '../../constants';

class ScoreBox extends Phaser.GameObjects.Container {
  constructor(config) {
    super(config.scene);
    this.scene = config.scene;
    //
    this.text1 = this.scene.add.text(0, 0, 'SCORE:0', { fontSize: config.scene.game.config.width / 20 });
    this.text1.setOrigin(0.5, 0.5);
    this.add(this.text1);

    this.scene.add.existing(this);
    this.setScrollFactor(0);

    EventEmitter.on(Constants.SCORE_UPDATED, this.scoreUpdated, this);
  }

  scoreUpdated() {
    console.log('here it is');
    console.log(this.text1);
    console.log('Model.score: ', Model.score);
    this.text1.setSize(49);
    this.text1.setText(`SCORE:\n${Model.score}`);
  }
}

export default ScoreBox;