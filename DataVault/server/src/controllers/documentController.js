const AWS = require('aws-sdk');
const Document = require('../models/Document');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.uploadDocument = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const s3Key = `documents/${req.user._id}/${Date.now()}-${file.originalname}`;
    
    // Upload to S3
    const uploadResult = await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise();

    // Create document record
    const document = new Document({
      name: file.originalname,
      owner: req.user._id,
      s3Key: s3Key,
      size: file.size,
      mimeType: file.mimetype,
      versions: [{
        s3Key: s3Key,
        createdAt: Date.now(),
        createdBy: req.user._id,
        description: 'Initial version'
      }]
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    }).populate('owner', 'name email');
    
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Error retrieving documents' });
  }
};

exports.shareDocument = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add or update share permission
    const shareIndex = document.sharedWith.findIndex(share => share.user.equals(userId));
    if (shareIndex > -1) {
      document.sharedWith[shareIndex].permission = permission;
    } else {
      document.sharedWith.push({ user: userId, permission });
    }

    await document.save();
    res.json(document);
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ message: 'Error sharing document' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete from S3
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.s3Key
    }).promise();

    // Delete all versions from S3
    for (const version of document.versions) {
      if (version.s3Key !== document.s3Key) {
        await s3.deleteObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: version.s3Key
        }).promise();
      }
    }

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access
    const hasAccess = document.owner.equals(req.user._id) || 
                     document.sharedWith.some(share => share.user.equals(req.user._id));
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get download URL from S3
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.s3Key,
      Expires: 3600 // URL expires in 1 hour
    });

    res.json({ document, url });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Error retrieving document' });
  }
};