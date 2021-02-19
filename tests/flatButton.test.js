/* eslint-disable no-undef */
import FlatButton from '../src/js/classes/ui/flatButton';

test('FlatButton is defined when it is initiated', () => {
  expect(FlatButton).toBeDefined();
});

test('FlatButton is subclass of Phaser.GameObjects.Container', () => {
  expect(FlatButton).toBeSubclassOf(Phaser.GameObjects.Container);
});
