import Phaser from 'phaser';
import button1 from '../../images/ui/buttons/2/1.png';
import title from '../../images/title.png';
import EventEmitter from '../classes/util/eventEmitter';
import Align from '../classes/util/align';
import AlignGrid from '../classes/util/alignGrid';
import FlatButton from '../classes/ui/flatButton';
import SoundButtons from '../classes/ui/soundButtons';
import MediaManager from '../classes/util/mediaManager';
import Model from '../classes/modelAndController/model';

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

    this.alignGrid = new AlignGrid({ rows: 11, cols: 11, scene: this });

    const title = this.add.image(0, 0, 'title');
    Align.scaleToGameW(title, 0.8, this.game);
    this.alignGrid.placeAtIndex(38, title);

    const playerIcon = this.add.image(0, 0, 'playerShip');
    const enemyIcon = this.add.image(0, 0, 'enemyShip');
    Align.scaleToGameW(playerIcon, 0.15, this.game);
    Align.scaleToGameW(enemyIcon, 0.35, this.game);
    this.alignGrid.placeAtIndex(69, playerIcon);
    this.alignGrid.placeAtIndex(73, enemyIcon);
    playerIcon.angle = 90;
    playerIcon.flipX = true;
    enemyIcon.angle = 180;

    this.textField = this.add.text(0, 0, 'write your name here', { fixedWidth: this.game.config.width / 2.2, fixedHeight: this.game.config.height / 20, backgroundColor: '#0A0A0A' });
    this.textField.setOrigin(0.5, 0.5);
    this.alignGrid.placeAtIndex(104, this.textField);
    this.elem = '';
    this.textField.setInteractive().on('pointerdown', () => {
      const editor = this.rexUI.edit(this.textField);
      this.elem = editor.inputText.node;
      this.elem.placeholder = 'write your name here';
      this.elem.autofocus = true;
      this.elem.value = '';
    });

    this.buttonStart = new FlatButton({
      scene: this,
      key: 'button1',
      text: 'start',
      event: 'start_game',
    });
    this.alignGrid.placeAtIndex(115, this.buttonStart);

    this.buttonStart.visible = false;

    EventEmitter.on('start_game', this.startGame, this);

    const soundButtons = new SoundButtons({ scene: this });
    soundButtons.depth = 1;
  }

  startGame() {
    this.scene.start('SceneMain');
  }

  update() {
    if (this.elem !== '') {
      if (this.elem.value !== '') {
        Model.username = this.elem.value;
        this.buttonStart.visible = true;
      } else {
        Model.username = this.elem.value;
        this.buttonStart.visible = false;
      }
    }
  }
}

export default SceneTitle;