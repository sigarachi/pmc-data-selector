import { amqp } from "../libs/amqp";
import { Queues } from "../libs/amqp/interfaces";
import logger from "../libs/logger";
import { isFileRequest } from "../utils/typeguards";
import { Input, stringify } from "csv-stringify/sync";
import fs from "fs";
import { FileService } from "@services/file";
import { MarkerService } from "@services/marker";

const generateFile = async (message: object) => {
  if (!isFileRequest(message)) {
    logger.error("File worker: invalid message type");
    return;
  }

  const file = await FileService.getById(message.fileId);

  if (!file) {
    logger.error("File worker: no file");
    return;
  }

  try {
    await FileService.update(file.id, { status: "running" });

    const markers = await MarkerService.getAll();
    const output = stringify(markers as Input, { header: true });

    const path = `./files/${file.generationDate.toLocaleDateString("ru-RU")}.csv`;

    fs.writeFile(path, output, "utf-8", async (err) => {
      if (err) throw new Error(err.message);
    });

    await FileService.update(file.id, { status: "done", path });
  } catch (e) {
    await FileService.update(file.id, { status: "error" });
  }
};

const start = async () => {
  try {
    const amqpConnected = await amqp.connect();
    if (!amqpConnected) {
      throw new Error("File worker: AMQP connection failed");
    }

    amqp.subscribe(Queues.GenerateFileTask, generateFile);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
