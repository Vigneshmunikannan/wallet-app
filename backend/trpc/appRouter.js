const { initTRPC } = require('@trpc/server');

// Import your routers (adjust paths as needed)
const userRouter = require('./routers/userRouter');
const walletRouter = require('./routers/walletRouter');

// Initialize tRPC
const t = initTRPC.create();

// Create the app router
const appRouter = t.router({
  user: userRouter,
  wallet: walletRouter,
});

// Export the router
module.exports = appRouter;

// Optional: If you want to export the type, you might need to do this separately
// This might require TypeScript or additional type definitions
module.exports.AppRouter = appRouter;