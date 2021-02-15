import Model from '../mc/model';
import Emitter from './emitter';
import Constants from '../../constants';

class MediaManager {
  constructor(config) {
    this.scene = config.scene;

    Emitter.on(Constants.PLAY_SOUND, this.playSound, this);
    Emitter.on(Constants.MUSIC_CHANGED, this.musicChanged, this);
  }

  musicChanged() {
    if (this.background) {
      if (Model.musicOn === false) {
        this.background.stop();
      } else {
        this.background.play();
      }
    }
  }

  playSound(key) {
    if (Model.soundOn) {
      const sound = this.scene.sound.add(key);
      sound.play();
    }
  }

  setBackgroundMusic(key) {
    if (Model.musicOn) {
      this.background = this.scene.sound.add(
        key,
        {
          volume: 0.5,
          loop: true,
        },
      );
      this.background.play();
    }
  }
}

export default MediaManager;