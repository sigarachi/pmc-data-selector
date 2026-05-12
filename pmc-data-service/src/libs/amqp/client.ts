import amqp from "amqplib";

import { AMQPClientOptionsSpec, AMQPMode } from "./interfaces";
import logger from "../logger";

/**
 * AMQP (RabbitMQ) client class for sending/receiving messages
 */
export default class AMQPClient {
  /**
   * RabbitMQ connection URL
   * @private
   */
  private readonly url: string;

  /**
   * Connection instance
   * @private
   */
  private connection: amqp.Connection | null = null;

  /**
   * Queues
   * @private
   */
  private queues: string[];

  /**
   * Channel instance
   * @private
   */
  private channel: amqp.Channel | null = null;

  /**
   * Connection status
   * @private
   */
  private connected: boolean = false;

  /**
   * Virtual host
   * @private
   */
  private mode: AMQPMode = "DEV";

  /**
   * Client constructor
   * @param options
   */
  constructor(options: AMQPClientOptionsSpec) {
    this.url = options.url;
    this.queues = options.queues;
    this.mode = options.mode;
  }

  /**
   * Connects to the RabbitMQ
   */
  async connect(): Promise<boolean> {
    logger.info("AMQP: Start connection");
    this.connection = await amqp.connect(
      `${this.url}/${this.mode.toLowerCase()}`,
    );
    this.channel = await this.connection.createChannel();

    process.once("SIGINT", async () => {
      await this.channel!.close();
      await this.connection!.close();
      logger.error("AMQP: SIGINT");
      this.connected = false;
      return this.connected;
    });

    if (this.channel === null) {
      logger.error("AMQP: Channel not found");
      this.connected = false;
      return this.connected;
    }

    for await (const queue of this.queues) {
      logger.info(`AMQP: Create queue: ${queue}`);
      await this.channel.assertQueue(queue, { durable: false });
    }

    logger.info("AMQP: Connected");
    return true;
  }

  /**
   * Disconnects from RabbitMQ
   */
  async disconnect() {
    await this.channel!.close();
    await this.connection!.close();
    process.exit(1);
  }

  /**
   * Sends given message
   * @param queue
   * @param msg
   */
  send(queue: string, msg: object) {
    if (this.channel === null) {
      logger.error("AMQP: Channel not found");
      return;
    }

    const message = JSON.stringify(msg);

    logger.info(`AMQP: Send to queue ${queue}. Message: ${message}`);
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  /**
   * Installs a handler for the given queue messages
   * @param queue
   * @param handler
   */
  async subscribe(queue: string, handler: (msg: object) => Promise<any>) {
    if (this.channel === null) {
      logger.error("AMQP: Channel not found");
      return;
    }

    await this.channel.consume(
      queue,
      async (msg: amqp.ConsumeMessage | null) => {
        if (msg === null) {
          return;
        }

        await this.consume(msg, queue, handler);
      },
      { noAck: false },
    );
  }

  /**
   * Creates a handler for message consumption
   * @param msg
   * @param queue
   * @param handler
   */
  private async consume(
    msg: amqp.ConsumeMessage,
    queue: string,
    handler: (msg: object) => Promise<any>,
  ) {
    const content = msg.content.toString();
    logger.info(`AMQP: Consume from queue ${queue}. Message: ${content}`);
    await handler(JSON.parse(content));
    this.channel!.ack(msg);
  }
}
