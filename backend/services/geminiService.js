const axios = require("axios");

exports.callGemini = async (promptText) => {
  const API_KEY = process.env.API_KEY;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    API_KEY;

  const response = await axios.post(url, {
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ]
  });

  return response.data.candidates[0].content.parts[0].text;
};
