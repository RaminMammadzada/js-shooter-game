class SceneLoad extends Phaser.Scene {
  constructor() {
    super("SceneLoad")
  }

  preload() {

  }

  create() {
    this.scene.start("SceneTitle")
  }
}