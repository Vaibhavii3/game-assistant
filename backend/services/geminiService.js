const axios = require('axios');
const Replicate = require('replicate');

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

    if (type === 'dialogue') {
    fullPrompt += `

      Respond in JSON format with:
      - npcName
      - questTitle
      - location
      - reward
      - dialogue: an array of objects with "line" (the spoken dialogue) and "emotion" (tone or feeling)
      `;
    }

    const res = await axios.post(url, {
      contents: [{ parts: [{ text: fullPrompt }] }],
    });

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (type === 'character' || type === 'dialogue') {

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

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

exports.generateImage = async (prompt) => {
  const output = await replicate.run(
    "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
    {
      input: {
        prompt,
        width: 1024,
        height: 1024,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }
  );

  return output[0];
}