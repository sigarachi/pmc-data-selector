import * as dotenv from "dotenv";

import AMQPClient from "./client";
import { Queues } from "./interfaces";

dotenv.config();

export const amqp = new AMQPClient({
  url: process.env.AMQP_URL!,
  queues: Object.values(Queues),
});
