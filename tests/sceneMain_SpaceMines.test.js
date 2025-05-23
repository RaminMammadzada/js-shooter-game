import SceneMain from '../../src/js/scenes/sceneMain';
import EventEmitter from '../../src/js/classes/util/eventEmitter';
import Constants from '../../src/constants';
import Model from '../../src/js/classes/modelAndController/model'; // Mocked

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

describe('SceneMain - Space Mines', () => {
  let sceneMain;
  let mockMine;
  let mockPlayerShip;
  let mockBullet;
  let mockExplosion;

  beforeEach(() => {
    sceneMain = new SceneMain();

    // Common scene mocks
    sceneMain.game = {
      config: { width: 800, height: 600 },
      input: { mousePointer: { worldX: 0, worldY: 0 } },
    };
    sceneMain.cameras = { main: { setBounds: jest.fn(), startFollow: jest.fn() } };
    
    mockExplosion = { play: jest.fn() };
    sceneMain.add = {
      sprite: jest.fn().mockReturnValue(mockExplosion), // For explosions
      image: jest.fn().mockReturnValue({ setOrigin: jest.fn().mockReturnThis(), setScale: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), angle:0, tint:0, setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis(), displayWidth: 100, displayHeight: 100 }),
      text: jest.fn().mockReturnValue({ setOrigin: jest.fn().mockReturnThis(), setText: jest.fn(), setScrollFactor: jest.fn() }),
    };

    sceneMain.physics = {
      add: {
        sprite: jest.fn(), // Will be more specifically mocked in tests
        group: jest.fn().mockReturnValue({ add: jest.fn(), getChildren: jest.fn().mockReturnValue([]) }),
        collider: jest.fn(),
      },
      world: { setBounds: jest.fn() },
      moveTo: jest.fn(),
    };
    sceneMain.anims = { generateFrameNumbers: jest.fn().mockReturnValue([]), create: jest.fn() };
    sceneMain.input = { keyboard: { addKey: jest.fn().mockReturnValue({ isDown: false }) } };


    // Mock player ship
    mockPlayerShip = { x: 100, y: 100, body: {}, destroy: jest.fn() };
    sceneMain.playerShip = mockPlayerShip;

    // Mock mine (can be reused and re-mocked)
    mockMine = {
      x: 200,
      y: 200,
      destroy: jest.fn(),
      setTint: jest.fn().mockReturnThis(),
      setScale: jest.fn().mockReturnThis(),
      body: { setImmovable: jest.fn(), setVelocity: jest.fn() },
    };
    
    // Mock bullet
    mockBullet = { x: 150, y: 150, destroy: jest.fn() };

    // Mock groups
    sceneMain.spaceMineGroup = { add: jest.fn(), getChildren: jest.fn().mockReturnValue([]) }; // Default to empty
    sceneMain.playerBulletGroup = { add: jest.fn() };
    sceneMain.enemyBulletGroup = { add: jest.fn() };
    sceneMain.rockGroup = { getChildren: jest.fn().mockReturnValue([]), add: jest.fn() };
    
    // Background layer for mine positioning
    sceneMain.backgroundLayerNear = { displayWidth: 800, displayHeight: 600, setInteractive: jest.fn().mockReturnThis(), on: jest.fn() };


    // Spies and clear mocks
    jest.spyOn(sceneMain, 'decreasePlayerPower').mockImplementation(() => {
      sceneMain.playerPower = (sceneMain.playerPower || 30) -1; // Simulate power decrease
    });
    jest.spyOn(sceneMain, 'addSpaceMines').mockCallThrough(); // Spy but allow original implementation
    EventEmitter.emit.mockClear();
    mockMine.destroy.mockClear();
    mockBullet.destroy.mockClear();
    if (mockExplosion.play) mockExplosion.play.mockClear();
    sceneMain.add.sprite.mockClear().mockReturnValue(mockExplosion); // Reset and ensure it returns explosion
    sceneMain.physics.add.sprite.mockClear().mockReturnValue(mockMine); // Default to returning a mine
  });

  test('addSpaceMines creates and adds mines to the group', () => {
    const mineBodyMock = { setImmovable: jest.fn(), setVelocity: jest.fn() };
    const mineSpriteMock = {
      setTint: jest.fn().mockReturnThis(),
      setScale: jest.fn().mockReturnThis(),
      body: mineBodyMock,
    };
    sceneMain.physics.add.sprite.mockReturnValue(mineSpriteMock); // Specific mock for this test

    sceneMain.addSpaceMines(3);

    expect(sceneMain.physics.add.sprite).toHaveBeenCalledTimes(3);
    expect(sceneMain.spaceMineGroup.add).toHaveBeenCalledTimes(3);
    
    // Check properties for each created mine
    expect(mineSpriteMock.setTint).toHaveBeenCalledWith(0xff0000);
    expect(mineSpriteMock.setScale).toHaveBeenCalledWith(1.5);
    expect(mineBodyMock.setImmovable).toHaveBeenCalledWith(true);
    expect(mineBodyMock.setVelocity).toHaveBeenCalledWith(0, 0);
    
    // Check they are added to the group
    expect(sceneMain.spaceMineGroup.add).toHaveBeenCalledWith(mineSpriteMock);
  });

  test('playerHitMine reduces player power, destroys mine, and respawns if group empty', () => {
    sceneMain.playerPower = 30; // Reset player power
    sceneMain.spaceMineGroup.getChildren.mockReturnValue([]); // Simulate empty group for respawn

    sceneMain.playerHitMine(mockPlayerShip, mockMine);

    expect(sceneMain.add.sprite).toHaveBeenCalledWith(mockMine.x, mockMine.y, 'exp');
    expect(mockExplosion.play).toHaveBeenCalledWith('boom');
    expect(EventEmitter.emit).toHaveBeenCalledWith(Constants.PLAY_SOUND, 'explode');
    expect(mockMine.destroy).toHaveBeenCalledTimes(1);
    expect(sceneMain.decreasePlayerPower).toHaveBeenCalledTimes(2);
    expect(sceneMain.playerPower).toBe(28); // Check power actually decreased
    expect(sceneMain.addSpaceMines).toHaveBeenCalledTimes(1); // Called due to empty group
  });

  test('playerBulletHitMine destroys bullet and mine, increases score, and respawns if group empty', () => {
    sceneMain.spaceMineGroup.getChildren.mockReturnValue([]); // Simulate empty group for respawn

    sceneMain.playerBulletHitMine(mockBullet, mockMine);

    expect(sceneMain.add.sprite).toHaveBeenCalledWith(mockMine.x, mockMine.y, 'exp');
    expect(mockExplosion.play).toHaveBeenCalledWith('boom');
    expect(EventEmitter.emit).toHaveBeenCalledWith(Constants.PLAY_SOUND, 'explode');
    expect(mockMine.destroy).toHaveBeenCalledTimes(1);
    expect(mockBullet.destroy).toHaveBeenCalledTimes(1);
    expect(EventEmitter.emit).toHaveBeenCalledWith(Constants.UP_POINTS, 5); // Specific points
    expect(sceneMain.addSpaceMines).toHaveBeenCalledTimes(1); // Called due to empty group
  });

  test('enemyBulletHitMine destroys bullet and mine, and respawns if group empty', () => {
    sceneMain.spaceMineGroup.getChildren.mockReturnValue([]); // Simulate empty group for respawn

    sceneMain.enemyBulletHitMine(mockBullet, mockMine); // Using generic mockBullet for enemy bullet as well

    expect(sceneMain.add.sprite).toHaveBeenCalledWith(mockMine.x, mockMine.y, 'exp');
    expect(mockExplosion.play).toHaveBeenCalledWith('boom');
    expect(EventEmitter.emit).toHaveBeenCalledWith(Constants.PLAY_SOUND, 'explode');
    expect(mockMine.destroy).toHaveBeenCalledTimes(1);
    expect(mockBullet.destroy).toHaveBeenCalledTimes(1);
    expect(sceneMain.addSpaceMines).toHaveBeenCalledTimes(1); // Called due to empty group
  });
});

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
        Between: jest.fn(),
      },
      Distance: {
        Between: jest.fn(),
      },
      Between: jest.fn((min, max) => (min + max) / 2), // Simple mock for Phaser.Math.Between
    },
  };
}
