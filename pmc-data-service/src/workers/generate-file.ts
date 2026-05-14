import { amqp } from "../libs/amqp";
import { Queues } from "../libs/amqp/interfaces";
import logger from "../libs/logger";
import { isFileRequest } from "../utils/typeguards";
import { Input, stringify } from "csv-stringify/sync";
import { utils, write } from "xlsx";
import fs from "fs";
import { format } from "date-fns";
import { FileService } from "@services/file";
import { MarkerService } from "@services/marker";
import { PmcService } from "@services/pmc";
import { flatObject } from "../utils/flat-object";
import util from "util";

const generateCsvFile = (array: Array<object>, fileName: string): string => {
  const output = stringify(array as Input, {
    header: true,
  });

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

  try {
    const file = await FileService.getById(message.fileId);
    const type = message.type;
    const pmcId = message.pmcId;
    let pmcDate: Date | null = null;

    if (pmcId) {
      const pmc = await PmcService.getById(pmcId);

      pmcDate = pmc.dateTime;
    }

    if (!file) {
      logger.error("File worker: no file");
      return;
    }
    await FileService.update(file.id, { status: "running" });

    const markers = await MarkerService.getAll(pmcId);

    const flatenMarkers = markers
      .map((item) => flatObject(item))
      .map((item) => {
        const formatedItem = {
          ...item,
        };

        for (const i in formatedItem) {
          const key = i as keyof typeof formatedItem;
          if (util.types.isDate(formatedItem[key])) {
            formatedItem[key] = format(
              formatedItem[key],
              "yyyy-MM-dd_HH-mm",
            ) as never;
          }
        }

        return formatedItem;
      });

    let filePath;

    const fileDate = pmcDate
      ? `pmc_${format(pmcDate, "yyyy-MM-dd_HH-mm")}`
      : `mass_${format(file.generationDate, "yyyy-MM-dd_HH-mm")}`;

    const fileName = `${fileDate}-${file.id}.${type}`;

    if (type === "csv") {
      filePath = generateCsvFile(flatenMarkers, fileName);
    }

    if (type === "xlsx") {
      filePath = generateXlsx(flatenMarkers, fileName);
    }

    await FileService.update(file.id, {
      status: "done",
      path: filePath,
      name: fileName,
    });
  } catch (e) {
    logger.error(e);
    await FileService.update(message.fileId, { status: "error" });
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
