const express = require("express");
const ttsCtrl = require("./tts.ctrl");
const ttsRouter = express.Router();

ttsRouter.use((req, res, next) => {
  console.log("API for TTS");
  next();
});
ttsRouter.post("/", ttsCtrl.ttsConversion);

module.exports = ttsRouter;