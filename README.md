# DataVault

A secure document management system built with Node.js, Express, MongoDB, and AWS S3.

## Features

- Secure file upload and storage using AWS S3
- Document version control
- User authentication and authorization
- File sharing capabilities
- Real-time collaboration using Socket.IO
- Secure document access management

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Storage:** AWS S3
- **Real-time:** Socket.IO
- **Authentication:** JWT

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/your-username/DataVault.git
cd DataVault
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a .env file in the server directory with the following:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_bucket_name
CLIENT_URL=http://localhost:3000
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Documents
- POST /api/documents/upload - Upload new document
- GET /api/documents - Get all user documents
- GET /api/documents/:id - Get specific document
- POST /api/documents/:id/share - Share document
- DELETE /api/documents/:id - Delete document

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
