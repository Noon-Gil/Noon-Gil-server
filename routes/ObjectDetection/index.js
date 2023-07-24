const express = require("express");
const objectDetectionCtrls = require("./object-detection.ctrl");
const objectDetection = express.Router();

const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../tmp/client-images/detection/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".jpg");
  }
});
const upload = multer({ storage: storage });

objectDetection.use((req, res, next) => {
  console.log("API for Object Detection");
  next();
});
objectDetection.post("/", upload.single("name"), objectDetectionCtrls.objectDetection);

module.exports = objectDetection;
