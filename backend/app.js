const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const serviceAccount = require("./meet-up-app-6b65c-firebase-adminsdk-6lyn2-226300e51e.json");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const app = express();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: "ap-south-1",
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // cb(null, Date.now().toString())
      cb(null, file.originalname);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://meet-up-app-6b65c-default-rtdb.firebaseio.com",
});

const usersRoutes = require("./routes/user.route");
const blogsRoutes = require("./routes/blog.route");
const fileUploadRoutes = require("./routes/fileUpload.route");
const HttpError = require("./models/http-error");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(bodyParser.json());

app.use("/api/users", usersRoutes);
app.use("/api/files", fileUploadRoutes);
app.use("/api/blogs", blogsRoutes);

app.post("/upload", upload.single("file"), async function (req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: "File upload failed" });
  }

  if (req.file && req.file.location) {
    res.status(200).json({
      success: 1,
      file: {
        url: req.file.location,
      },
    });
  } else {
    res
      .status(400)
      .json({ success: 0, error: "No file received or invalid file format." });
  }
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oveofxm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      autoIndex: true,
    }
  )
  .then(() => {
    console.log("connected");
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });


