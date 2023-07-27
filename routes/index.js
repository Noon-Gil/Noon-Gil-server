const express = require("express");

const router = express.Router();


const faceRecognition = require("./FaceRecognition");
const objectDetection = require("./ObjectDetection");
const ocr = require("./OCR");
const soundToText = require("./SountToText");
const test = require("./test");
const tts = require("./TTS");

router.get("/", (req, res) => {
  res.locals.title = "Node Chat!";
  res.json("{index}");
});

router.use("/face-recognition", faceRecognition);
router.use("/object-detection", objectDetection);
router.use("/ocr", ocr);
router.use("/stt", soundToText);
router.use("/test", test);
router.use("/tts", tts);

module.exports = router;
