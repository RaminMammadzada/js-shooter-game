import Phaser from 'phaser';
import Emitter from '../util/emitter';

class ScoreBox extends Phaser.GameObjects.Container {
  constructor(config) {
    super(config.scene);
    this.scene = config.scene;
    //
    this.text1 = this.scene.add.text(0, 0, 'SCORE:0', { fontSize: game.config.width / 20 });
    this.text1.setOrigin(0.5, 0.5);
    this.add(this.text1);

    this.scene.add.existing(this);

    Emitter.on(G.SCORE_UPDATED, this.scoreUpdated, this);
  }

  scoreUpdated() {
    this.text1.setText(`SCORE: ${model.score}`);
  }
}

export default ScoreBox;