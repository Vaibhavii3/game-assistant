const axios = require('axios');

exports.callGemini = async (promptText) => {
    const apiUrl = process.env.URL;
    const apiKey = process.env.API_KEY;

    const url = `${apiUrl}?key=${apiKey}`;

  const res = await axios.post(url, {
    contents: [{ parts: [{ text: promptText }] }],
  });

  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};
