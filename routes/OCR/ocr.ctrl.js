const axios = require('axios');
require('dotenv').config();
const { promisify } = require('util');
const fs = require('fs');
const FormData = require('form-data');
const { Configuration, OpenAIApi} = require("openai");

const ocr_secret = process.env.X_OCR_SECRET;

exports.ocrConversion = async (req, res) => {
  try {
    const readFileAsync = promisify(fs.readFile);

    const imageBuffer = await readFileAsync(req.file.path);

    if(!imageBuffer) {
      return res.status(400).json({ error: 'Image buffer not found in the request' });
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': ocr_secret,
      },
    };

    // Update the API endpoint URL for the OCR service
    const apiUrl = process.env.INVOKE_URL; // Replace with the correct APIGW Invoke URL
    console.log(apiUrl);

    // Method to perform OCR using base64 image data
    const requestWithBase64 = async (base64ImageString) => {
      const response = await axios.post(
        apiUrl,
        {
          images: [
            {
              format: 'jpg', // Replace with the correct file format
              name: 'image.jpg', // Replace with the image name
              data: base64ImageString.split(',')[1], // Extract the base64 data (remove data:image/<format>;base64,)
            },
          ],
          requestId: 'unique_string', // Replace with a unique request ID for each call
          timestamp: Date.now(),
          version: 'V2',
        },
        config
      );

      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
    
      const openai = new OpenAIApi(configuration);
       
      if (response.status === 200) {
        console.log('requestWithBase64 response:', response.data);
        const textResult = response.data.images[0].fields.map((field) => field.inferText).join(' ');
        // res.json({ text: textResult });
        console.log(textResult);

        const chatCompletion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: 0,
            messages: [
                { role: "system", content: "인식한 텍스트가 어떤 내용인지 아주 간단한 설명과 함께 대화체로 읽어주는 시각장애인을 위한 도구" },
                { role: "user", content: "주민등록증"},
                { role: "assistant", content: "주민등록증이라고 적혀있네요."},
                { role: "user", content: "CROWN WHITE 화이트하임"},
                { role: "assistant", content: "과자가 있어요. CROWN WHITE 화이트하임이라고 적혀있네요."},
                { role: "user", content: textResult}
            ]
        });
        res.json({ text: chatCompletion.data.choices[0].message.content})
        console.log(chatCompletion.data.choices[0].message.content);
      }
    };

    // Convert the buffer image data to base64
    const base64ImageString = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    // Call the function for OCR using base64 image data
    await requestWithBase64(base64ImageString);

    // Delete the temporary file after processing
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OCR failed' });
  }
};
