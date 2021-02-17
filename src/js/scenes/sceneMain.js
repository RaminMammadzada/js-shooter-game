import Phaser from 'phaser';
import EventEmitter from '../classes/util/eventEmitter';
import MediaManager from '../classes/util/mediaManager';
import SoundButtons from '../classes/ui/soundButtons';
import Controller from '../classes/modelAndController/controller';
import Align from '../classes/util/align';
import AlignGrid from '../classes/util/alignGrid';
import Constants from '../constants';
import Model from '../classes/modelAndController/model';

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

    this.playerPower = 30;
    this.enemyPower = 30;
    Model.playerWon = true;

    this.centerX = this.game.config.width / 2;
    this.center = this.game.config.height / 2;

    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    this.playerShip = this.physics.add.sprite(this.centerX, this.centerY, 'playerShip');
    this.playerShip.setOrigin(0.5, 0.5);
    Align.scaleToGameW(this.playerShip, 0.125, this.game);
    this.playerShip.body.collideWorldBounds = true;
    this.playerShip.setInteractive();
    this.playerShip.on('pointerdown', this.fireBulletForPlayerShip, this);

    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // this.background.scaleX = this.playerShip.scaleX;
    // this.background.scaleY = this.playerShip.scaleY;
    this.background.setInteractive();
    this.background.on('pointerup', this.backgroundClicked, this);
    // this.background.on('pointerdown', this.onDown, this);
    this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

    this.cameras.main.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);
    this.cameras.main.startFollow(this.playerShip, true);

    this.playerBulletGroup = this.physics.add.group();
    this.enemyBulletGroup = this.physics.add.group();

    const frameNames = this.anims.generateFrameNumbers('exp');

    this.anims.create({
      key: 'boom',
      frames: this.updateFrameNames(frameNames),
      frameRate: 40,
      repeat: false,
    });

    this.enemyShip = this.physics.add.sprite(this.centerX, 0, 'enemyShip');
    Align.scaleToGameW(this.enemyShip, 0.25, this.game);
    this.enemyShip.body.collideWorldBounds = true;

    this.rockGroup = this.physics.add.group();
    this.addRocks();

    this.showInfo();
    this.setColliders();

    const soundButtons = new SoundButtons({ scene: this });
    // soundButtons.depth = 1;

    if (!Model.isMobile) {
      this.target = this.add.image(0, 0, 'target');
      Align.scaleToGameW(this.target, 0.08, this.game);
    }
  }

  setColliders() {
    this.physics.add.collider(this.playerBulletGroup, this.enemyShip, this.damageEnemyShip, null, this);
    this.physics.add.collider(this.enemyBulletGroup, this.playerShip, this.damagePlayerShip, null, this);
    this.physics.add.collider(this.enemyBulletGroup, this.playerBulletGroup, this.destroyBullets, null, this);
  }

  setRockColliders() {
    this.physics.add.collider(this.rockGroup);
    this.physics.add.collider(this.rockGroup, this.playerShip, this.rockHitPlayerShip, null, this);
    this.physics.add.collider(this.rockGroup, this.enemyShip, this.rockHitEnemyShip, null, this);
    this.physics.add.collider(this.playerBulletGroup, this.rockGroup, this.destroyRock, null, this);
    this.physics.add.collider(this.enemyBulletGroup, this.rockGroup, this.destroyRock, null, this);
  }

  updateFrameNames(frameNames) {
    const frameNamesSliced = frameNames.slice();
    frameNamesSliced.reverse();
    return frameNamesSliced.concat(frameNames);
  }

  destroyBullets(playerBullet, enemyBullet) {
    const explosion = this.add.sprite(playerBullet.x, playerBullet.y, 'exp');
    explosion.play('boom');
    EventEmitter.emit(Constants.PLAY_SOUND, 'explode');
    console.log('player and enemy bullets collided');
    playerBullet.destroy();
    enemyBullet.destroy();
  }

  decreasePlayerPower() {
    this.playerPower -= 1;
    this.playerPowerText.setText(`Player Power\n ${this.playerPower}`);
    if (this.playerPower === 0) {
      Model.playerWon = false;
      this.scene.start('SceneOver');
    }
  }

  decreaseEnemyPower() {
    this.enemyPower -= 1;
    this.enemyPowerText.setText(`Enemy Power\n ${this.enemyPower}`);
    if (this.enemyPower === 0) {
      Model.playerWon = true;
      this.scene.start('SceneOver');
    }
  }

  rockHitPlayerShip(playerShip, rock) {
    this.destroyRock(null, rock);
    this.decreasePlayerPower();
    EventEmitter.emit(Constants.PLAY_SOUND, 'explode');
  }

  rockHitEnemyShip(enemyShip, rock) {
    this.destroyRock(null, rock);
    this.decreaseEnemyPower();
  }

  destroyRock(bullet, rock) {
    const explosion = this.add.sprite(rock.x, rock.y, 'exp');
    explosion.play('boom');
    rock.destroy();
    if (bullet !== null) {
      bullet.destroy();
    }
    this.addRocks();
  }

  damageEnemyShip(enemyShip, playerBullet) {
    const explosion = this.add.sprite(playerBullet.x, playerBullet.y, 'exp');
    explosion.play('boom');
    EventEmitter.emit(Constants.PLAY_SOUND, 'explode');
    console.log('player gives damage to enemy ship');
    playerBullet.destroy();

    let angleForEnemyShip = this.physics.moveTo(this.enemyShip, this.playerShip.x, this.playerShip.y, 120);
    angleForEnemyShip = this.toDegrees(angleForEnemyShip);
    this.enemyShip.angle = angleForEnemyShip;

    this.decreaseEnemyPower();
  }

  damagePlayerShip(playerShip, enemyBullet) {
    const explosion = this.add.sprite(playerShip.x, playerShip.y, 'exp');
    explosion.play('boom');
    EventEmitter.emit(Constants.PLAY_SOUND, 'explode');
    console.log('enemy gives damage to player ship');
    enemyBullet.destroy();
    this.decreasePlayerPower();
  }

  getTimer() {
    const date = new Date();
    return date.getTime();
  }

  onDown() {
    this.downTime = this.getTimer();
  }

  backgroundClicked() {
    // const elapsed = Math.abs(this.downTime - this.getTimer());
    // console.log(elapsed);
    // if (true) {
    const tx = this.background.input.localX;
    const ty = this.background.input.localY;
    this.tx = tx;
    this.ty = ty;
    let angle = this.physics.moveTo(this.playerShip, tx, ty, 150);

    if (Model.isMobile) {
      angle = this.toDegrees(angle);
      this.playerShip.angle = angle + 90;
    }
    console.log(this.playerShip.angle);

    const distanceX2 = Math.abs(this.playerShip.x - this.tx);
    const distanceY2 = Math.abs(this.playerShip.y - this.tx);
    if (distanceX2 < this.game.config.width / 3 && distanceY2 < this.game.config.height / 3) {
      let angleForEnemyShip = this.physics.moveTo(this.enemyShip, this.playerShip.x, this.playerShip.y, 60);
      angleForEnemyShip = this.toDegrees(angleForEnemyShip);
      this.enemyShip.angle = angleForEnemyShip;
    }
    //   } else {
    //   this.fireBulletForPlayerShip();
    // }

  }

  setTargetIconLocation() {
    if (this.target) {
      this.target.setPosition(this.game.input.mousePointer.worldX, this.game.input.mousePointer.worldY);
    }
  }

  rotatePlayer() {
    const rotate = Phaser.Math.Angle.Between(this.playerShip.body.x, this.playerShip.body.y, this.game.input.mousePointer.worldX, this.game.input.mousePointer.worldY);
    const angle = rotate + Math.PI / 2;
    this.playerShip.rotation = angle;
  }

  fireBulletForPlayerShip() {
    const elapsed = Math.abs(this.lastTimePlayerBulletFired - this.getTimer());
    if (elapsed < 300) {
      return;
    }
    this.lastTimePlayerBulletFired = this.getTimer();
    const directionObj = this.getDirectionFromAngle(this.playerShip.angle - 90);
    console.log("Player ship angle: ", this.playerShip.angle);
    const bullet = this.physics.add.sprite(this.playerShip.x + directionObj.tx, this.playerShip.y + directionObj.ty, 'bullet');
    bullet.setOrigin(0.5, 0.5);
    this.playerBulletGroup.add(bullet);
    bullet.angle = this.playerShip.angle - 90;
    bullet.body.setVelocity(directionObj.tx * 200, directionObj.ty * 200);
    EventEmitter.emit(Constants.PLAY_SOUND, 'playerShoot');
  }

  fireBulletForEnemyShip() {
    const elapsed = Math.abs(this.lastTimeEnemyBulletFired - this.getTimer());
    if (elapsed < 3000) {
      return;
    }
    this.lastTimeEnemyBulletFired = this.getTimer();
    const enemyBullet = this.physics.add.sprite(this.enemyShip.x, this.enemyShip.y, 'enemyBullet');
    this.enemyBulletGroup.add(enemyBullet);
    enemyBullet.body.angularVelocity = 10;
    this.physics.moveTo(enemyBullet, this.playerShip.x, this.playerShip.y, 100);
    EventEmitter.emit(Constants.PLAY_SOUND, 'playerShoot');
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

  showInfo() {
    this.playerPowerText = this.add.text(0, 0, 'Player power\n100', { fontSize: this.game.config.width / 40, align: 'center', backgroundColor: '#210EC9' });
    this.enemyPowerText = this.add.text(0, 0, 'Enemy power\n100', { fontSize: this.game.config.width / 40, align: 'center', backgroundColor: '#210EC9' });

    this.playerPowerText.setOrigin(0.5, 0.5);
    this.enemyPowerText.setOrigin(0.5, 0.5);
    this.uiGrid = new AlignGrid({ scene: this, rows: 11, cols: 11 });
    // this.uiGrid.showNumbers();

    this.uiGrid.placeAtIndex(3, this.playerPowerText);
    this.uiGrid.placeAtIndex(9, this.enemyPowerText);

    this.icon1 = this.add.image(0, 0, 'playerShip');
    this.icon2 = this.add.image(0, 0, 'enemyShip');
    Align.scaleToGameW(this.icon1, 0.05, this.game);
    Align.scaleToGameW(this.icon2, 0.05, this.game);
    this.uiGrid.placeAtIndex(1, this.icon1);
    this.uiGrid.placeAtIndex(7, this.icon2);
    this.icon1.angle = 0;
    this.icon2.angle = 270;

    this.playerPowerText.setScrollFactor(0);
    this.enemyPowerText.setScrollFactor(0);
    this.icon1.setScrollFactor(0);
    this.icon2.setScrollFactor(0);
  }

  addRocks() {
    if (this.rockGroup.getChildren().length === 0) {
      this.rockGroup = this.physics.add.group({
        key: 'rocks',
        frame: [0, 1, 2],
        frameQuantity: 7,
        bounceX: 1,
        bounceY: 1,
        angularVelocity: 1,
        collideWorldBounds: true,
      });

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
      this.setRockColliders();
    }
  }

  update() {
    // constant running loop

    if (this.playerShip && this.enemyShip) {
      const distanceX = Math.abs(this.playerShip.x - this.tx);
      const distanceY = Math.abs(this.playerShip.y - this.ty);
      if (distanceX < 10 && distanceY < 10) {
        if (this.playerShip.body) {
          this.playerShip.body.setVelocity(0, 0);
        }
      }

      const distanceX2 = Math.abs(this.playerShip.x - this.enemyShip.x);
      const distanceY2 = Math.abs(this.playerShip.y - this.enemyShip.y);
      if (distanceX2 < this.game.config.width / 3 && distanceY2 < this.game.config.height / 3) {
        this.fireBulletForEnemyShip();
      }

      if (this.keySpace.isDown) {
        this.fireBulletForPlayerShip();
      }
    }

    if (!Model.isMobile) {
      this.rotatePlayer();
      this.setTargetIconLocation();
    }
  }
}

export default SceneMain;