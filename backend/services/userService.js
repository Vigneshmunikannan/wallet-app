const { prisma } = require('../dbconfig/dbconnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'second value';

const userService = {
    async createWallet(userId) {
        try {
          // Check if wallet already exists
          const existingWallet = await prisma.wallet.findUnique({
            where: { userId }
          });
    
          if (existingWallet) {
            return existingWallet;
          }
          // Create new wallet
          const newWallet = await prisma.wallet.create({
            data: {
              userId,
              balance: 0,
              frozen: false
            }
          });
    
          return newWallet;
        } catch (error) {
          console.error('Error creating wallet:', error);
          throw new Error('Failed to create wallet');
        }
      },
      async registerUser({ username, email, password }) {
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });
    
        if (existingUser) {
            throw new Error('Username or email already exists');
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create new user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                frozen: false
            },
            select: {
                id: true,
                username: true,
                email: true
            }
        });
    
        // Create wallet and associate with user
        const wallet = await this.createWallet(user.id);
    
        // Update user with wallet ID
        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                Wallet: {
                    connect: { id: wallet.id }
                }
            }
        });
    
        return updatedUser;
    },
    
    async loginUser({ email, password }) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if account is frozen
        if (user.frozen) {
            throw new Error('Account is frozen');
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    },

    async updateUserStatus(userId, isFrozen) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { frozen: isFrozen },
                select: {
                    id: true,
                    username: true,
                    frozen: true
                }
            });

            return updatedUser;
        } catch (error) {
            throw new Error('Failed to update user status');
        }
    },

    async resetPassword({ email, newPassword }) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return { message: 'Password reset successful' };
    },


    async getUsers({
        page = 1,
        limit = 10,
        search,
        includeWallet = false
    }) {
        const offset = (page - 1) * limit;
    
        const whereClause = search
            ? {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } }
                ]
            }
            : {};
    
        // Fetch users from database
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
              id: true,
              username: true,
              email: true,
              frozen: true,
              Wallet: {
                select: {
                  id: true,
                  balance: true,
                  frozen: true
                }
              }
            },
            skip: offset,
            take: limit,
          });
        
    
        // Get total user count
        const totalUsers = await prisma.user.count({ where: whereClause });
    console.log(users)
        // Process the response to include wallet details if available
        return {
            users: users.map(user => ({
                ...user,
                walletFrozen: user.Wallet ? user.Wallet.frozen : null,
                walletBalance: user.Wallet ? user.Wallet.balance : null
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers
            }
        };
    }
    

};

module.exports = userService;