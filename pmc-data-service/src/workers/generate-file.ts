import { amqp } from "../libs/amqp";
import { Queues } from "../libs/amqp/interfaces";
import logger from "../libs/logger";
import { isFileRequest } from "../utils/typeguards";
import { Input, stringify } from "csv-stringify/sync";
import { utils, write } from "xlsx";
import fs from "fs";
import { FileService } from "@services/file";
import { MarkerService } from "@services/marker";

const generateCsvFile = (array: Array<object>, fileName: string): string => {
  const output = stringify(array as Input, { header: true });

  const path = `./files/${fileName}`;

  fs.writeFile(path, output, "utf-8", async (err) => {
    if (err) throw new Error(err.message);
  });

  return path;
};

const generateXlsx = (array: Array<object>, fileName: string): string => {
  const workbook = utils.book_new();

  const pmcSheet = utils.json_to_sheet(array, {
    // header: ["ID", "Тип", "Дата/время", "ID ПМЦ", "Координаты точек объекта"],
  });

  utils.book_append_sheet(workbook, pmcSheet, "ПМЦ");

  const buffer = write(workbook, {
    type: "buffer",
    bookType: "xlsx",
    Props: { Author: "PMC Data Selector autogen" },
  });

  const path = `./files/${fileName}`;

  fs.writeFileSync(path, buffer);

  return path;
};

const generateFile = async (message: object) => {
  if (!isFileRequest(message)) {
    logger.error("File worker: invalid message type");
    return;
  }

  const file = await FileService.getById(message.fileId);
  const type = message.type;
  const pmcId = message.pmcId;

  if (!file) {
    logger.error("File worker: no file");
    return;
  }

  try {
    await FileService.update(file.id, { status: "running" });

    const markers = await MarkerService.getAll(pmcId);

    let filePath;

    const fileName = `${file.id}-${file.generationDate.toLocaleDateString("ru-RU")}.${type}`;

    if (type === "csv") {
      filePath = generateCsvFile(markers, fileName);
    }

    if (type === "xlsx") {
      filePath = generateXlsx(markers, fileName);
    }

    await FileService.update(file.id, {
      status: "done",
      path: filePath,
      name: fileName,
    });
  } catch (e) {
    logger.error(e);
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
