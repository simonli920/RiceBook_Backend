# Backend Server for Assignment

- **Test User**

  - Username: "joey"
  - Password: "pass"

- **Backend URL**
  - https://your-app-name.herokuapp.com

## How to Run Tests Locally

1. Ensure MongoDB is running locally or update the test database URL in `articles.spec.js`.
2. Install dependencies: `npm install`
3. Run tests: `npm test`

## How to Run the Server Locally

1. Set the environment variable for MongoDB connection:
   ```bash
   export MONGODB_URI='your-mongodb-connection-string'
   ```
