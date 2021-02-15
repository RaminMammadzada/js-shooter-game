class SceneTitle extends Phaser.Scene {
  constructor() {
    super('SceneTitle');
  }
  preload() {

  }
  create() {

  }
  startGame() {
    this.scene.start('SceneMain');
  }
  update() { }
}