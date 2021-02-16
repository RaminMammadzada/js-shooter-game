import Phaser from 'phaser';
import button1 from '../../images/ui/buttons/2/1.png';
import title from '../../images/title.png';
import EventEmitter from '../classes/util/eventEmitter';
import Align from '../classes/util/align';
import AlignGrid from '../classes/util/alignGrid';
import FlatButton from '../classes/ui/flatButton';
import Controller from '../classes/mc/controller';

class SceneTitle extends Phaser.Scene {
  constructor() {
    super('SceneTitle');
  }

  preload() {
    this.load.image('button1', button1);
    this.load.image('title', title);
  }

  create() {
    Controller.setEmitters();
    this.alignGrid = new AlignGrid({ rows: 11, cols: 11, scene: this, game: this.game });
    this.alignGrid.showNumbers();

    const title = this.add.image(0, 0, 'title');
    Align.scaleToGameW(title, 0.8, this.game);
    this.alignGrid.placeAtIndex(38, title);

    const btnStart = new FlatButton({
      scene: this,
      key: 'button1',
      text: 'start',
      event: 'start_game',
    });
    this.alignGrid.placeAtIndex(93, btnStart);

    EventEmitter.on('start_game', this.startGame, this);
    this.scene.start('SceneMain');
  }

  startGame() {
    this.scene.start('SceneMain');
  }

  update() { }
}

export default SceneTitle;