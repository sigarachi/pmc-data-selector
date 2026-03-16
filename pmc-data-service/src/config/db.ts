import { PrismaClient } from "@prisma/client";
import logger from "../libs/logger";

const prisma = new PrismaClient({
  log: ["error", "query"],
});

prisma.$on("error", (e) => {
  logger.error(e);
});

prisma.$on("query", (e) => {
  logger.info(e);
});

export default prisma;
