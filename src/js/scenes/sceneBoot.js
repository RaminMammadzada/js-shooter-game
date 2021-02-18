import Phaser from 'phaser';
import Align from '../classes/util/align';
import AlignGrid from '../classes/util/alignGrid';
import FlatButton from '../classes/ui/flatButton';
import EventEmitter from '../classes/util/eventEmitter';
import Model from '../classes/modelAndController/model';

class SceneBoot extends Phaser.Scene {
  constructor() {
    super('SceneBoot');
  }
  preload() {
    // this.load.image("button1", "images/ui/buttons/2/1.png")
    // this.load.image("title", "images/title.png");
  }
  create() {
    this.add.image(0, 0, 'background').setOrigin(0.5, 0.5);
    this.alignGrid = new AlignGrid({ rows: 11, cols: 11, scene: this });
    // this.alignGrid.showNumbers();

    let title = this.add.image(0, 0, 'title');
    Align.scaleToGameW(title, 0.8, this.game);
    this.alignGrid.placeAtIndex(16, title);

    this.winnerText = this.add.text(0, 0, 'WINNER IS', { fontSize: this.game.config.width / 10, color: '#C73B2C' });
    this.winnerText.setOrigin(0.5, 0.5);
    this.alignGrid.placeAtIndex(38, this.winnerText);

    if (Model.playerWon === true) {
      this.winner = this.add.image(0, 0, 'playerShip');
      this.winnerText.setText('YOU WON');
    } else {
      this.winner = this.add.image(0, 0, 'enemyShip');
      this.winnerText.setText('THE ENEMY WON');
    }

    Align.scaleToGameW(this.winner, 0.25, this.game);
    this.winner.angle = 0;
    this.alignGrid.placeAtIndex(71, this.winner);

    let btnStart = new FlatButton({ scene: this, key: 'button1', text: 'Play Again!', event: 'start_game' })
    this.alignGrid.placeAtIndex(104, btnStart);

    EventEmitter.on('start_game', this.startGame, this);
  }
  startGame() {
    location.reload();
  }
  update() { }
}

export default SceneBoot;