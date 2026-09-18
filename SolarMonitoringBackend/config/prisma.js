const { PrismaClient } = require('@prisma/client');


BigInt.prototype.toJSON = function () {
  return this.toString();
};

const prisma = new PrismaClient({});

module.exports = prisma;
