const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: "ap-south-1",
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const s3 = new aws.S3();

const getAllFile = async (req, res, next) => {
  try {
    let r = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();
    let x = r.Contents.map((item) => item.Key);
    res.send(x);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const downloadFile = async (req, res, next) => {
  const filename = req.params.filename;
  try {
    let x = await s3
      .getObject({ Bucket: BUCKET_NAME, Key: filename })
      .promise();
    res.send(x.Body);
  } catch (error) {
    console.error(error);
    res.status(404).send("File Not Found");
  }
};

const deleteFile = async (req, res, next) => {
  const filename = req.params.filename;
  try {
    await s3.deleteObject({ Bucket: BUCKET_NAME, Key: filename }).promise();
    res.send("File Deleted Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getAllFile = getAllFile;
exports.downloadFile = downloadFile;
exports.deleteFile = deleteFile;
