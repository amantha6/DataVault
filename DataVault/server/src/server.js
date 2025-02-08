// server/src/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/versions', require('./routes/versions'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-document', (documentId) => {
    socket.join(documentId);
  });
  
  socket.on('document-change', (data) => {
    socket.to(data.documentId).emit('document-updated', data);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: String,
  created: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

// server/src/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  size: Number,
  mimeType: String,
  versions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version'
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    }
  }],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);

// server/src/controllers/documentController.js
const AWS = require('aws-sdk');
const Document = require('../models/Document');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION
});

exports.uploadDocument = async (req, res) => {
  try {
    const { file } = req;
    const s3Key = `documents/${Date.now()}-${file.originalname}`;
    
    const uploadResult = await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise();
    
    const document = new Document({
      name: file.originalname,
      owner: req.user._id,
      s3Key: s3Key,
      size: file.size,
      mimeType: file.mimetype
    });
    
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('versions');
      
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const s3Object = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.s3Key
    }).promise();
    
    res.status(200).json({
      document,
      content: s3Object.Body
    });
  } catch (error) {
    console.error('Retrieval error:', error);
    res.status(500).json({ message: 'Retrieval failed' });
  }
};