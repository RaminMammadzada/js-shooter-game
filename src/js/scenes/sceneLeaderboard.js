import Phaser from 'phaser';
import button1 from '../../images/ui/buttons/2/1.png';
import title from '../../images/title.png';
import EventEmitter from '../classes/util/eventEmitter';
import Align from '../classes/util/align';
import AlignGrid from '../classes/util/alignGrid';
import FlatButton from '../classes/ui/flatButton';
import Controller from '../classes/modelAndController/controller';
import SoundButtons from '../classes/ui/soundButtons';
import MediaManager from '../classes/util/mediaManager';
import Model from '../classes/modelAndController/model';
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
    console.log("I am in Leaderboard Scene");
    this.add.image(0, 0, 'background').setOrigin(0.5, 0.5);

    // const mediaManager = new MediaManager({ scene: this });
    // mediaManager.setBackgroundMusic('backgroundMusic');

    // Controller.setEmitters();
    this.alignGrid = new AlignGrid({ rows: 13, cols: 13, scene: this });
    // this.alignGrid.showNumbers();

    this.addTitleOfLeaderboard();
    getScores().then((response) => { this.addUserAndScore(response.result); });

    this.buttonStart = new FlatButton({ scene: this, key: 'button1', text: 'Play Again!', event: 'start_game' })
    this.alignGrid.placeAtIndex(149, this.buttonStart);

    EventEmitter.on('start_game', this.startGame, this);


    // const title = this.add.image(0, 0, 'title');
    // Align.scaleToGameW(title, 0.8, this.game);
    // this.alignGrid.placeAtIndex(38, title);

    // const playerIcon = this.add.image(0, 0, 'playerShip');
    // const enemyIcon = this.add.image(0, 0, 'enemyShip');
    // Align.scaleToGameW(playerIcon, 0.15, this.game);
    // Align.scaleToGameW(enemyIcon, 0.35, this.game);
    // this.alignGrid.placeAtIndex(69, playerIcon);
    // this.alignGrid.placeAtIndex(73, enemyIcon);
    // playerIcon.angle = 90;
    // playerIcon.flipX = true;
    // enemyIcon.angle = 180;

    // this.textField = this.add.text(0, 0, 'write your name here', { fixedWidth: this.game.config.width / 2.2, fixedHeight: this.game.config.height / 20, backgroundColor: '#0A0A0A' });
    // this.textField.setOrigin(0.5, 0.5);
    // this.alignGrid.placeAtIndex(104, this.textField);
    // this.elem = '';
    // this.textField.setInteractive().on('pointerdown', () => {
    //   const editor = this.rexUI.edit(this.textField);
    //   this.elem = editor.inputText.node;
    //   this.elem.placeholder = 'write your name here';
    //   this.elem.autofocus = true;
    //   this.elem.value = '';
    // });

    // this.btnStart = new FlatButton({
    //   scene: this,
    //   key: 'button1',
    //   text: 'start',
    //   event: 'start_game',
    // });
    // this.alignGrid.placeAtIndex(115, this.btnStart);

    // this.btnStart.visible = false;

    // EventEmitter.on('start_game', this.startGame, this);

    // const soundButtons = new SoundButtons({ scene: this });
    // soundButtons.depth = 1;
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
    console.log(userAnScores);

    userAnScores.sort((a, b) => ((a.score < b.score) ? 1 : -1));
    const leaders = userAnScores.slice(0, 5);

    console.log(leaders);
    const startLocation = 54;
    for (let i = 0; i < leaders.length; i += 1) {
      this.userName = this.add.text(0, 0, leaders[i].user, { fontSize: this.game.config.width / 25 });
      this.userName.setOrigin(0, 0);
      this.alignGrid.placeAtIndex(startLocation + 13 * i, this.userName);

      this.userScore = this.add.text(0, 0, leaders[i].score, { fontSize: this.game.config.width / 25 });
      this.userScore.setOrigin(0, 0);
      this.alignGrid.placeAtIndex(startLocation + 13 * i + 7, this.userScore);
    }
  }

  startGame() {
    location.reload();
    // this.scene.start('SceneLeaderboard');
  }

  update() {
    // if (this.elem !== '') {
    //   if (this.elem.value !== '') {
    //     Model.username = this.elem.value;
    //     this.btnStart.visible = true;
    //   } else {
    //     Model.username = this.elem.value;
    //     this.btnStart.visible = false;
    //   }
    // }
  }
}

export default SceneLeaderboard;