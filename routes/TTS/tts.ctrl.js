const axios = require("axios");
require("dotenv").config();

const client_id = process.env.X_NCP_APIGW_API_KEY_ID;
const client_secret = process.env.X_NCP_APIGW_API_KEY;

exports.ttsConversion = async (req, res) => {
  const { text } = req.body;
  console.log('text', text);
  try {
    // TTS API 호출
    const apiUrl = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-NCP-APIGW-API-KEY-ID": client_id,
      "X-NCP-APIGW-API-KEY": client_secret,
    };
    const data = `speaker=nara&volume=0&speed=0&pitch=0&text=${encodeURIComponent(text)}&format=mp3`;
    const response = await axios.post(apiUrl, data, { headers, responseType: 'arraybuffer' });

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": response.headers["content-length"],
      "Cache-Control": "public, max-age=31557600",
    });

    res.send(response.data);
  } catch (error) {
    console.error("Error while calling TTS API:", error);
    res.status(500).json({ error: "TTS API call failed" });
  }
};