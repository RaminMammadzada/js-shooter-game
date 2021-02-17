import Phaser from 'phaser';
import Model from '../mc/model';
import ToggleButton from './toggleButton';
import Constants from '../../constants';

class SoundButtons extends Phaser.GameObjects.Container {
  constructor(config) {
    super(config.scene);
    // console.log(Constants.TOGGLE_MUSIC);
    this.scene = config.scene;
    this.musicButton = new ToggleButton({
      scene: this.scene,
      backKey: 'toggleBack',
      onIcon: 'musicOn',
      offIcon: 'musicOff',
      event: Constants.TOGGLE_MUSIC,
    });
    this.sfxButton = new ToggleButton({
      scene: this.scene,
      backKey: 'toggleBack',
      onIcon: 'sfxOn',
      offIcon: 'sfxOff',
      event: Constants.TOGGLE_SOUND,
      x: 240,
      y: 450,
    });

    this.add(this.musicButton);

    this.musicButton.y = config.scene.game.config.height * 0.95;
    this.musicButton.x = this.musicButton.width * 0.6;

    this.sfxButton.x = config.scene.game.config.width - this.sfxButton.width / 2;
    this.sfxButton.y = this.musicButton.y;

    this.musicButton.setScrollFactor(0);
    this.sfxButton.setScrollFactor(0);

    if (Model.musicOn === true) {
      this.musicButton.toggle();
    }
    if (Model.soundOn === true) {
      this.sfxButton.toggle();
    }

    this.scene.add.existing(this);
  }
}

export default SoundButtons;