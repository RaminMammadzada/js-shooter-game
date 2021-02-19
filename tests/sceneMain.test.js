/* eslint-disable no-undef */
import SceneMain from '../src/js/scenes/sceneBoot';

test('SceneMain is a subclass of Phaser.Scene', () => {
  expect(SceneMain).toBeSubclassOf(Phaser.Scene);
});