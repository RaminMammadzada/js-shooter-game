/* eslint-disable no-undef */
import SceneTitle from '../src/js/scenes/sceneBoot';

test('SceneTitle is a subclass of Phaser.Scene', () => {
  expect(SceneTitle).toBeSubclassOf(Phaser.Scene);
});