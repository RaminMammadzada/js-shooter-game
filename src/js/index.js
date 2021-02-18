import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import SceneBoot from './scenes/sceneBoot';
import SceneTitle from './scenes/sceneTitle';
import SceneMain from './scenes/sceneMain';
import ScenePreloader from './scenes/scenePreloader';
import SceneLeaderboard from './scenes/sceneLeaderboard';
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
        scene: [ScenePreloader, SceneTitle, SceneMain, SceneBoot, SceneLeaderboard],
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
        scene: [ScenePreloader, SceneTitle, SceneMain, SceneBoot, SceneLeaderboard],
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