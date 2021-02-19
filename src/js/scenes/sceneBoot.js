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

  create() {
    this.add.image(0, 0, 'background').setOrigin(0.5, 0.5);
    this.alignGrid = new AlignGrid({ rows: 15, cols: 15, scene: this });
    // this.alignGrid.showNumbers();

    const title = this.add.image(0, 0, 'title');
    Align.scaleToGameW(title, 0.8, this.game);
    this.alignGrid.placeAtIndex(37, title);

    this.winnerText = this.add.text(0, 0, 'WINNER IS', { fontSize: this.game.config.width / 10, color: '#C73B2C' });
    this.winnerText.setOrigin(0.5, 0.5);
    this.alignGrid.placeAtIndex(67, this.winnerText);

    if (Model.playerWon === true) {
      this.winner = this.add.image(0, 0, 'playerShip');
      this.winnerText.setText('YOU WON');
    } else {
      this.winner = this.add.image(0, 0, 'enemyShip');
      this.winnerText.setText('THE ENEMY WON');
    }

    Align.scaleToGameW(this.winner, 0.25, this.game);
    this.winner.angle = 0;
    this.alignGrid.placeAtIndex(112, this.winner);

    const buttonStart = new FlatButton({
      scene: this, key: 'button1', text: 'Play Again!', event: 'start_game',
    });
    this.alignGrid.placeAtIndex(157, buttonStart);

    const buttonLeaderboard = new FlatButton({
      scene: this, key: 'button1', text: 'Leaderboard', event: 'go_leaderboard',
    });
    this.alignGrid.placeAtIndex(202, buttonLeaderboard);

    EventEmitter.on('start_game', this.startGame, this);
    EventEmitter.on('go_leaderboard', this.goToLeaderboard, this);
  }

  // eslint-disable-next-line class-methods-use-this
  startGame() {
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  }

  goToLeaderboard() {
    this.scene.start('SceneLeaderboard');
  }
}

export default SceneBoot;