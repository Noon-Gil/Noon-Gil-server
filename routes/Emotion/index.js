const express = require("express");
const emotionCtrls = require("./emotion.ctrl");
const emotion = express.Router();

const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../tmp/client-images/emotion/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".jpeg");
  }
});
const upload = multer({ storage: storage });

emotion.use((req, res, next) => {
  console.log("API for Emotion");
  next();
});
emotion.post("/", upload.single("name"), emotionCtrls.emotion);

module.exports = emotion;
