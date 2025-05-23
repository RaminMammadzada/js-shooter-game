import SceneMain from '../../src/js/scenes/sceneMain';
import Model from '../../src/js/classes/modelAndController/model'; // Mocked

// Mock global objects and Phaser components
jest.mock('../../src/js/classes/util/eventEmitter');
jest.mock('../../src/constants');
jest.mock('../../src/js/classes/modelAndController/model', () => ({
  playerWon: true,
  isMobile: false, // Important for update() logic that calls rotatePlayer
  score: 0,
  username: 'testuser',
}));
jest.mock('../../src/js/classes/util/mediaManager');
jest.mock('../../src/js/classes/ui/soundButtons');
jest.mock('../../src/js/classes/comps/scoreBox');
jest.mock('../../src/js/classes/modelAndController/controller');
jest.mock('../../src/js/classes/util/align');
jest.mock('../../src/js/classes/util/alignGrid');
jest.mock('../../src/js/classes/util/serviceApi', () => ({
  postScore: jest.fn(),
}));

// Mock Phaser's Math.Distance.Between
const mockDistanceBetween = jest.fn();
// Mock Phaser's Math.Angle.Between for rotatePlayer
const mockAngleBetween = jest.fn().mockReturnValue(0);


describe('SceneMain - Basic Sprite Scaling (in update)', () => {
  let sceneMain;
  let mockPlayerShip;
  let mockEnemyShip;

  beforeEach(() => {
    // Mock Phaser namespace before scene instantiation
    global.Phaser = {
        Input: {
            Keyboard: {
                KeyCodes: {
                    SPACE: 32,
                }
            }
        },
        GameObjects: {
          Image: jest.fn(),
          Sprite: jest.fn(),
        },
        Physics: {
          Arcade: {
            Sprite: jest.fn(),
          },
        },
        Math: {
          Angle: {
            Between: mockAngleBetween,
          },
          Distance: {
            Between: mockDistanceBetween,
          },
          Between: jest.fn((min, max) => (min + max) / 2),
        },
      };

    sceneMain = new SceneMain();

    // Common scene mocks
    sceneMain.game = {
      config: { width: 800, height: 600 },
      input: { mousePointer: { worldX: 0, worldY: 0 } }, // For rotatePlayer and setTargetIconLocation
    };
    // Mock methods called within update that are not under test
    sceneMain.fireBulletForEnemyShip = jest.fn();
    sceneMain.fireBulletForPlayerShip = jest.fn();
    sceneMain.rotatePlayer = jest.fn(); // Mocked as Model.isMobile is false
    sceneMain.setTargetIconLocation = jest.fn(); // Mocked as Model.isMobile is false

    // Mock player and enemy ships
    mockPlayerShip = { x: 400, y: 300, body: { velocity: {x:0, y:0} } }; // body needed for fireBulletForEnemyShip if not mocked
    mockEnemyShip = {
      x: 400,
      y: 100,
      scaleX: 0.25, // Initial scale
      scaleY: 0.25, // Initial scale
      setScale: jest.fn(),
      body: {} // body needed for fireBulletForEnemyShip if not mocked
    };
    sceneMain.playerShip = mockPlayerShip;
    sceneMain.enemyShip = mockEnemyShip;
    sceneMain.enemyShipOriginalScale = 0.25; // Set this as it's done in create()

    // Clear mocks
    mockDistanceBetween.mockClear();
    mockEnemyShip.setScale.mockClear();
    sceneMain.fireBulletForEnemyShip.mockClear(); // Clear this as it's called in update
    sceneMain.keySpace = { isDown: false }; // Ensure space key is not down
  });

  test('Enemy scale is set to actualMaxScale when distance is less than minDistance', () => {
    mockDistanceBetween.mockReturnValue(sceneMain.game.config.width * 0.05); // Very close

    sceneMain.update();

    const actualMaxScale = sceneMain.enemyShipOriginalScale * 1.1;
    expect(mockEnemyShip.setScale).toHaveBeenCalledWith(actualMaxScale);
  });

  test('Enemy scale is set to actualMinScale when distance is greater than maxDistance', () => {
    mockDistanceBetween.mockReturnValue(sceneMain.game.config.width * 0.8); // Very far

    sceneMain.update();

    const actualMinScale = sceneMain.enemyShipOriginalScale * 0.9;
    expect(mockEnemyShip.setScale).toHaveBeenCalledWith(actualMinScale);
  });

  test('Enemy scale is interpolated when distance is between minDistance and maxDistance', () => {
    const minDistance = sceneMain.game.config.width * 0.1;
    const maxDistance = sceneMain.game.config.width * 0.75;
    const currentDistance = (minDistance + maxDistance) / 2; // Intermediate distance
    mockDistanceBetween.mockReturnValue(currentDistance);

    sceneMain.update();

    const actualMaxScale = sceneMain.enemyShipOriginalScale * 1.1;
    const actualMinScale = sceneMain.enemyShipOriginalScale * 0.9;
    const normalizedDistance = (currentDistance - minDistance) / (maxDistance - minDistance);
    const expectedScale = actualMaxScale - (normalizedDistance * (actualMaxScale - actualMinScale));

    expect(mockEnemyShip.setScale).toHaveBeenCalledWith(expectedScale);
  });
});
