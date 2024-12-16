# Social Media Backend

A RESTful API backend for a social media application built with Node.js, Express, and MongoDB.

## Features

- User authentication with session cookies
- Article creation and management
- User profiles
- Following system
- File uploads with Cloudinary
- Comprehensive test suite

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd social-media-backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create .env file:
\`\`\`bash
cp .env.example .env
\`\`\`
Then fill in your environment variables.

## Running the Application

Development mode:
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

## Running Tests

\`\`\`bash
npm test
\`\`\`

## API Endpoints

### Authentication
- POST /login - User login
- POST /register - User registration
- PUT /logout - User logout
- PUT /password - Update password

### Articles
- GET /articles - Get feed articles
- GET /articles/:id - Get specific article
- POST /article - Create new article
- PUT /articles/:id - Update article

### Profile
- GET /headline/:user? - Get user headline
- PUT /headline - Update headline
- GET /email/:user? - Get user email
- PUT /email - Update email
- GET /zipcode/:user? - Get user zipcode
- PUT /zipcode - Update zipcode
- GET /avatar/:user? - Get user avatar
- PUT /avatar - Update avatar

### Following
- GET /following/:user? - Get following list
- PUT /following/:user - Follow user
- DELETE /following/:user - Unfollow user
