const express = require("express");

const router = express.Router();
const test = require("./test");

router.get("/", (req, res) => {
  res.locals.title = "Node Chat!";
  res.json("{index}");
});
router.use("/test", test);

module.exports = router;
