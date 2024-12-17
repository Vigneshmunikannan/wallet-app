const { initTRPC } = require('@trpc/server');
const { jwtUtils } = require('../utils/jwtUtils'); // Adjust path as needed

const t = initTRPC.create();

// Context: Add any shared objects like `db` or `user` here
const createContext = ({ req, res }) => {
  return { req, res }; // Add more context if needed
};

// Create a public procedure (no authentication required)
const publicProcedure = t.procedure;

// Create a protected procedure (requires authentication)
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  if (!authHeader) throw new Error('Unauthorized');
  const token = authHeader.split(' ')[1];
  try {
    const user = jwtUtils.verifyToken(token); // Verify JWT
    ctx.user = user; // Attach user to context
    return next();
  } catch {
    throw new Error('Unauthorized');
  }
});

module.exports = { 
  router: t.router, 
  publicProcedure, 
  protectedProcedure, 
  createContext 
};