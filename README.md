# Secure Node.js TypeScript Application

A production-grade Node.js application built with TypeScript, implementing comprehensive security best practices and modern development standards.

## Features

### 🔐 Security Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Password Security**: Bcrypt hashing with configurable rounds
- **Rate Limiting**: Configurable rate limiting for API endpoints
- **Input Validation**: Comprehensive request validation and sanitization
- **Security Headers**: Helmet.js for security headers configuration
- **CORS Protection**: Configurable Cross-Origin Resource Sharing
- **XSS Protection**: Cross-site scripting prevention
- **MongoDB Sanitization**: NoSQL injection prevention
- **Session Management**: Secure session handling with MongoDB store
- **Account Locking**: Automatic account locking after failed attempts

### 🛠️ Technical Features

- **TypeScript**: Full TypeScript support with strict configuration
- **Express.js**: RESTful API framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Winston**: Structured logging
- **Jest**: Testing framework with coverage
- **ESLint**: Code linting and formatting
- **Environment Configuration**: Secure environment variable management

### 📦 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── tests/          # Test files
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nodejs-boilerplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/logout` - User logout

### Health Check

- `GET /api/v1/health` - Server health status

## Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Database
MONGODB_URI=mongodb://localhost:27017/secure-app

# Session
SESSION_SECRET=your-super-secret-session-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Best Practices Implemented

1. **Password Security**
   - Minimum 8 characters with complexity requirements
   - Bcrypt hashing with configurable rounds
   - Password change validation

2. **Authentication**
   - JWT tokens with expiration
   - Secure token generation and verification
   - Role-based access control

3. **Input Validation**
   - Request body validation using express-validator
   - XSS protection
   - MongoDB injection prevention

4. **Rate Limiting**
   - Global rate limiting
   - Authentication-specific rate limiting
   - Password reset rate limiting

5. **Security Headers**
   - Helmet.js configuration
   - Custom security headers
   - HSTS in production

6. **Error Handling**
   - Secure error responses
   - Logging without sensitive data
   - Graceful error handling

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Setup

1. Set environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security Considerations

- Always use strong, unique secrets in production
- Regularly update dependencies
- Enable security monitoring and logging
- Use HTTPS in production
- Implement proper backup strategies
- Regular security audits and penetration testing
