import Phaser from 'phaser';
import toggle1 from '../../images/ui/toggles/1.png';
import sfxOff from '../../images/ui/icons/sfx_off.png';
import sfxOn from '../../images/ui/icons/sfx_on.png';
import musicOn from '../../images/ui/icons/music_on.png';
import musicOff from '../../images/ui/icons/music_off.png';
import playerShip from '../../images/player.png';
import backgroundImage from '../../images/background.jpg';
import rocks from '../../images/rocks.png';
import bullet from '../../images/bullet.png';
import enemyBullet from '../../images/enemyBullet.png';
import exp from '../../images/exp.png';
import enemyShip from '../../images/enemy.png';
import target from '../../images/target.png';
import Bar from '../classes/comps/bar';
import backgroundMusic1 from '../../audio/background.mp3';
import backgroundMusic2 from '../../audio/background.ogg';
import explode1 from '../../audio/explode.wav';
import explode2 from '../../audio/explode.ogg';
import playerShoot1 from '../../audio/playerShoot.wav';
import playerShoot2 from '../../audio/playerShoot.ogg';
import enemyShoot1 from '../../audio/enemyShoot.wav';
import enemyShoot2 from '../../audio/enemyShoot.ogg';

class ScenePreloader extends Phaser.Scene {
  constructor() {
    super('ScenePreloader');
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

    this.load.audio('explode', [explode1, explode2]);
    this.load.audio('playerShoot', [playerShoot1, playerShoot2]);
    this.load.audio('enemyShoot', [enemyShoot1, enemyShoot2]);
    this.load.audio('backgroundMusic', [backgroundMusic1, backgroundMusic2]);

    this.load.image('toggleBack', toggle1);
    this.load.image('sfxOff', sfxOff);
    this.load.image('sfxOn', sfxOn);
    this.load.image('musicOn', musicOn);
    this.load.image('musicOff', musicOff);

    this.load.image('playerShip', playerShip);
    this.load.image('background', backgroundImage);

    this.load.spritesheet('rocks', rocks, { frameWidth: 125, frameHeight: 100 });
    this.load.spritesheet('exp', exp, { frameWidth: 64, frameHeight: 64 });
    this.load.image('bullet', bullet);
    this.load.image('enemyBullet', enemyBullet);
    this.load.image('enemyShip', enemyShip);
    this.load.image('target', target);
  }

  onProgress(value) {
    this.bar.setPercent(value);
    const per = Math.floor(value * 100);
    this.progText.setText(`${per}%`);
  }

  create() {
    this.scene.start('SceneTitle');
  }
}

export default ScenePreloader;