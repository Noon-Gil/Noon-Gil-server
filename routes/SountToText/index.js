const express = require("express");
const multer  = require('multer');
const path = require('path');
const soundToTextCtrl = require("./sound-to-text.ctrl");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../tmp/client-audios/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".m4a");
  }
});

const stt = express.Router();
const upload = multer({ storage: storage });

stt.use((req, res, next) => {
  console.log("API for Sound to Text");
  next();
});
stt.post("/selection", upload.single("name"), soundToTextCtrl.selection);

module.exports = stt;
