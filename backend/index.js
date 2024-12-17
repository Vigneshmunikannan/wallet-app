const express = require('express');
const dotenv = require('dotenv').config();
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const cors =require('cors')
const appRouter = require('./trpc/appRouter');
const { createContext } = require('./trpc/trpc');

const { connectDb } = require('./dbconfig/dbconnection');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
// Database connection
connectDb();

// Middleware for JSON parsing
app.use(express.json());

// tRPC API routes
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext
}));

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;