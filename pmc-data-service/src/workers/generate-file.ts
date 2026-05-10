import { amqp } from "../libs/amqp";
import { Queues } from "../libs/amqp/interfaces";
import logger from "../libs/logger";
import { isFileRequest } from "../utils/typeguards";
import { Input, stringify } from "csv-stringify/sync";
import * as XLSX from 'xlsx';
import fs from "fs";
import { FileService } from "@services/file";
import { MarkerService } from "@services/marker";


XLSX.set_fs(fs);

const generateCsvFile = (array: Array<object>, fileName: string): string => {
   const output = stringify(array as Input, { header: true });

    const path = `./files/${fileName}.csv`;

     fs.writeFile(path, output, "utf-8", async (err) => {
      if (err) throw new Error(err.message);
    });

    return path;
}

const generateXlsx = (array: Array<object>, fileName: string): string => {
  const workbook = XLSX.utils.book_new();

  // Преобразование массива данных в рабочий лист
  const employeeSheet = XLSX.utils.json_to_sheet(array);
  XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employees');

  // Генерация буфера
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  const path = `./files/${fileName}.xlsx`;

  fs.writeFileSync(path, buffer);

  return path;

}

const generateFile = async (message: object) => {
  if (!isFileRequest(message)) {
    logger.error("File worker: invalid message type");
    return;
  }

  const file = await FileService.getById(message.fileId);
  const type = message.type;

  if (!file) {
    logger.error("File worker: no file");
    return;
  }

  try {
    await FileService.update(file.id, { status: "running" });

    const markers = await MarkerService.getAll();

    let filePath;

    if(type === 'csv') {
      filePath = generateCsvFile(markers, file.generationDate.toLocaleDateString("ru-RU"))
    }

    if(type === 'xlsx') {
      filePath = generateXlsx(markers, file.generationDate.toLocaleDateString("ru-RU"))
    }

    await FileService.update(file.id, { status: "done", path: filePath });
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
