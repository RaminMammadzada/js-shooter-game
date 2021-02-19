import Phaser from 'phaser';
import button1 from '../../images/ui/buttons/2/1.png';
import title from '../../images/title.png';
import EventEmitter from '../classes/util/eventEmitter';
import AlignGrid from '../classes/util/alignGrid';
import FlatButton from '../classes/ui/flatButton';
import { getScores } from '../classes/util/serviceApi';

class SceneLeaderboard extends Phaser.Scene {
  constructor() {
    super('SceneLeaderboard');
  }

  preload() {
    this.load.image('button1', button1);
    this.load.image('title', title);
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0.5, 0.5);
    this.alignGrid = new AlignGrid({ rows: 13, cols: 13, scene: this });

    this.addTitleOfLeaderboard();
    getScores().then((response) => { this.addUserAndScore(response.result); });

    this.buttonStart = new FlatButton({
      scene: this, key: 'button1', text: 'Play Again!', event: 'start_game',
    });
    this.alignGrid.placeAtIndex(149, this.buttonStart);

    EventEmitter.on('start_game', this.startGame, this);
  }

  addTitleOfLeaderboard() {
    this.headText = this.add.text(0, 0, 'LEADERBOARD', { fontSize: this.game.config.width / 10 });
    this.headText.setOrigin(0.5, 0.5);
    this.alignGrid.placeAtIndex(19, this.headText);

    this.subText = this.add.text(0, 0, '... The kings in the cosmos war ...', { fontSize: this.game.config.width / 27 });
    this.subText.setOrigin(0.5, 0.5);
    this.alignGrid.placeAtIndex(32, this.subText);
  }

  addUserAndScore(userAnScores) {
    userAnScores.sort((a, b) => ((a.score < b.score) ? 1 : -1));
    const leaders = userAnScores.slice(0, 5);

    const startLocation = 54;
    for (let i = 0; i < leaders.length; i += 1) {
      this.userName = this.add.text(
        0,
        0,
        leaders[i].user,
        { fontSize: this.game.config.width / 25 },
      );
      this.userName.setOrigin(0, 0);
      this.alignGrid.placeAtIndex(startLocation + 13 * i, this.userName);

      this.userScore = this.add.text(
        0,
        0,
        leaders[i].score,
        { fontSize: this.game.config.width / 25 },
      );
      this.userScore.setOrigin(0, 0);
      this.alignGrid.placeAtIndex(startLocation + 13 * i + 7, this.userScore);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  startGame() {
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  }
}

export default SceneLeaderboard;