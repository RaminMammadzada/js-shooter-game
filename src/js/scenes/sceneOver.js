class SceneOver extends Phaser.Scene {
  constructor() {
    super('SceneOver');
  }
  preload() {

  }
  startGame() {
    this.scene.start('SceneMain');
  }
  update() { }
}