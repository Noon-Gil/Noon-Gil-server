const axios = require("axios");
var fs = require('fs');
const request = require('request');
require("dotenv").config();

const api_url = 'https://naveropenapi.apigw.ntruss.com/vision/v1/celebrity'; // 유명인 인식
const client_id = process.env.X_NCP_APIGW_API_KEY_ID;
const client_secret = process.env.X_NCP_APIGW_API_KEY;

exports.faceRecognition = (req, res) => {
  const file_path = req.file.path;
  // const formData = new FormData();
  // formData.append('image', fs.createReadStream(file_path));

  // const config = {
  //   headers: {
  //     'X-NCP-APIGW-API-KEY-ID': client_id,
  //     'X-NCP-APIGW-API-KEY': client_secret,
  //     'Content-Type': 'multipart/form-data',
  //   },
  // };

  // axios.post(api_url, formData, config)
  // .then(response => {
  //   console.log('응답 상태 코드:', response.status);
  //   console.log('응답 데이터:', response.data);
  //   return res.json({data: response.data});
  // })
  // .catch(error => {
  //   console.error('에러 발생:', error);
  // });

  var _formData = {
    image:'image',
    image: fs.createReadStream(file_path), // FILE 이름
  };
   var _req = request.post({url:api_url, formData:_formData,
     headers: {'X-NCP-APIGW-API-KEY-ID':client_id, 'X-NCP-APIGW-API-KEY': client_secret}}).on('response', function(response) {
      console.log(response.statusCode) // 200
      console.log(response.headers['content-type'])
      console.log(Object.keys(response));
      console.log(response.statusMessage);
      if(response.statusCode !== 200){
        return res.json({content: "얼굴 인식중 에러가 발생했어요"});
      }

      // 데이터 수신 처리
      let responseData = '';
      response.on('data', function(chunk) {
        responseData += chunk;
      });

      response.on('end', function() {
        console.log('응답 본문:', responseData);
        const parsedData = JSON.parse(responseData);

        let result = "";
        if(parsedData.info.faceCount === 0){
          result = "닮은 유명인을 찾지 못했어요"
        } else {
          result = `${parsedData.faces[0].celebrity.value} 씨를 닮은 것 같아요`;
        }
        console.log("result: ", result);
        return res.json({content: result});
      });
   });
   console.log( request.head  );
   return;
};
