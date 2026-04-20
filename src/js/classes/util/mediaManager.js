import Model from '../modelAndController/model';
import EventEmitter from './eventEmitter';
import Constants from '../../constants';
import { getSpaceMusic } from './spaceMusic';

class MediaManager {
  constructor(config) {
    this.scene = config.scene;
    this.music = getSpaceMusic();

    EventEmitter.on(Constants.PLAY_SOUND, this.playSound, this);
    EventEmitter.on(Constants.MUSIC_CHANGED, this.musicChanged, this);
  }

  musicChanged() {
    if (Model.musicOn === false) {
      this.music.stop();
    } else {
      this.music.start();
    }
  }

  playSound(key) {
    if (Model.soundOn) {
      const sound = this.scene.sound.add(key, { volume: 0.2 });
      sound.play();
    }
  }

  // Kept for API compatibility; the `key` is ignored because background
  // music is now generated procedurally by SpaceMusic.
  setBackgroundMusic() {
    if (Model.musicOn) {
      this.music.start();
    }
  }
}

export default MediaManager;