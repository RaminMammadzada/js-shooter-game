import Phaser from 'phaser';
import Bar from '../classes/comps/bar';
import button1 from '../../images/ui/buttons/2/1.png';
import button2 from '../../images/ui/buttons/2/5.png';


class SceneLoad extends Phaser.Scene {
  constructor() {
    super('SceneLoad');
  }

  preload() {
    this.bar = new Bar({ scene: this, x: 240, y: 320 });

    this.progText = this.add.text(
      this.game.config.width / 2,
      this.game.config.height / 2,
      '0%',
      {
        color: '#ffffff',
        fontSize: this.game.config.width / 20,
      },
    );
    this.progText.setOrigin(0.5, 0.5);
    this.load.on('progress', this.onProgress, this);

    // load our images or sounds
    // this.load.image('button1', button1);
    // this.load.image('button2', button2);
  }

  onProgress(value) {
    console.log(value);
    this.bar.setPercent(value);
    const per = Math.floor(value * 100);
    this.progText.setText(`${per}%`);
  }

  create() {
    this.scene.start('SceneTitle');
  }
}

export default SceneLoad;