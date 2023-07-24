const express = require("express");

const router = express.Router();
const test = require("./test");
const objectDetection = require("./ObjectDetection");

router.get("/", (req, res) => {
  res.locals.title = "Node Chat!";
  res.json("{index}");
});
router.use("/test", test);
router.use("/object-detection", objectDetection);

module.exports = router;