import Phaser from 'phaser';
import SceneLoad from '../../src/js/scenes/SceneLoad';
import SceneTitle from '../../src/js/scenes/SceneTitle';
import SceneMain from '../../src/js/scenes/SceneMain';
import SceneOver from '../../src/js/scenes/SceneOver';
import Model from '../../src/js/classes/mc/model';

const model = new Model();
let isMobile = navigator.userAgent.indexOf('Mobile');
model.isMobile = isMobile;
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
    scene: [SceneLoad, SceneTitle, SceneMain, SceneOver],
  };
} else {
  config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'phaser-game',
    scene: [SceneLoad, SceneTitle, SceneMain, SceneOver],
  };
}

let game = new Phaser.Game(config);