import SceneMain from '../../src/js/scenes/sceneMain';
import EventEmitter from '../../src/js/classes/util/eventEmitter';
import Constants from '../../src/constants';
import Model from '../../src/js/classes/modelAndController/model';

// Mock global objects and Phaser components
jest.mock('../../src/js/classes/util/eventEmitter');
jest.mock('../../src/constants', () => ({
  PLAY_SOUND: 'playSound',
  UP_POINTS: 'upPoints',
}));
jest.mock('../../src/js/classes/modelAndController/model', () => ({
  playerWon: true,
  isMobile: false,
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

// Mock Phaser's Math.Angle and Math.Distance
const mockAngleBetween = jest.fn().mockReturnValue(0); // Default mock return
const mockDistanceBetween = jest.fn().mockReturnValue(100); // Default mock return

Phaser.Math.Angle = {
  Between: mockAngleBetween,
};
Phaser.Math.Distance = {
  Between: mockDistanceBetween,
};


describe('SceneMain - Enhanced Enemy AI (fireBulletForEnemyShip)', () => {
  let sceneMain;
  let mockPlayerShip;
  let mockEnemyShip;
  let mockEnemyBullet;
  let mockPhysicsMoveTo;

  beforeEach(() => {
    // Create a new instance of SceneMain for each test
    sceneMain = new SceneMain();

    // Mock necessary scene properties and methods
    sceneMain.game = {
      config: { width: 800, height: 600 },
      input: { mousePointer: { worldX: 0, worldY: 0 } },
    };
    sceneMain.cameras = { main: { setBounds: jest.fn(), startFollow: jest.fn() } };
    sceneMain.add = { image: jest.fn().mockReturnThis(), sprite: jest.fn().mockReturnThis(), text: jest.fn().mockReturnThis() };
    sceneMain.physics = {
      add: {
        sprite: jest.fn(() => mockEnemyBullet), // Ensure this returns the bullet
        group: jest.fn().mockReturnValue({ add: jest.fn(), getChildren: jest.fn().mockReturnValue([]) }),
        collider: jest.fn(),
      },
      moveTo: jest.fn(),
      world: { setBounds: jest.fn() },
    };
    mockPhysicsMoveTo = sceneMain.physics.moveTo; // Spy on this specific mock

    sceneMain.anims = { generateFrameNumbers: jest.fn().mockReturnValue([]), create: jest.fn() };
    sceneMain.input = { keyboard: { addKey: jest.fn().mockReturnValue({ isDown: false }) } };
    sceneMain.playerPowerText = { setText: jest.fn(), setOrigin: jest.fn(), setScrollFactor: jest.fn() };
    sceneMain.enemyPowerText = { setText: jest.fn(), setOrigin: jest.fn(), setScrollFactor: jest.fn() };
    sceneMain.scoreBox = { setScrollFactor: jest.fn() };
    sceneMain.icon1 = { setScrollFactor: jest.fn(), angle: 0 };
    sceneMain.icon2 = { setScrollFactor: jest.fn(), angle: 270 };


    // Mock player ship
    mockPlayerShip = {
      x: 100,
      y: 100,
      body: { velocity: { x: 0, y: 0 }, x: 100, y: 100 }, // Default to stationary
      angle: 0,
      rotation: 0,
      setOrigin: jest.fn(),
      setScale: jest.fn(),
      setInteractive: jest.fn(),
      on: jest.fn(),
      destroy: jest.fn(),
    };
    sceneMain.playerShip = mockPlayerShip;

    // Mock enemy ship
    mockEnemyShip = {
      x: 300,
      y: 100,
      angle: 0,
      body: { angularVelocity: 0, collideWorldBounds: true },
      setOrigin: jest.fn(),
      setScale: jest.fn(),
      destroy: jest.fn(),
    };
    sceneMain.enemyShip = mockEnemyShip;

    // Mock enemy bullet
    mockEnemyBullet = {
      x: mockEnemyShip.x,
      y: mockEnemyShip.y,
      body: { angularVelocity: 10, setVelocity: jest.fn() },
      angle: 0,
      setOrigin: jest.fn(),
      setScale: jest.fn(),
      destroy: jest.fn(),
    };
    // Ensure physics.add.sprite returns this specific mock bullet
    sceneMain.physics.add.sprite.mockImplementation((x,y,key) => {
      if (key === 'enemyBullet') return mockEnemyBullet;
      return { setOrigin: jest.fn(), setScale: jest.fn(), body: { setVelocity: jest.fn() }, angle: 0, destroy: jest.fn() };
    });


    sceneMain.enemyBulletGroup = { add: jest.fn() };
    sceneMain.playerBulletGroup = { add: jest.fn() };
    sceneMain.rockGroup = { getChildren: jest.fn().mockReturnValue([]), add: jest.fn() };
    sceneMain.spaceMineGroup = { getChildren: jest.fn().mockReturnValue([]), add: jest.fn() };


    // Mock time to allow firing
    sceneMain.lastTimeEnemyBulletFired = 0;
    jest.spyOn(sceneMain, 'getTimer').mockReturnValue(5000); // Ensure enough time has passed

    // Mock other methods called within fireBulletForEnemyShip if necessary
    EventEmitter.emit.mockClear();
    mockPhysicsMoveTo.mockClear();
  });

  test('Enemy fires towards a predicted position when player is moving', () => {
    // Setup player movement
    mockPlayerShip.body.velocity.x = 50; // Player moving right
    mockPlayerShip.body.velocity.y = 20; // Player moving down

    sceneMain.fireBulletForEnemyShip();

    expect(mockPhysicsMoveTo).toHaveBeenCalledTimes(1);
    const [bullet, targetX, targetY, speed] = mockPhysicsMoveTo.mock.calls[0];

    expect(bullet).toBe(mockEnemyBullet); // Check the correct bullet is moved
    expect(speed).toBe(150);

    // Prediction time is 0.5s
    const expectedPredictedX = mockPlayerShip.x + mockPlayerShip.body.velocity.x * 0.5;
    const expectedPredictedY = mockPlayerShip.y + mockPlayerShip.body.velocity.y * 0.5;

    // Allow for randomness (randomFactor = 50, so +/- 25)
    expect(targetX).toBeGreaterThanOrEqual(expectedPredictedX - 25);
    expect(targetX).toBeLessThanOrEqual(expectedPredictedX + 25);
    expect(targetY).toBeGreaterThanOrEqual(expectedPredictedY - 25);
    expect(targetY).toBeLessThanOrEqual(expectedPredictedY + 25);

    // Check that it's not aiming directly at the current player position
    // (unless the prediction + randomness happens to align, which is unlikely but possible)
    // A more robust check is that it's aiming *towards* the predicted area
    expect(targetX).not.toBe(mockPlayerShip.x); // Unlikely to be exact due to prediction and randomness

    expect(EventEmitter.emit).toHaveBeenCalledWith(Constants.PLAY_SOUND, 'playerShoot');
  });

  test('Enemy fires at current player position (with randomness) when player is stationary', () => {
    // Player is stationary by default (velocity x:0, y:0)
    sceneMain.fireBulletForEnemyShip();

    expect(mockPhysicsMoveTo).toHaveBeenCalledTimes(1);
    const [bullet, targetX, targetY, speed] = mockPhysicsMoveTo.mock.calls[0];

    expect(bullet).toBe(mockEnemyBullet);
    expect(speed).toBe(150);

    // When stationary, predictedX/Y is currentX/Y before randomness
    const expectedPredictedX = mockPlayerShip.x; // Since velocity is 0
    const expectedPredictedY = mockPlayerShip.y; // Since velocity is 0

    // Allow for randomness (randomFactor = 50, so +/- 25)
    expect(targetX).toBeGreaterThanOrEqual(expectedPredictedX - 25);
    expect(targetX).toBeLessThanOrEqual(expectedPredictedX + 25);
    expect(targetY).toBeGreaterThanOrEqual(expectedPredictedY - 25);
    expect(targetY).toBeLessThanOrEqual(expectedPredictedY + 25);

    expect(EventEmitter.emit).toHaveBeenCalledWith(Constants.PLAY_SOUND, 'playerShoot');
  });
});

// Mock Phaser namespace if not already fully available via jsdom or similar
if (typeof Phaser === 'undefined') {
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
        Between: mockAngleBetween, // Use the same mock
      },
      Distance: {
        Between: mockDistanceBetween, // Use the same mock
      },
      Between: jest.fn((min, max) => (min + max) / 2), // Simple mock for Phaser.Math.Between
    },
  };
}
