import {printError, round, runInBatches} from "../botsHelpers"
import {saveJobRunTime} from "../jobsHistoryRepository";
import {binanceClient} from "../clients/binanceClient";
import type {SpotRestAPI} from "@binance/spot";
import getSymbols from "../symbolsRepository";
import * as telegramClient from "../clients/telegramClient";
import prisma from "~/lib/prisma";
import type {SymbolModel} from "~/lib/apiModels";

const differencePercent = 5;
const messageFrequencyHours = 24;

const getTickers = async (symbols: SymbolModel[]): Promise<Ticker[]> => {
  const resp = await binanceClient.restAPI.ticker24hr({
    symbols: symbols.map(s => s.Code),
    type: "FULL" as SpotRestAPI.Ticker24hrTypeEnum
  });
  const result = await resp.data() as SpotRestAPI.Ticker24hrResponse2Inner[];

  return result.map((x) => {
    const symbol = symbols.find(s => s.Code === x.symbol) as SymbolModel;
    return ({
      Symbol: symbol.Id,
      CloseTime: new Date(x.closeTime as number),
      LastPrice: round(x.lastPrice!),
      PriceChangePercent: round(x.priceChangePercent!)
    });
  });
};

const sendNotificationIfNeeded = async (ticker: Ticker, priceNotifications: PriceNotification[]): Promise<void> => {
  const now = new Date();
  const priceNotification = priceNotifications.find(x => x.id == ticker.Symbol);

  let nextNotification = priceNotification ? priceNotification.timestamp : ticker.CloseTime;

  if (Math.abs(ticker.PriceChangePercent) > differencePercent && nextNotification <= now) {
    const message = `Symbol: ${ticker.Symbol}\nDifference: ${ticker.PriceChangePercent}%\nCurrent price: ${ticker.LastPrice}$\n`;
    await telegramClient.sendMessage(message);

    nextNotification = new Date(now.getTime() + messageFrequencyHours * 60 * 60 * 1000);

    await prisma.priceNotifications.upsert({
      where: {id: ticker.Symbol},
      update: {timestamp: nextNotification},
      create: {id: ticker.Symbol, timestamp: nextNotification}
    });
  }
};

async function bot(): Promise<void> {
  const symbols = await getSymbols();
  const tickers = await getTickers(symbols);
  const priceNotifications = await prisma.priceNotifications.findMany();

  const sendNotifications = async (ticker: Ticker) => {
    await sendNotificationIfNeeded(ticker, priceNotifications);
  };

  await runInBatches<Ticker>(tickers, sendNotifications);

  await saveJobRunTime("PriceChangeBot");
}

export type PriceNotification = {
  id: string;
  timestamp: Date
};

export type Ticker = {
  Symbol: string;
  CloseTime: Date;
  LastPrice: number;
  PriceChangePercent: number
};

const run = async () => {
  await bot().catch(async (e) => {
    await printError("Prices Change Bot Exception", e);
  });
};

export {run};