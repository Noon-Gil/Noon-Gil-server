const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../tmp/my-uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + ".jpg");
  }
});
const upload = multer({ storage: storage });

exports.imgUpload = upload.single("name", (req, res, next) => {
  console.log("testing Image Upload. Check tmp folder");
  res.status(201);
  return res.json({data: "upload success"});
});
