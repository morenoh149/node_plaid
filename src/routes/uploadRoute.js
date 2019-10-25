const multer = require('multer');

const storage = multer.memoryStorage();

const MAX_DOCUMENTS_COUNT = 3;
// 5 Mb
const MAX_FILESIZE = 5 * 1024 * 1024;
const upload = multer({ storage, limits: { fileSize: MAX_FILESIZE } }).array(
  'userDocuments',
  MAX_DOCUMENTS_COUNT
);

module.exports = app => {
  app.post('/upload', (req, res) => {
    upload(req, res, err => {
      // console.log(req.body);
      // console.log(req.files);
      if (err) {
        return res.end('Error uploading file.');
      }
      return res.end('File is uploaded');
    });
  });
};
