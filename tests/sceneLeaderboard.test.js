/* eslint-disable no-undef */
import SceneLeaderboard from '../src/js/scenes/sceneBoot';

test('SceneLeaderboard is a subclass of Phaser.Scene', () => {
  expect(SceneLeaderboard).toBeSubclassOf(Phaser.Scene);
});