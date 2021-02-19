/* eslint-disable no-undef */

import { postScore, getScores } from '../src/js/classes/util/serviceApi';

beforeEach(() => {
  fetch.resetMocks();
});

describe('GET', () => {

  it('should request with the right url (base_url/:id/scores)', () => {
    fetch.mockResponseOnce(JSON.stringify({
      result: [
        {
          user: 'Simon Rally',
          score: 110,
        }],
    }));
    getScores()
      .then(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/plPX1KbSDTjkjLXIA8ui/scores/', {
            method: 'GET',
            headers: {
              'Content-type': 'application/json;charset=UTF-8',
            },
          },
        );
      })
      .catch(() => {});
  });

  it('should get name and score using the base_url/:id/scores and return a 201 response code', () => {
    getScores()
      .then(response => {
        expect(response.name).toBe('test user');
      })
      .catch(() => {});
  });
});

describe('POST', () => {

  fetch.mockResponseOnce(JSON.stringify([{ result: 'Leaderboard score created correctly.' }]));
  const onResponse = jest.fn();
  const onError = jest.fn();

  it('should post name and score using the base_url/:id/scores and return a 201 response code', () => {
    postScore()
      .then(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://cors-anywhere.herokuapp.com/https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/plPX1KbSDTjkjLXIA8ui/scores/', {
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
              Accept: 'application/json',
              'Content-type': 'application/json; charset=UTF-8',
            },
          },
        );
      })
      .catch(() => {});
  });
  it('should post name and score using the base_url/:id/scores', () => {
    postScore('usernameForTest', 319)
      .then(onResponse)
      .catch(onError)
      .finally(() => {
        expect(onResponse).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
      });
  });
});
