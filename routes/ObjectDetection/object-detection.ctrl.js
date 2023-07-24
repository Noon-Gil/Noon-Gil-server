const axios = require("axios");
require("dotenv").config();

const client_id = process.env.X_NCP_APIGW_API_KEY_ID;
const client_secret = process.env.X_NCP_APIGW_API_KEY;

exports.objectDetection = async (req, res) => {
  console.log("file info: ", req.file);


  var api_url = 'https://naveropenapi.apigw.ntruss.com/vision-obj/v1/detect'; // 객체 인식
  const image = {
    name: "image",
    type: "image/jpg",
    uri: req.file.path,
  }
  const formData = new FormData();
  formData.append('name', image);
  const headers = {
    'X-NCP-APIGW-API-KEY-ID':client_id,
    'X-NCP-APIGW-API-KEY': client_secret,
    "Content-Type": "multipart/form-data",
  }

  console.log("uri is: ", req.file.path);

  var _res = await axios.post(api_url, formData, {
    headers: headers,
    transformRequest: formData => formData,
  });
  // console.log("api res: ", _res);

  res.status(200);
  return res.json({ message: "image dection success!" });
}
