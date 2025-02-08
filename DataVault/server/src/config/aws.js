// server/src/config/aws.js
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create S3 instance
const s3 = new AWS.S3();

// Helper functions for S3 operations
const s3Operations = {
  uploadFile: async (fileBuffer, fileName, mimeType) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `documents/${Date.now()}-${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      return uploadResult;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw error;
    }
  },

  deleteFile: async (key) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw error;
    }
  },

  getFile: async (key) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    try {
      const data = await s3.getObject(params).promise();
      return data;
    } catch (error) {
      console.error('S3 Get Error:', error);
      throw error;
    }
  },

  getSignedUrl: (key, expiresIn = 3600) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    try {
      return s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('S3 SignedUrl Error:', error);
      throw error;
    }
  }
};

module.exports = {
  s3,
  s3Operations
};