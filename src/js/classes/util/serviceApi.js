const baseUrl = () => {
  return 'https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/';
};
const getUrl = () => {
  return `${baseUrl()}plPX1KbSDTjkjLXIA8ui/scores/`;
};

const postScore = async (name, score) => {
  const data = {
    user: name,
    score,
  };
  try {
    const response = await fetch(getUrl(), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    return console.log(response);
  } catch (error) {
    return console.log(error.message);
  }
};

const getScores = async () => {
  try {
    const response = await fetch(getUrl(), {
      method: 'GET',
      headers: { 'Content-type': 'application/json;charset=UTF-8' },
    });
    const filter = await response.json();
    return filter;
  } catch (error) {
    return console.log(error.message);
  }
};

export { postScore, getScores };