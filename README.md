# Rozgarly Backend API

A comprehensive Node.js backend for the Rozgarly job application platform, built with TypeScript, Express, and Firestore using a class-based MVC architecture.

## 🚀 Features

- **Authentication**: Firebase ID token-based authentication
- **Job Management**: CRUD operations, search, filtering, and skill matching
- **Applications & Referrals**: Track job applications and referral system
- **Real-time Community**: Socket.io-powered chat and group messaging
- **Upskilling**: Course management and recommendations
- **Gamification**: Points and badges system
- **Geolocation**: Hyperlocal job search with distance calculations
- **Rate Limiting**: Comprehensive rate limiting for API protection
- **Validation**: Zod-based request validation
- **Logging**: Winston-based structured logging

## 🏗️ Architecture

The project follows a class-based MVC architecture:

```
src/
├── config/          # Configuration files (Firebase, environment)
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # FireORM data models
├── repositories/    # Data access layer
├── routes/          # Express route definitions
├── middlewares/     # Custom middleware functions
├── dtos/           # Zod validation schemas
├── sockets/        # Socket.io implementations
├── utils/          # Utility functions
└── scripts/        # Utility scripts
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: Firestore (via FireORM)
- **Authentication**: Firebase Admin SDK
- **Real-time**: Socket.io
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase project with Firestore enabled
- Firebase service account key

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rozgarly-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Configure your `.env` file. Since you have the `service-account.json` file, you can use either approach:

   **Option 1: Use Service Account File (Recommended)**

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Firebase Configuration (using your service-account.json file)
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Logging
   LOG_LEVEL=info
   ```

   **Option 2: Use Individual Environment Variables**

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Firebase Configuration (extracted from service-account.json)
   FIREBASE_PROJECT_ID=rozgarly-12adf
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqIfDgGDCK40Tt\nU7bwrqjZbTidLo/zTCy6Gua/4Io59t1fdWxlEA1blY2FiDiglHoCfoKmbgZox5fI\niV0iefGZyT/NCSn6bLYDFb86PmjnSG/wEjekiT2SDMWRlygRtvptzmBVOKa+H/SI\nURAuvXrrQNdxSvaS5vQn3oR/JqF8AW9ikU/IhoSIEBwzkZWZ0JNKI3HyUC3vZzzx\n0Xuce+juYWFUpgGUqQdAmOOFZBmeqkJj9s8HxiO2pKGbTG0IQA9zkd2XbOztL/RB\nCe2s9XNA6jo8Nr0rE3G81T9bwssX8UvJe0EyUeWNDyhtvSJOpZBzxQVz53Ukmwlq\nG2kUbBdvAgMBAAECggEAHUEKzy25oxgjMP/VFBukUwax1m08OWSeyD158gJlIkRt\nmk1xnwsckOPtWsmqmwoM1ML2KjH/DiNL2SKtjhET1xLA0rvBqRrqTSt/Hz++AA73\nmHs5cCRdHvDtQ/SO4kTpWNpEvEKqgUSzYoE13COesDcNFKEENwxZbUWY2NhGqjC4\nwZoS1ibDZFTnqQfr6nzK9OLCyKtkvZmzXBBs1kfNBt5PDhklTRrriYQsu1yDQCoP\nqIQqG3HHNU37AztYAypw6yYmu1GpYCgYyteyjSWcUTuCaVoXH35NUKjbB3/uvdV7\nhNUBX+mhJYBRulbc/XrBV9Za6Ytade0NjIZKwLi5uQKBgQDpjDf3AOU0OHk2Y4wC\nLFCiGAerISjmZueQ30aO/r2Vw4iNxJBqx7f1Y8RdCYm9ihyOd3VV3S1w7KhSm46M\naZkgwBwZdumTNErUpsX9qGVEyL/52nQDE+l6MpUB7dzgjTcXlWmk3PFcgWfVj2FI\neKkCmelxUJCOY8D7yu+NTWednQKBgQC6fQdlXCoJP9b12jVlkz1ZFrfOR/unMgbu\nY6XefibuOD4UI3gJShu9o9ys10i6heHrWtf3WLcIoqhoJGBgcFO9e3AW66QpOaUy\nzMzMuAZ7aoQVVgEkmR6LaDd6arf0LeZbrcC7mB6+uSgrnvy0L4shlxN3+JRljeh9\nlOgh3BDBewKBgFcdpKqQPO7zudMd4tXUrecoy4N8BQOckvgpMOqZ/yHkJAWtsqkC\nAo6YPmDt8+EtqWVDDhOPQyoCPO9DczLRGPtsbY7aGlp8gQU9iFEMBWpY77NFV0zm\nmoqoX4iur1tbkZdMdnG2sJlu88pnh0Q/Ldv4iWlpQeK7Nvs1QZIVs3bJAoGBALBd\nK9BtAAgtSsLJcbQ1MlB9jqjUJKdzRWDP9n7bOUATCoqLHKtUXbXUMQ94rfxQP18X\n5Hy0dq0A/1k2BbtOn7NT+KaEhYTDUnsfehOleePf0ThIVN5ivKNElSr9oCiZ+//5\n64q+C119yAKw4fYZ/G9w6+WKvfTo5tVVLM9QyrvfAoGBAL9IYphuod3PPWpKl9ei\n/mAMrD9Ubhq9PJBTHRAbSsMY/PypRgiwcuAAt7OfME4NnJvuO6AWmfy7/Vwy9Tgq\nF9jye+TR84zBCgknvfToo3d2EXDLu5pCvdg98caFPQShOx9vgkELPzk6Ha/qtFNW\njKaB4nwrCicIk2GtZqRyGHnG\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rozgarly-12adf.iam.gserviceaccount.com
   FIREBASE_DATABASE_URL=https://rozgarly-12adf-default-rtdb.firebaseio.com

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Logging
   LOG_LEVEL=info
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore Database
   - Generate a service account key
   - Download the JSON key file and update `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

5. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Seed Initial Data

```bash
npm run seed
```

### Ingest External Jobs

```bash
npm run ingest
```

## 📚 API Documentation

### Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Core Endpoints

#### Health Check

```http
GET /health
```

#### Authentication

```http
POST /api/auth/users              # Create user
GET  /api/auth/profile            # Get user profile
PUT  /api/auth/profile            # Update user profile
GET  /api/auth/profile/stats      # Get user stats
```

#### Jobs

```http
GET  /api/jobs/search             # Search jobs
GET  /api/jobs/nearby             # Get nearby jobs
POST /api/jobs/match              # Match jobs by skills
GET  /api/jobs/:id                # Get job by ID
POST /api/jobs                    # Create job (Employer)
PUT  /api/jobs/:id                # Update job (Employer)
```

#### Applications

```http
POST /api/applications            # Submit application
GET  /api/applications/my-applications  # Get user applications
PUT  /api/applications/:id/status # Update application status
```

#### Referrals

```http
POST /api/referrals               # Create referral
GET  /api/referrals/my-referrals  # Get user referrals
PUT  /api/referrals/:id/status    # Update referral status
```

#### Community

```http
GET  /api/community/groups        # Get groups
POST /api/community/groups        # Create group
POST /api/community/groups/join   # Join group
POST /api/community/messages      # Send message
```

#### Upskilling

```http
GET  /api/upskill/courses         # Get courses
GET  /api/upskill/courses/free    # Get free courses
POST /api/upskill/courses/recommendations  # Get recommendations
```

### Socket.io Events

Connect to the community namespace:

```javascript
const socket = io('/community', {
  auth: {
    token: 'your-firebase-id-token',
  },
});

