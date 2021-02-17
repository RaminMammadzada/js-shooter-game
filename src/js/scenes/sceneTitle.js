import Phaser from 'phaser';
import button1 from '../../images/ui/buttons/2/1.png';
import title from '../../images/title.png';
import EventEmitter from '../classes/util/eventEmitter';
import Align from '../classes/util/align';
import AlignGrid from '../classes/util/alignGrid';
import FlatButton from '../classes/ui/flatButton';
import Controller from '../classes/mc/controller';
import SoundButtons from '../classes/ui/soundButtons';
import MediaManager from '../classes/util/mediaManager';

class SceneTitle extends Phaser.Scene {
  constructor() {
    super('SceneTitle');
  }

  preload() {
    this.load.image('button1', button1);
    this.load.image('title', title);
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0.5, 0.5);

    const mediaManager = new MediaManager({ scene: this });
    mediaManager.setBackgroundMusic('backgroundMusic');

    Controller.setEmitters();
    this.alignGrid = new AlignGrid({ rows: 11, cols: 11, scene: this });
    // this.alignGrid.showNumbers();

    const title = this.add.image(0, 0, 'title');
    Align.scaleToGameW(title, 0.8, this.game);
    this.alignGrid.placeAtIndex(38, title);

    const playerIcon = this.add.image(0, 0, 'playerShip');
    const enemyIcon = this.add.image(0, 0, 'enemyShip');
    Align.scaleToGameW(playerIcon, 0.15, this.game);
    Align.scaleToGameW(enemyIcon, 0.35, this.game);
    this.alignGrid.placeAtIndex(69, playerIcon);
    this.alignGrid.placeAtIndex(73, enemyIcon);
    playerIcon.angle = 180;
    playerIcon.flipX = true;
    enemyIcon.angle = 180;

    const btnStart = new FlatButton({
      scene: this,
      key: 'button1',
      text: 'start',
      event: 'start_game',
    });
    this.alignGrid.placeAtIndex(104, btnStart);

    EventEmitter.on('start_game', this.startGame, this);
    // this.scene.start('SceneMain');

    const soundButtons = new SoundButtons({ scene: this });
  }

  startGame() {
    this.scene.start('SceneMain');
  }

  update() { }
}

export default SceneTitle;