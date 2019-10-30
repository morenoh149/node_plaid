const multer = require('multer');
const logger = require('../../common/Logger')('src/routes/uploadRoute.js');
const Backend = require('../../service/Backend');

const salesProvider = Backend.SalesProvider;
/**
 * Temporary storage for uploaded files.
 * @type {MemoryStorage}
 * @deprecated Should change to file storage in production
 */
const storage = multer.memoryStorage();

/**
 * Maximum files for uploading (LIMIT)
 * @type {number}
 */
const MAX_DOCUMENTS_COUNT = 3;

/**
 * Maximum file size for uploading (LIMIT)
 * @type {number}
 */
const MAX_FILESIZE = 5 * 1024 * 1024;

/**
 * Upload handler
 */
const upload = multer({ storage, limits: { fileSize: MAX_FILESIZE } }).array(
  'userDocuments',
  MAX_DOCUMENTS_COUNT
);

/**
 * Set route for uploading files to Salesforce.
 * @param app
 */
module.exports = app => {
  app.post('/upload', (req, res) => {
    upload(req, res, async err => {
      try {
        if (err) {
          throw err;
        }
        const { body, files } = req;
        const { user_id: userId } = body;
        /**
         * userId must be set and have some value.
         * Maybe need to change this validation by using https://www.npmjs.com/package/@hapi/joi
         */
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
          return res.redirect('/');
        }
        throw new Error(`Invalid user_id ${userId}`);
      } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: 'Error uploading file.' });
      }
    });
  });
};
