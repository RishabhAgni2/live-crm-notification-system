const { PrismaClient } = require('@prisma/client');

// Single shared Prisma client instance (connects to Postgres/Neon using DATABASE_URL)
const prisma = new PrismaClient();

module.exports = prisma;
