const express = require('express');
const ocrCtrls = require('./ocr.ctrl');
const ocr = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../tmp/client-images/ocr/'));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  },
});

const upload = multer({ storage: storage });

ocr.use((req, res, next) => {
  console.log('API for OCR');
  next();
});

ocr.post('/', upload.single('name'), ocrCtrls.ocrConversion);

module.exports = ocr;
