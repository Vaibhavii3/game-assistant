const axios = require('axios');

exports.callGemini = async (promptText, type = 'text') => {
    const apiUrl = process.env.URL;
    const apiKey = process.env.API_KEY;

    const url = `${apiUrl}?key=${apiKey}`;

    let fullPrompt = promptText;
    if (type === 'character') {
      fullPrompt += `
      
      Respond in JSON format with the following fields:
      - name
      - abilities (array)
      - weakness (array)
      - appearance
      - backstory
      `;
    }

    const res = await axios.post(url, {
      contents: [{ parts: [{ text: fullPrompt }] }],
    });

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (type === 'character') {

      try {
        const clean = raw.trim().replace(/^```json\s*|\s*```$/g, '');
        return JSON.parse(clean);
      } catch (e) {
        console.warn('Parsing failed, returning raw text.');
        return { raw };
      }
    } else {
      return { raw: raw.trim() };
    }
};
