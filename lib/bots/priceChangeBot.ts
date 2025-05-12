import {printError, round} from "../botsHelpers"
import {saveJobRunTime} from "../jobsHistoryRepository";
import {binanceClient} from "../clients/binanceClient";
import type {RestMarketTypes} from "@binance/connector-typescript";
import getSymbols from "../symbolsRepository";
import * as telegramClient from "../clients/telegramClient";
import prisma from "~/lib/prisma";
import type {SymbolModel} from "~/lib/apiModels";

const differencePercent = 5;
const messageFrequencyHours = 24;

const getTickers = async (symbols: SymbolModel[]): Promise<Ticker[]> => {
  const tasks = symbols.map((symbol) => {
    return binanceClient.ticker24hr({symbol: symbol.Code, type: "FULL"});
  });

  const result = await Promise.all(tasks);

  return result
    .map(x => x as RestMarketTypes.ticker24hrResponse)
    .map((x) => {
      const symbol = symbols.find(s => s.Code === x.symbol) as SymbolModel;
      return ({
        Symbol: symbol.Id,
        CloseTime: new Date(x.closeTime),
        LastPrice: round(x.lastPrice),
        PriceChangePercent: round(x.priceChangePercent)
      });
    });
};

const sendNotificationIfNeeded = async (ticker: Ticker): Promise<void> => {
  const now = new Date();
  const priceNotification = await prisma.priceNotifications.findFirst(
    {where: {id: ticker.Symbol}});

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

  const tasks = tickers.map((ticker) => sendNotificationIfNeeded(ticker));
  await Promise.all(tasks);

  await saveJobRunTime("PriceChangeBot");
}

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