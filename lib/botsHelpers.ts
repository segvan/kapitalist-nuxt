import fs from "fs";
import util from "util";
import * as telegramClient from "./clients/telegramClient";
import type {Decimal} from "@prisma/client/runtime/library";

const round = (value: string): number => parseFloat(parseFloat(value).toFixed(5));

const roundDecimal = (value: Decimal | null): number => parseFloat(value?.toNumber().toFixed(5) ?? "0");

const roundNumber = (value: number): number => parseFloat(value.toFixed(5));

console.log = function (d): void {
  const timestamp = new Date().toISOString();
  const message = `${timestamp}: ${util.format(d)}\n`;

  process.stdout.write(message);

  const filePath = "./app.log";
  const maxFileSize = 1024 * 1024 * 10; // 10 MB

  let currentSize = 0;
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    currentSize = stats.size;
  }

  let log_file;
  if (currentSize > maxFileSize) {
    log_file = fs.createWriteStream(filePath, {flags: "w"});
  } else {
    log_file = fs.createWriteStream(filePath, {flags: "a"});
  }

  log_file.write(message);
};

const printError = async (message: string, exception: unknown): Promise<void> => {
  const errorMessage = `${message}: ${exception}`;
  console.log(errorMessage);
  console.log(exception);
  await telegramClient.sendMessage(errorMessage);
};

async function runInBatches<T>(collection: T[], callback: (arg: T) => Promise<void>): Promise<void> {
  const collectionCopy = collection.slice();
  while (collectionCopy.length) {
    const tasks = collectionCopy
      .splice(0, 10)
      .map(async (entry) => {
        await callback(entry)
      });

    await Promise.all(tasks);
  }
}

export {printError, round, roundDecimal, roundNumber, runInBatches};
