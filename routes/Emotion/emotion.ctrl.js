const axios = require("axios");
var fs = require('fs');
const { Configuration, OpenAIApi} = require("openai");
const request = require('request');
const emotion = require(".");
require("dotenv").config();

const api_url = 'https://naveropenapi.apigw.ntruss.com/vision/v1/face'; // 유명인 인식
const client_id = process.env.X_NCP_APIGW_API_KEY_ID;
const client_secret = process.env.X_NCP_APIGW_API_KEY;

exports.emotion = (req, res) => {
    const file_path = req.file.path;
    
    var _formData = {
        image:'image',
        image: fs.createReadStream(file_path), // FILE 이름
    };
    
    var _req = request.post({url:api_url, formData:_formData,
        headers: {'X-NCP-APIGW-API-KEY-ID': client_id, 'X-NCP-APIGW-API-KEY': client_secret}})
        .on('response', function(response) {
            console.log(response.statusCode) // 200
            console.log(response.headers['content-type'])
            console.log(Object.keys(response));
            console.log(response.statusMessage);

            if(response.statusCode !== 200){
                return res.json({content: "얼굴 인식 중 에러가 발생했어요"});
            }

            // 데이터 수신 처리
            let responseData = '';

            response.on('data', function(chunk) {
                responseData += chunk;
            });

            response.on('end',  async function() {
                console.log('응답 본문:', responseData);
                const parsedData = JSON.parse(responseData);
               
                let result = "";
                if(parsedData.info.faceCount === 0){
                    result = "얼굴을 찾지 못했어요"
                } else {
                    const emotionValue = parsedData.faces[0].emotion.value;
                    console.log('Emotion Value:', emotionValue);
                    console.log(emotionValue);
                    result = `${emotionValue}`;
                }
                console.log("result: ", result);

                try {
                    var api_url_translation = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation';
                    var translationRes = await axios.post(api_url_translation, {
                      source: 'en',
                      target: 'ko',
                      text: result,
                    }, {
                      headers: {
                        'X-NCP-APIGW-API-KEY-ID': process.env.X_NCP_APIGW_API_KEY_ID_TRANSLATION,
                        'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY_TRANSLATION,
                      },
                    });
                    const translatedText = JSON.stringify(translationRes.data.message.result.translatedText);
                    console.log('번역', translatedText);
                    result = translatedText + '표정이에요';
                    const configuration = new Configuration({
                        apiKey: process.env.OPENAI_API_KEY,
                    });
                    const openai = new OpenAIApi(configuration);
                    
                    const chatCompletion = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {role: "system", content: "인식한 감정을 자연스러운 대화체로 말해주는 번역기"},
                        {role: "user", content: "슬퍼 표정이에요"},
                        {role: "assistant", content: "슬픈 표정을 짓고 있어요"},
                        {role: "user", content: "웃음 표정이에요"},
                        {role: "assistant", content: "웃고 있어요, 행복해보여요"},
                        {role: "user", content: `${result}`}],
                    });
                    
                    return res.json({content: chatCompletion.data.choices[0].message});
                    
                } catch (error) {
                    res.status(error.response.status).end();
                    console.log('error = ' + error.response.status);
                }

                res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
                return res.end(JSON.stringify(chatCompletion.data.choices[0].message));
                // return res.json({content: result});
            });
        });
    console.log( request.head );
    return;
};
