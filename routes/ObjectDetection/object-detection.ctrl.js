const axios = require("axios");
const { Configuration, OpenAIApi} = require("openai");
var fs = require('fs');
require("dotenv").config();

const client_id = process.env.X_NCP_APIGW_API_KEY_ID;
const client_secret = process.env.X_NCP_APIGW_API_KEY;

exports.objectDetection = async (req, res) => {
  // 이미지 분석 API 엔드포인트 URL
  const apiUrl = `https://${process.env.AZURE_ENDPOINT}/computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=caption&language=en`;
  // 이미지 데이터 읽기
  const imageData = fs.readFileSync(req.file.path);

  console.log("try to call api");
  // API 호출
  const response = await axios.post(apiUrl, imageData, {
    headers: {
      'Content-Type': 'application/octet-stream', // Content-Type 설정
      'Ocp-Apim-Subscription-Key': process.env.AZURE_API_KEY, // Vision 리소스의 구독 키로 대체해주세요
    },
  });
  console.log(response.data.captionResult.text);

  try {
    var api_url_translation = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation';
    var translationRes = await axios.post(api_url_translation, {
      source: 'en',
      target: 'ko',
      text: response.data.captionResult.text,
    }, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.X_NCP_APIGW_API_KEY_ID_TRANSLATION,
        'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY_TRANSLATION,
      },
    });
    console.log(JSON.stringify(translationRes.data.message.result.translatedText));

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "한글로 이미지 캡션을 받아서 \"요\" 자로 끝나는 한 문장의 한글 대화체(존댓말)로 다시 말해주는 번역기"},
        {role: "user", content: "컴퓨터와 칠판이 있는 방"},
        {role: "assistant", content: "컴퓨터와 칠판이 있는 방이 보여요"},
        {role: "user", content: "안경을 쓴 여자"},
        {role: "assistant", content: "안경을 쓴 여성분이 보여요"},
        {role: "user", content: `${translationRes.data.message.result.translatedText}`}],
    });
    console.log(chatCompletion.data.choices[0].message);

    res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
    return res.end(JSON.stringify(chatCompletion.data.choices[0].message));
  } catch (error) {
    res.status(error.response.status).end();
    console.log('error = ' + error.response.status);
  }
}
