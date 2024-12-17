const { router, publicProcedure, protectedProcedure } = require('../trpc');
const z = require('zod'); // For type-safe validation
const userService = require('../../services/userService');

const userRouter = router({
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      return userService.registerUser(input);
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return userService.loginUser(input);
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Logic for invalidating session, if applicable
    return { message: 'Logout successful' };
  }),

  activate: publicProcedure
    .input(z.string()) // User ID
    .mutation(async ({ input }) => {
      return userService.updateUserStatus(input, false);
    }),

  deactivate: publicProcedure
    .input(z.string()) // User ID
    .mutation(async ({ input }) => {
      return userService.updateUserStatus(input, true);
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      return userService.resetPassword(input);
    }),

  getUsers: publicProcedure
    .input(
      z.object({
        page: z.number().min(1),
        limit: z.number().min(1),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return userService.getUsers(input);
    }),
});

module.exports = userRouter;
