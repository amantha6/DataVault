# DataVault - Secure Document Management System

## Project Structure
```
datavault/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    
│   │   ├── pages/         
│   │   ├── utils/         
│   │   └── App.js
│   ├── package.json
│   └── .env
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   
│   │   ├── middleware/    
│   │   ├── models/        
│   │   ├── routes/        
│   │   └── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## Required Technologies
- Node.js (v14+)
- AWS Account with S3 and DynamoDB access
- MongoDB
- Git

## Setup Instructions

### 1. Initial Setup

```bash
# Create project directory
mkdir datavault
cd datavault

# Initialize frontend
npx create-react-app client
cd client
npm install @aws-sdk/client-s3 @aws-sdk/client-dynamodb axios socket.io-client
npm install @mui/material @emotion/react @emotion/styled
npm install react-router-dom jsonwebtoken

# Initialize backend
cd ../
mkdir server
cd server
npm init -y
npm install express cors dotenv aws-sdk mongodb socket.io
npm install jsonwebtoken bcryptjs multer
npm install -D nodemon
```

### 2. Environment Variables

Create `.env` files in both client and server directories:

client/.env:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AWS_REGION=your-aws-region
```

server/.env:
```
PORT=5000
MONGODB_URI=your-mongodb-uri
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
S3_BUCKET_NAME=your-bucket-name
```

### 3. AWS Setup

1. Create an S3 bucket for document storage
2. Create a DynamoDB table for version control
3. Set up IAM user with appropriate permissions
4. Configure CORS on S3 bucket

### 4. MongoDB Setup

1. Create a MongoDB database
2. Set up collections: users, documents, versions
3. Create indexes for efficient querying