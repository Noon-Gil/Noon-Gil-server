const express = require("express");

const router = express.Router();

const test = require("./test");
const objectDetection = require("./ObjectDetection");
const soundToText = require("./SountToText");
const ocr = require("./OCR");

router.get("/", (req, res) => {
  res.locals.title = "Node Chat!";
  res.json("{index}");
});

router.use("/test", test);
router.use("/object-detection", objectDetection);
router.use("/stt", soundToText);
router.use("/ocr", ocr);

module.exports = router;
