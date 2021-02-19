/* eslint-disable no-undef */

import Model from '../src/js/classes/modelAndController/model';

test('Sound will be true as a default given in Model', () => {
  expect(Model.soundOn).toEqual(true);
});

test('Music will be true as a default given in Model', () => {
  expect(Model.musicOn).toBeTruthy();
});

test('After setting musicOn to false with setter, it can be taken by getter in Model', () => {
  Model.musicOn = false;
  expect(Model.musicOn).toBeFalsy();
});

test('After setting score with setter in Model function, the score will be gettable by getter', () => {
  Model.score = 77;
  expect(Model.score).toEqual(77);
});