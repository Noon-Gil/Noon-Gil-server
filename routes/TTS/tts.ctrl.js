const axios = require("axios");
require("dotenv").config();

const client_id = process.env.X_NCP_APIGW_API_KEY_ID;
const client_secret = process.env.X_NCP_APIGW_API_KEY;

exports.ttsConversion = async (req, res) => {
  try {
    const naverTTSEndpoint = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    const { text } = req.body;

    console.log('Input Text:', text); // Log the input text

    const response = await axios.post(
      naverTTSEndpoint,
      {
        speaker: 'nara',
        volume: '5',
        speed: '0',
        pitch: '0',
        text,
        format: 'mp3'
      },
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": client_id,
          "X-NCP-APIGW-API-KEY": client_secret,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        responseType: "arraybuffer",
      }
    );

    // Log the response data
    console.log('RESPONSE:', response.data);

    // If the response data contains error information, log it
    if (response.status === 500 && response.data instanceof Buffer) {
      const errorMessage = response.data.toString('utf8');
      console.log('TTS API Error:', errorMessage);
    }
    
    // Set the appropriate headers for the audio response
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (error) {
    console.error("Error while calling TTS API:", error);
    res.status(500).json({ error: "TTS API call failed" });
  }
};
