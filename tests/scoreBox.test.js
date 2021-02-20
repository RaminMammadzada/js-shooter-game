/* eslint-disable no-undef */

import ScoreBox from '../src/js/classes/comps/scoreBox';

test('ScoreBox is a subclass of Phaser.GameObjects.Container', () => {
  expect(ScoreBox).toBeSubclassOf(Phaser.GameObjects.Container);
});
