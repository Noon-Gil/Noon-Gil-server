const cors = require("cors");
const express = require('express');
const logger = require("morgan");
const path = require('path');
require("dotenv").config();

const router = require("./routes");

const app = express();
app.use(cors());
// express 서버의 포트 지정
app.set("port", process.env.PORT || 3000);

// express의 미들웨어 설정
// request에 대한 로그를 기록하는 미들웨어
app.use(logger("dev"));
// 정적 파일들을 접근할 수 있도록하는 미들웨어
app.use(express.static(path.join(__dirname, "public")));
// request의 본문을 분석해주는 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// index 라우터
app.use("/", router);
// 404에러를 찾고 error handler로 인계하는 미들웨어
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});
// error handler
app.use((err, req, res, next) => {
  console.log("err content: ", err);
  res.local.message = err.message;
  res.local.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// 서버 설정
const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중입니다.");
});
