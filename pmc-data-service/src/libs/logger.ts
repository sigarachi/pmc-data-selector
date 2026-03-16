import winston from "winston";
import { Client } from "@opensearch-project/opensearch";
import { OpensearchTransport } from "winston-opensearch";

const opensearchClient = new Client({
  node: process.env.OPENSEARCH_URL || "https://localhost:9200",
  auth: {
    username: process.env.OPENSEARCH_USERNAME || "admin",
    password: process.env.OPENSEARCH_PASSWORD || "admin",
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

const esTransportOpts = {
  level: "info",
  client: opensearchClient,
  indexPrefix: "pmc-service",
  transformer: (logData: winston.LogEntry) => {
    const { level, message, meta } = logData;
    return {
      "@timestamp": new Date().toISOString(),
      severity: level,
      message: message,
      fields: {
        ...meta,
        environment: process.env.NODE_ENV || "development",
      },
    };
  },

  retryLimit: 5,
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new OpensearchTransport(esTransportOpts as any),
  ],
});

export default logger;
