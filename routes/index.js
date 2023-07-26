const express = require("express");

const router = express.Router();

const test = require("./test");
const objectDetection = require("./ObjectDetection");
const ocr = require("./OCR");
const tts = require("./TTS");

router.get("/", (req, res) => {
  res.locals.title = "Node Chat!";
  res.json("{index}");
});

router.use("/test", test);
router.use("/object-detection", objectDetection);
router.use("/tts", tts);
router.use("/ocr", ocr);

module.exports = router;
