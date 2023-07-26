const axios = require("axios");
var fs = require('fs');
require("dotenv").config();

const client_id = process.env.X_NCP_APIGW_API_KEY_ID;
const client_secret = process.env.X_NCP_APIGW_API_KEY;

exports.objectDetection = async (req, res) => {
  // var api_url = 'https://naveropenapi.apigw.ntruss.com/vision-obj/v1/detect'; // 객체 인식

  // var _formData = {
  //   image:'image',
  //   image: fs.createReadStream(req.file.path) // FILE 이름
  // };
  // var _req = request.post({url:api_url, formData:_formData,
  //   headers: {
  //     'X-NCP-APIGW-API-KEY-ID':client_id,
  //     'X-NCP-APIGW-API-KEY': client_secret
  //   }}).on('response', function(response) {
  //   console.log(response.statusCode) // 200
  //   console.log(response.headers['content-type'])

  //   // 응답 데이터를 받을 변수를 선언합니다.
  //   var responseData = '';

  //   // 데이터가 도착할 때마다 읽어서 responseData 변수에 추가합니다.
  //   response.on('data', function(chunk) {
  //     responseData += chunk;
  //   });

  //   // 모든 데이터를 읽었을 때 호출되는 이벤트 핸들러입니다.
  //   response.on('end', function() {
  //     // responseData에는 응답 본문의 전체 데이터가 저장되어 있습니다.
  //     console.log(responseData);
  //   });

  //   if(responseData["predictions"] === 0){
  //     res.status(200);
  //     return res.json({ data: "인식되는 물체가 없네요." })
  //   }

  //   const processedObjects = [];

  //   // for i in range 와 동일한 역할(감지된 object 개수만큼 반복)
  //   [...new Array(responseData["predictions"])].forEach((v, index) => {
  //     const obj = {
  //       id: responseData["detection_classes"][index],
  //       name: responseData["detection_names"][index],
  //       score: responseData["detection_scores"][index],
  //       position: (() => {
  //         const area = responseData["detection_boxes"][index];
  //         const x = (area[0] + area[2]) / 2;
  //         const y = (area[1] + area[3]) / 2;
  //         return {x: x, y: y}
  //       })(),
  //       size: (() => {
  //         const area = responseData["detection_boxes"][index];
  //         const width = Math.abs(area[0] - area[2]);
  //         const height = Math.abs(area[2] - area[3]);
  //         return x*y
  //       })(),
  //     }
  //     processedObjects.push(obj);
  //   });
  // });
  
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

    res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
    return res.end(JSON.stringify(translationRes.data.message.result.translatedText));
  } catch (error) {
    res.status(error.response.status).end();
    console.log('error = ' + error.response.status);
  }
}
