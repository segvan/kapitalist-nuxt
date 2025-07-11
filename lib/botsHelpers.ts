import * as telegramClient from "./clients/telegramClient";

const round = (value: string): number => parseFloat(parseFloat(value).toFixed(5));

const roundDecimal = (value: Decimal | null): number => parseFloat(value?.toNumber().toFixed(5) ?? "0");

const roundNumber = (value: number): number => parseFloat(value.toFixed(5));

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
      .splice(0, 16)
      .map(async (entry) => {
        await callback(entry)
      });

    await Promise.all(tasks);
  }
}

interface Decimal {
  toNumber(): number;
}

export {printError, round, roundDecimal, roundNumber, runInBatches};