// Join a group
socket.emit('join-group', { groupId: 'group-id' });

// Send a message
socket.emit('send-message', {
  groupId: 'group-id',
  content: 'Hello everyone!',
  type: 'text',
});

// Listen for new messages
socket.on('new-message', data => {
  console.log('New message:', data);
});
```

## 🔒 Security Features

- **Firebase Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Error Handling**: Centralized error handling with logging

## 📊 Database Schema

### Users

- Basic profile information
- Skills and badges
- Points system
- Role-based access control

### Jobs

- Job details and requirements
- Location and salary information
- Skills matching
- External source tracking

### Applications

- User applications to jobs
- Status tracking
- Resume and cover note storage

### Referrals

- Referral system
- Points awarding
- Status tracking

### Groups & Messages

- Community groups
- Real-time messaging
- Message reactions

### Courses

- Course information
- Provider and level
- Tags and recommendations

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📦 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed initial data
- `npm run ingest` - Ingest external job data

## 🚀 Deployment

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

```env
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_PRIVATE_KEY="your-production-private-key"
FIREBASE_CLIENT_EMAIL=your-production-client-email
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the logs for debugging

## 🔄 Changelog

### v1.0.0

- Initial release
- Complete MVC architecture
- Firebase authentication
- Job management system
- Real-time community features
- Upskilling platform
- Gamification system
