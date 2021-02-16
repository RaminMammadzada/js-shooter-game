import Phaser from 'phaser';
import SceneLoad from './scenes/SceneLoad';
import SceneTitle from './scenes/SceneTitle';
import SceneMain from './scenes/SceneMain';
import SceneOver from './scenes/SceneOver';
import Model from './classes/mc/model';

let isMobile = navigator.userAgent.indexOf('Mobile');
Model.isMobile = isMobile;
let config;
if (isMobile === -1) {
  isMobile = navigator.userAgent.indexOf('Tablet');
}
if (isMobile === -1) {
  config = {
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    parent: 'phaser-game',
    physics: {
      default: 'arcade',
      arcade: {
        debug: true,
      },
    },
    scene: [SceneLoad, SceneTitle, SceneMain, SceneOver],
  };
} else {
  config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'phaser-game',
    physics: {
      default: 'arcade',
      arcade: {
        debug: true,
      },
    },
    scene: [SceneLoad, SceneTitle, SceneMain, SceneOver],
  };
}

let game = new Phaser.Game(config);