/* eslint-disable no-undef */
import ScenePreloader from '../src/js/scenes/sceneBoot';

test('ScenePreloader is a subclass of Phaser.Scene', () => {
  expect(ScenePreloader).toBeSubclassOf(Phaser.Scene);
});