import Phaser from 'phaser';
import EventEmitter from '../classes/util/eventEmitter';
import MediaManager from '../classes/util/mediaManager';
import SoundButtons from '../classes/ui/soundButtons';
import Controller from '../classes/mc/controller';
import Align from '../classes/util/align';
import Constants from '../constants';

class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }
  preload() {
    // load our images and sounds
  }

  create() {
    // define our object
    // define our object

    Controller.setEmitters();
    // console.log(this);
    const mediaManager = new MediaManager({ scene: this });

    mediaManager.setBackgroundMusic('backgroundMusic');

    const sb = new SoundButtons({ scene: this });
    sb.depth = 1;

    this.centerX = this.game.config.width / 2;
    this.center = this.game.config.height / 2;

    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    this.ship = this.physics.add.sprite(this.centerX, this.centerY, 'ship');
    Align.scaleToGameW(this.ship, 0.125, this.game);

    // this.background.scaleX = this.ship.scaleX;
    // this.background.scaleY = this.ship.scaleY;
    this.background.setInteractive();
    this.background.on('pointerup', this.backgroundClicked, this);
    this.background.on('pointerdown', this.onDown, this);
    this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

    this.cameras.main.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);
    this.cameras.main.startFollow(this.ship, true);
    this.rockGroup = this.physics.add.group({
      key: 'rocks',
      frame: [0, 1, 2],
      frameQuantity: 4,
      bounceX: 1,
      bounceY: 1,
      angularVelocity: 1,
      collideWorldBounds: true,
    });
    this.bulletGroup = this.physics.add.group();
    this.rockGroup.children.iterate((child) => {
      const xx = Math.floor(Math.random() * this.background.displayWidth);
      const yy = Math.floor(Math.random() * this.background.displayHeight);

      child.x = xx;
      child.y = yy;

      Align.scaleToGameW(child, 0.1, this.game);

      let vx = Math.floor(Math.random() * 2 - 1);
      let vy = Math.floor(Math.random() * 2 - 1);

      if (vx === 0 * vy === 0) {
        vx = 1;
        vy = 1;
      }

      const speed = Math.floor(Math.random() * 200) + 10;
      child.body.setVelocity(vx * speed, vy * speed);
    });

    this.physics.add.collider(this.rockGroup);
    this.physics.add.collider(this.bulletGroup, this.rockGroup, this.destroyRock, null, this);

    const frameNames = this.anims.generateFrameNumbers('exp');

    this.anims.create({
      key: 'boom',
      frames: this.updateFrameNames(frameNames),
      frameRate: 40,
      repeat: false,
    });

    this.enemyShip = this.physics.add.sprite(this.centerX, 0, 'enemyShip');
    Align.scaleToGameW(this.enemyShip, 0.25, this.game);

  }

  updateFrameNames(frameNames) {
    const frameNamesSliced = frameNames.slice();
    frameNamesSliced.reverse();
    return frameNamesSliced.concat(frameNames);
  }

  destroyRock(bullet, rock) {
    const explosion = this.add.sprite(rock.x, rock.y, 'exp');
    explosion.play('boom');
    bullet.destroy();
    rock.destroy();
  }

  getTimer() {
    const date = new Date();
    return date.getTime();
  }

  onDown() {
    this.downTime = this.getTimer();
  }

  backgroundClicked() {
    const elapsed = Math.abs(this.downTime - this.getTimer());
    console.log(elapsed);
    if (elapsed < 300) {
      const tx = this.background.input.localX;
      const ty = this.background.input.localY;
      this.tx = tx;
      this.ty = ty;
      let angle = this.physics.moveTo(this.ship, tx, ty, 250);
      angle = this.toDegrees(angle);
      this.ship.angle = angle;
      console.log(this.ship.angle);
    } else {
      this.createBullet();
    }

    let angleForEnemyShip = this.physics.moveTo(this.enemyShip, this.ship.x, this.ship.y, 60);
    angleForEnemyShip = this.toDegrees(angleForEnemyShip);
    this.enemyShip.angle = angleForEnemyShip;

  }

  createBullet() {
    const directionObj = this.getDirectionFromAngle(this.ship.angle);
    const bullet = this.physics.add.sprite(this.ship.x + directionObj.tx * 30, this.ship.y + directionObj.ty + 30, 'bullet');
    this.bulletGroup.add(bullet);
    bullet.angle = this.ship.angle;
    bullet.body.setVelocity(directionObj.tx * 100, directionObj.ty * 100);
  }

  toDegrees(angle) {
    return angle * (180 / Math.PI);
  }

  getDirectionFromAngle(angle) {
    const rads = angle * Math.PI / 180;
    const tx = Math.cos(rads);
    const ty = Math.sin(rads);
    return { tx, ty };
  }

  update() {
    // constant running loop
    const distanceX = Math.abs(this.ship.x - this.tx);
    const distanceY = Math.abs(this.ship.y - this.ty);
    if (distanceX < 10 && distanceY < 10) {
      this.ship.body.setVelocity(0, 0);
    }

    const distanceX2 = Math.abs(this.ship.x - this.enemyShip.x);
    const distanceY2 = Math.abs(this.ship.y - this.enemyShip.y);
    if (distanceX2 < this.game.config.width / 3 && distanceY2 < this.game.config.height / 3) {
      this.enemyShip.alpha = 0.5;
    } else {
      this.enemyShip.alpha = 1;
    }
  }
}

export default SceneMain;