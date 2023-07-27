const axios = require("axios");
const { Configuration, OpenAIApi} = require("openai");
const ffmpeg = require("fluent-ffmpeg");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const clientId = process.env.X_NCP_APIGW_API_KEY_ID;
const clientSecret = process.env.X_NCP_APIGW_API_KEY;

exports.selection = async (req, res) => {
  // m4a 파일을 mp3 파일로 변환
  const inputFilePath = req.file.path;
  const outputFilePath = path.join(__dirname, "../../tmp/client-audios/") + "output" + '-' + Date.now();
  const targetFormat = "mp3";
  const outputPath = `${outputFilePath}.${targetFormat}`;
  ffmpeg(inputFilePath).toFormat(targetFormat).on('end', () => {
        console.log(`File converted to ${targetFormat}`);
      }).on('error', (err) => {
        console.error(`Error converting file to ${targetFormat}:`, err);
      }).save(outputPath).on("end", async () => {
        const url = `https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=Kor`;
        const headers = {
          'Content-Type': 'application/octet-stream',
          'X-NCP-APIGW-API-KEY-ID': clientId,
          'X-NCP-APIGW-API-KEY': clientSecret
        };
        
        const requestConfig = {
          method: 'POST',
          url: url,
          headers: headers,
          data: fs.readFileSync(outputPath)
        };
        
        await axios(requestConfig)
          .then(async (response) => {
            console.log(response.status);
            console.log(response.data);
            
            // chatGPT 활용하여 stt 의도 파악
            const configuration = new Configuration({
              apiKey: process.env.OPENAI_API_KEY,
            });
            const openai = new OpenAIApi(configuration);
            
            const chatCompletion = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [
                {role: "system", content: "너는 질문의 의도를 넷 중 하나로 분류하는 분류기야. USER는 보이는 장면을 궁금해하거나, 앞에 있는 사람이 어떤 사람을 닮았는지 궁금해하거나, 무엇이 적혀있는지 궁금해하고 있어. 장면을 궁금해할 경우 \"object-detection\", 앞 사람이 누구를 닮았는지 궁금해할 경우 \"face-recognition\" 글자를 궁금해할 경우 \"tts\", 그리고 상대의 기분,표정을 궁금해할 경우 \"emotion\" 이라고 넷 중 하나의 단어로만 답변해야해."},
                {role: "user", content: "뭐가 보여"},
                {role: "assistant", content: "object-detection"},
                {role: "user", content: "내 앞에 있는 사람은 누구를 닮았어?"},
                {role: "assistant", content: "face-recognition"},
                {role: "user", content: "뭐라고 써 있어?"},
                {role: "assistant", content: "tts"},
                {role: "user", content: "내 앞에 있는 사람은 기분이 어때보여?"},
                {role: "assistant", content: "emotion"},
                {role: "user", content: "내 앞에 있는 사람 표정이 어때?"},
                {role: "assistant", content: "emotion"},
                {role: "user", content: `${response.data.text}`}],
            });
            console.log(chatCompletion.data.choices[0].message);
        
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            return res.end(JSON.stringify(chatCompletion.data.choices[0].message));
          })
          .catch(error => {
            console.error(error);
          });
        
        return;
      });
}
