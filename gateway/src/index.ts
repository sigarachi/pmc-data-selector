import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const PORT = process.env.PORT || 4000;

const ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const PMC_API = process.env.PMC_API ?? "http://localhost:3000";

const NETCDF_API = process.env.NETCDF_API ?? "http://localhost:8000";

const app = express();
const server = http.createServer(app);

const services = [
  {
    route: "/pmc-api",
    target: PMC_API,
  },
  {
    route: "/netcdf-api",
    target: NETCDF_API,
  },
];
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }),
);
//app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(
  cors({
    credentials: true,
    origin: ORIGIN,
  }),
);

app.disable("x-powered-by");

services.forEach(({ route, target }) => {
  // Proxy options
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: "",
    },
    proxyTimeout: 1000000,
    headers: {
      Connection: "keep-alive",
    },
    logger: console,
  };

  // Apply rate limiting and timeout middleware before proxying
  app.use(route, createProxyMiddleware(proxyOptions));
});

server.listen(PORT, () => {
  console.log(`App has been started on port ${PORT}`);
});
