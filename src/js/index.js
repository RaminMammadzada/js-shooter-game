import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import SceneLoad from './scenes/sceneLoad';
import SceneTitle from './scenes/sceneTitle';
import SceneMain from './scenes/SceneMain';
import SceneOver from './scenes/SceneOver';
import Model from './classes/modelAndController/model';

class Game extends Phaser.Game {
  constructor() {
    const isMobile = navigator.userAgent.indexOf('Mobile');
    const isTablet = navigator.userAgent.indexOf('Tablet');
    Model.isMobile = (isMobile !== -1);
    Model.isTablet = (isTablet !== -1);

    let config;
    if (!Model.isMobile) {
      config = {
        type: Phaser.AUTO,
        width: 480,
        height: 640,
        parent: 'phaser-game',
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scene: [SceneLoad, SceneTitle, SceneMain, SceneOver],
        dom: {
          createContainer: true,
        },
        plugins: {
          scene: [
            {
              key: 'rexUI',
              plugin: RexUIPlugin,
              mapping: 'rexUI',
            },
          ],
        },
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
            debug: false,
          },
        },
        scene: [SceneLoad, SceneTitle, SceneMain, SceneOver],
        dom: {
          createContainer: true,
        },
        plugins: {
          scene: [
            {
              key: 'rexUI',
              plugin: RexUIPlugin,
              mapping: 'rexUI',
            },
          ],
        },
      };
    }
    super(config);
  }
}

window.game = new Game();