import SceneMain from '../../src/js/scenes/sceneMain';
import Align from '../../src/js/classes/util/align'; // Mocked
import Model from '../../src/js/classes/modelAndController/model'; // Mocked

// Mock global objects and Phaser components
jest.mock('../../src/js/classes/util/eventEmitter');
jest.mock('../../src/constants');
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
jest.mock('../../src/js/classes/util/alignGrid');
jest.mock('../../src/js/classes/util/serviceApi', () => ({
  postScore: jest.fn(),
}));

// Mock Align specifically for scaleToGameW
jest.mock('../../src/js/classes/util/align', () => ({
  scaleToGameW: jest.fn(),
}));


describe('SceneMain - Parallax Scrolling Background (in create)', () => {
  let sceneMain;
  let mockImageFar, mockImageMiddle, mockImageNear;

  beforeEach(() => {
    sceneMain = new SceneMain();

    // Mock necessary scene properties and methods for create()
    sceneMain.game = {
      config: { width: 800, height: 600 },
      input: { mousePointer: { worldX: 0, worldY: 0 } },
    };
    sceneMain.cameras = { main: { setBounds: jest.fn(), startFollow: jest.fn() } };

    // Mock add.image to return distinct mocks for each layer
    mockImageFar = { setOrigin: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setScale: jest.fn().mockReturnThis(), tint: 0, setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis(), displayWidth: 800, displayHeight: 600 };
    mockImageMiddle = { setOrigin: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setScale: jest.fn().mockReturnThis(), tint: 0, setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis(), displayWidth: 800, displayHeight: 600 };
    mockImageNear = { setOrigin: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setScale: jest.fn().mockReturnThis(), tint: 0, setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis(), displayWidth: 800, displayHeight: 600 };

    let callCount = 0;
    sceneMain.add = {
      image: jest.fn(() => {
        callCount++;
        if (callCount === 1) return mockImageFar; // First call for backgroundLayerFar
        if (callCount === 2) return mockImageMiddle; // Second call for backgroundLayerMiddle
        if (callCount === 3) return mockImageNear; // Third call for backgroundLayerNear
        // For other images like playerShip, enemyShip icons, target etc.
        return { setOrigin: jest.fn().mockReturnThis(), setScale: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), angle: 0, tint: 0, setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis(), displayWidth: 100, displayHeight: 100 };
      }),
      sprite: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        body: { collideWorldBounds: true, setImmovable: jest.fn(), setVelocity: jest.fn() },
        play: jest.fn(),
        destroy: jest.fn()
      }),
      text: jest.fn().mockReturnValue({ setOrigin: jest.fn().mockReturnThis(), setText: jest.fn(), setScrollFactor: jest.fn() }),
    };

    sceneMain.physics = {
      add: {
        sprite: jest.fn().mockReturnValue({
          setOrigin: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis(),
          setInteractive: jest.fn().mockReturnThis(),
          on: jest.fn().mockReturnThis(),
          body: { collideWorldBounds: true, setImmovable: jest.fn(), setVelocity: jest.fn() },
          play: jest.fn(),
          destroy: jest.fn()
        }),
        group: jest.fn().mockReturnValue({ add: jest.fn(), getChildren: jest.fn().mockReturnValue([]) }),
        collider: jest.fn(),
      },
      world: { setBounds: jest.fn() },
      moveTo: jest.fn(),
    };
    sceneMain.anims = { generateFrameNumbers: jest.fn().mockReturnValue([]), create: jest.fn() };
    sceneMain.input = { keyboard: { addKey: jest.fn().mockReturnValue({ isDown: false }) } };

    // Mock methods that might be called within create
    sceneMain.updateFrameNamesForExplosion = jest.fn();
    sceneMain.addRocks = jest.fn();
    sceneMain.addSpaceMines = jest.fn();
    sceneMain.showInfo = jest.fn(); // This internally calls add.text, add.image
    sceneMain.setColliders = jest.fn();


    Align.scaleToGameW.mockClear();
  });

  test('Background layers are created with correct scroll factors and depths', () => {
    sceneMain.create();

    // Check add.image was called for the background layers (at least 3 times)
    // The mock is set up to return specific mocks for the first 3 calls
    expect(sceneMain.add.image).toHaveBeenCalledWith(0, 0, 'background'); // Common call for all
    expect(sceneMain.backgroundLayerFar).toBe(mockImageFar);
    expect(sceneMain.backgroundLayerMiddle).toBe(mockImageMiddle);
    expect(sceneMain.backgroundLayerNear).toBe(mockImageNear);

    // Verify properties for backgroundLayerFar
    expect(mockImageFar.setScrollFactor).toHaveBeenCalledWith(0.25);
    expect(mockImageFar.setDepth).toHaveBeenCalledWith(-2);
    expect(mockImageFar.tint).toBe(0x555555);
    expect(Align.scaleToGameW).toHaveBeenCalledWith(mockImageFar, 1, sceneMain.game);

    // Verify properties for backgroundLayerMiddle
    expect(mockImageMiddle.setScrollFactor).toHaveBeenCalledWith(0.5);
    expect(mockImageMiddle.setDepth).toHaveBeenCalledWith(-1);
    expect(mockImageMiddle.tint).toBe(0xaaaaaa);
    expect(Align.scaleToGameW).toHaveBeenCalledWith(mockImageMiddle, 1, sceneMain.game);

    // Verify properties for backgroundLayerNear
    expect(mockImageNear.setScrollFactor).toHaveBeenCalledWith(0.75);
    expect(mockImageNear.setDepth).toHaveBeenCalledWith(0);
    // expect(mockImageNear.tint).toBe(0xffffff); // Or check it's not set if that's the case
    // Note: Align.scaleToGameW for backgroundLayerNear is not explicitly in the provided code,
    // it's assumed to be scaled by the original setup. If it was added:
    // expect(Align.scaleToGameW).toHaveBeenCalledWith(mockImageNear, 1, sceneMain.game);

    // Check world and camera bounds are set with near layer's dimensions
    expect(sceneMain.physics.world.setBounds).toHaveBeenCalledWith(0, 0, mockImageNear.displayWidth, mockImageNear.displayHeight);
    expect(sceneMain.cameras.main.setBounds).toHaveBeenCalledWith(0, 0, mockImageNear.displayWidth, mockImageNear.displayHeight);
    expect(mockImageNear.setInteractive).toHaveBeenCalled();
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
      Between: jest.fn((min, max) => (min + max) / 2),
    },
  };
}
