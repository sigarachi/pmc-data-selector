import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import router from "./routes";

dotenv.config();

const PORT = process.env.PORT || 5000;

const ORIGIN = process.env.CORS_ORIGIN;

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

app.use(helmet());
app.use(
  helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }),
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    credentials: true,
    origin: ORIGIN,
  }),
);
app.use(bodyParser.json());
app.use(fileUpload({ createParentPath: true }));

app.use("/", router);

server.listen(PORT, () => {
  console.log(`App has been started on port ${PORT}`);
});
