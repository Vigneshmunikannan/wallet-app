const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Connect to the database
const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the application if the connection fails
  }
};

// Export the Prisma client and connection function
module.exports = { prisma, connectDb };
