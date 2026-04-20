import Phaser from 'phaser';
import EventEmitter from '../util/eventEmitter';
import Model from '../modelAndController/model';

class FlatButton extends Phaser.GameObjects.Container {
  constructor(config) {
    super(config.scene);
    if (!config.scene) {
      return;
    }
    if (!config.key) {
      return;
    }

    this.config = config;
    this.scene = config.scene;
    this.back = this.scene.add.image(0, 0, config.key);

    this.add(this.back);
    if (config.text) {
      if (config.textConfig) {
        this.text1 = this.scene.add.text(0, 0, config.text, config.textConfig);
      } else {
        this.text1 = this.scene.add.text(0, 0, config.text);
      }
      this.text1.setOrigin(0.5, 0.5);
      this.add(this.text1);
    }
    if (config.x) {
      this.x = config.x;
    }
    if (config.y) {
      this.y = config.y;
    }

    this.scene.add.existing(this);
    if (config.event) {
      this.back.setInteractive({ useHandCursor: true });
      this.back.on('pointerdown', this.pressed, this);
    }

    if (Model.isMobile === -1) {
      this.back.on('pointerover', this.over, this);
      this.back.on('pointerout', this.out, this);
    }
  }

  over() {
    if (this.hoverTween) this.hoverTween.stop();
    this.hoverTween = this.scene.tweens.add({
      targets: this,
      scale: 1.08,
      duration: 140,
      ease: 'Sine.easeOut',
    });
    if (this.back && this.back.setTint) {
      this.back.setTint(0xbfefff);
    }
  }

  out() {
    if (this.hoverTween) this.hoverTween.stop();
    this.hoverTween = this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 140,
      ease: 'Sine.easeOut',
    });
    if (this.back && this.back.clearTint) {
      this.back.clearTint();
    }
  }

  pressed() {
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this,
        scale: 0.94,
        yoyo: true,
        duration: 90,
        ease: 'Quad.easeOut',
      });
    }
    if (this.config.params) {
      EventEmitter.emit(this.config.event, this.config.params);
    } else {
      EventEmitter.emit(this.config.event);
    }
  }
}

export default FlatButton;