import * as dotenv from "dotenv";

import AMQPClient from "./client";
import { AMQPMode, Queues } from "./interfaces";

dotenv.config();

export const amqp = new AMQPClient({
  url: process.env.AMQP_URL!,
  queues: Object.values(Queues),
  mode: process.env.MODE as AMQPMode,
});
