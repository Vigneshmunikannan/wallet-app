const { prisma } = require('../dbconfig/dbconnection');
const { addDays, addWeeks, addMonths, isAfter } = require('date-fns');

const walletService = {
  

  async addTransaction({ walletId, type, amount, category, isRecurring, recurrenceType, recurrenceEnd }) {
    try {
      // Check wallet status
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.frozen) {
        throw new Error('Wallet is frozen. Cannot perform transactions.');
      }

      // Perform transaction
      const transaction = await prisma.transaction.create({
        data: {
          walletId,
          type,
          amount,
          category,
          isRecurring,
          recurrenceType,
          recurrenceEnd
        }
      });

      // Update wallet balance
      const updatedBalance = type === 'credit' 
        ? wallet.balance + amount 
        : wallet.balance - amount;

      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: updatedBalance }
      });

      return transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw new Error('Failed to add transaction');
    }
  },

  async getWalletBalance(walletId) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId },
        select: { balance: true, frozen: true }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      return {
        balance: wallet.balance,
        isFrozen: wallet.frozen
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw new Error('Failed to retrieve wallet balance');
    }
  },

  async getTransactions({ walletId, type, month, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;

      // Build filter conditions
      const whereConditions = {
        walletId,
        ...(type && { type }),
        ...(month && {
          createdAt: {
            gte: new Date(new Date().getFullYear(), month - 1, 1),
            lt: new Date(new Date().getFullYear(), month, 1)
          }
        })
      };

      // Fetch transactions
      const transactions = await prisma.transaction.findMany({
        where: whereConditions,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      // Count total transactions
      const totalTransactions = await prisma.transaction.count({
        where: whereConditions
      });

      return {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTransactions / limit),
          totalTransactions
        }
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  },

  async addRecurringTransaction({ walletId, amount, category, recurrenceType, recurrenceEnd }) {
    try {
      // Check wallet status
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.frozen) {
        throw new Error('Wallet is frozen. Cannot add recurring transactions.');
      }

      // Create initial transaction
      const initialTransaction = await prisma.transaction.create({
        data: {
          walletId,
          type: 'debit', // Assuming recurring transactions are typically debits
          amount,
          category,
          isRecurring: true,
          recurrenceType,
          recurrenceEnd
        }
      });

      // Update wallet balance
      const updatedBalance = wallet.balance - amount;
      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: updatedBalance }
      });

      // Schedule additional recurring transactions
      await this.scheduleRecurringTransactions(initialTransaction);

      return initialTransaction;
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      throw new Error('Failed to add recurring transaction');
    }
  },

  async scheduleRecurringTransactions(transaction) {
    if (!transaction.isRecurring || !transaction.recurrenceEnd) return;

    let nextTransactionDate = this.getNextRecurrenceDate(transaction);
    
    while (isAfter(transaction.recurrenceEnd, nextTransactionDate)) {
      try {
        await prisma.transaction.create({
          data: {
            walletId: transaction.walletId,
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            isRecurring: true,
            recurrenceType: transaction.recurrenceType,
            recurrenceEnd: transaction.recurrenceEnd,
            createdAt: nextTransactionDate
          }
        });

        // Update wallet balance
        await prisma.wallet.update({
          where: { id: transaction.walletId },
          data: { 
            balance: {
              decrement: transaction.amount
            }
          }
        });

        // Calculate next transaction date
        nextTransactionDate = this.getNextRecurrenceDate({
          ...transaction,
          createdAt: nextTransactionDate
        });
      } catch (error) {
        console.error('Error scheduling recurring transaction:', error);
        break;
      }
    }
  },

  getNextRecurrenceDate(transaction) {
    const lastTransactionDate = transaction.createdAt || new Date();
    
    switch (transaction.recurrenceType) {
      case 'daily':
        return addDays(lastTransactionDate, 1);
      case 'weekly':
        return addWeeks(lastTransactionDate, 1);
      case 'monthly':
        return addMonths(lastTransactionDate, 1);
      default:
        throw new Error('Invalid recurrence type');
    }
  },

  async updateWalletStatus(walletId, freeze) {
    try {
      // Check current wallet status
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check if status is already the same
      if (wallet.frozen === freeze) {
        return wallet;
      }

      // Update wallet status
      const updatedWallet = await prisma.wallet.update({
        where: { id: walletId },
        data: { frozen: freeze }
      });

      return updatedWallet;
    } catch (error) {
      console.error('Error updating wallet status:', error);
      throw new Error('Failed to update wallet status');
    }
  }
};

module.exports = walletService;