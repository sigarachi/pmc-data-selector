import winston from "winston";
import Transport from "winston-transport";
import { Client } from "@opensearch-project/opensearch";
import { OpensearchTransport } from "winston-opensearch";

const { combine, timestamp, errors, json, printf } = winston.format;

/**
 * OpenSearch client
 */
const opensearch = new Client({
  node: process.env.OPENSEARCH_URL || "http://localhost:9200",
  auth: {
    username: process.env.OPENSEARCH_USERNAME || "admin",
    password: process.env.OPENSEARCH_PASSWORD || "admin",
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Custom Winston transport for OpenSearch
 *
 */

const opensearchClient = new Client({
  node: process.env.OPENSEARCH_URL || "https://localhost:9200",
  auth: {
    username: process.env.OPENSEARCH_USERNAME || "admin",
    password: process.env.OPENSEARCH_PASSWORD || "admin",
  },
  ssl: {
    rejectUnauthorized: false, // Secure in production
  },
});

const esTransportOpts = {
  level: "info", // Minimum log level to send to OpenSearch
  client: opensearchClient, // Use the pre-configured client
  indexPrefix: "pmc-service",
  transformer: (logData: winston.LogEntry) => {
    const { level, message, meta } = logData;
    return {
      "@timestamp": new Date().toISOString(),
      severity: level,
      message: message,
      fields: {
        ...meta, // Spread all metadata into the 'fields' object
        environment: process.env.NODE_ENV || "development",
      },
    };
  },
  // Optional: Handle bulk write failures gracefully
  retryLimit: 5,
};

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

/**
 * Winston Logger
 */
const logger = winston.createLogger({
  level: "info", // Minimum level to process
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(), // Structured JSON logs are best for OpenSearch
  ),
  defaultMeta: { service: "user-service" }, // Metadata added to all logs
  transports: [
    new winston.transports.Console({
      // Always log to console for development
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new OpensearchTransport(esTransportOpts as any), // Add the OpenSearch transport
  ],
});

export default logger;
