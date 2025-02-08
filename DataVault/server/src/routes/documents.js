// routes/documents.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  uploadDocument,
  getDocuments,
  getDocument,
  shareDocument,
  deleteDocument
} = require('../controllers/documentController');

// Document routes
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.post('/:id/share', protect, shareDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;