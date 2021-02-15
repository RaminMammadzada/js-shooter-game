import Phaser from 'phaser';
import Emitter from '../classes/util/emitter';
import MediaManager from '../classes/util/mediaManager';
import SoundButtons from '../classes/ui/soundButtons';

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

    // controller = new Controller();
    console.log(this);
    const mediaManager = new MediaManager({ scene: this });

    mediaManager.setBackgroundMusic('backgroundMusic');

    let sb = new SoundButtons({ scene: this });
  }



  update() {
    // constant running loop
  }
}

export default SceneMain;