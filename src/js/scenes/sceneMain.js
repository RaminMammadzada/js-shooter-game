import Phaser from 'phaser';
import EventEmitter from '../classes/util/eventEmitter';
import MediaManager from '../classes/util/mediaManager';
import SoundButtons from '../classes/ui/soundButtons';
import Controller from '../classes/mc/controller';

class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }
  preload() {
    // load our images and sounds
  }

  create() {
    // define our object
    // define our object

    Controller.setEmitters();
    // console.log(this);
    const mediaManager = new MediaManager({ scene: this });

    mediaManager.setBackgroundMusic('backgroundMusic');

    let sb = new SoundButtons({ scene: this });

    this.centerX = this.game.config.width / 2;
    this.center = this.game.config.height / 2;

    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    this.ship = this.physics.add.sprite(this.centerX, this.centerY, 'ship');
    sb.depth = 1;
  }

  update() {
    // constant running loop
  }
}

export default SceneMain;