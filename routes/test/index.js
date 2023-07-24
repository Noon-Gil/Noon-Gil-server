const express = require("express");
const testCtrls = require("./test.ctrl");
const test = express.Router();

test.use((req, res, next) => {
  console.log("API for test");
  next();
});
test.post("/imgUpload", testCtrls.imgUpload);

module.exports = test;
