const multer = require('multer');
const logger = require('../common/Logger')('src/routes/uploadRoute.js');
const Backend = require('../service/Backend');

const salesProvider = Backend.SalesProvider;
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
    upload(req, res, async err => {
      try {
        if (err) {
          throw err;
        }
        const { body, files } = req;
        const { user_id: userId } = body;
        if (typeof userId === 'string' && userId.length) {
          const ret = await salesProvider.createManualUploadObject(userId);
          await Promise.all(
            files.map(async file => {
              return salesProvider.uploadFileAsAttachment(
                ret.id,
                file.originalname,
                file.buffer,
                file.mimetype
              );
            })
          );
          return res.json({ success: true, mes: 'File uploaded.' });
        }
        throw new Error(`Invalid user_id ${userId}`);
      } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: 'Error uploading file.' });
      }
    });
  });
};
