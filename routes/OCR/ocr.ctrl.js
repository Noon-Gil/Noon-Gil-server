const axios = require('axios');
require('dotenv').config();
const { promisify } = require('util');
const fs = require('fs');
const FormData = require('form-data');

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

      console.log("RESPONSE: ", response);

      if (response.status === 200) {
        console.log('requestWithBase64 response:', response.data);
        const textResult = response.data.images[0].fields.map((field) => field.inferText).join(' ');
        res.json({ text: textResult });
        console.log(textResult);
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
