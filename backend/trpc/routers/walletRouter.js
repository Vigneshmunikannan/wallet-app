const { router, protectedProcedure } = require('../trpc');
const z = require('zod');
const walletService = require('../../services/walletService');

const walletRouter = router({
  addTransaction: protectedProcedure
    .input(
      z.object({
        walletId: z.string(),
        type: z.enum(['credit', 'debit']),
        amount: z.number().positive(),
        category: z.string(),
        isRecurring: z.boolean().default(false),
        recurrenceType: z.string().optional(),
        recurrenceEnd: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return walletService.addTransaction(input);
    }),

  getBalance: protectedProcedure
    .input(z.string()) // Wallet ID
    .query(async ({ input }) => {
      return walletService.getWalletBalance(input);
    }),

  filterTransactions: protectedProcedure
    .input(
      z.object({
        walletId: z.string(),
        type: z.enum(['credit', 'debit']).optional(),
        month: z.number().min(1).max(12).optional(),
        page: z.number().min(1),
        limit: z.number().min(1),
      })
    )
    .query(async ({ input }) => {
      return walletService.getTransactions(input);
    }),

  addRecurringTransaction: protectedProcedure
    .input(
      z.object({
        walletId: z.string(),
        amount: z.number().positive(),
        category: z.string(),
        recurrenceType: z.enum(['daily', 'weekly', 'monthly']),
        recurrenceEnd: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      return walletService.addRecurringTransaction(input);
    }),

  freezeWallet: protectedProcedure
    .input(z.string()) // Wallet ID
    .mutation(async ({ input }) => {
      return walletService.updateWalletStatus(input, true);
    }),

  unfreezeWallet: protectedProcedure
    .input(z.string()) // Wallet ID
    .mutation(async ({ input }) => {
      return walletService.updateWalletStatus(input, false);
    }),
});

module.exports = walletRouter;
