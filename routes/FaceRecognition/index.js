const express = require("express");
const faceRecognitionCtrls = require("./face-recognition.ctrl");
const faceRecognition = express.Router();

const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../tmp/client-images/face-recognition/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".jpeg");
  }
});
const upload = multer({ storage: storage });

faceRecognition.use((req, res, next) => {
  console.log("API for Face Recognition");
  next();
});
faceRecognition.post("/", upload.single("name"), faceRecognitionCtrls.faceRecognition);

module.exports = faceRecognition;
