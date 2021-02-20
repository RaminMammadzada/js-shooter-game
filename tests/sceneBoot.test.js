/* eslint-disable no-undef */
import SceneBoot from '../src/js/scenes/sceneBoot';

test('SceneBoot is a subclass of Phaser.Scene', () => {
  expect(SceneBoot).toBeSubclassOf(Phaser.Scene);
});