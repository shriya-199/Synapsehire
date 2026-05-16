const multer = require('multer');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const allowedRecordingMimeTypes = new Set(['video/webm', 'audio/webm', 'application/octet-stream']);

const upload = multer({
  storage,
  limits: {
    fileSize: env.upload.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new ApiError(400, 'Unsupported file type'));
    }

    return callback(null, true);
  }
});

module.exports = upload;

module.exports.recordingUpload = multer({
  storage,
  limits: {
    fileSize: env.upload.recordingMaxChunkMb * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedRecordingMimeTypes.has(file.mimetype)) {
      return callback(new ApiError(400, 'Unsupported recording chunk type'));
    }

    return callback(null, true);
  }
});
