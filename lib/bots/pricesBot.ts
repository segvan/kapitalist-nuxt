import {printError, round} from "../botsHelpers"
import {saveJobRunTime} from "../jobsHistoryRepository";
import {binanceClient} from "../clients/binanceClient";
import type {RestMarketTypes} from "@binance/connector-typescript";
import getSymbols from "../symbolsRepository";
import prisma from "~/lib/prisma";
import type {SymbolModel} from "~/lib/apiModels";

const cleanHistoryMinutes = 10;

const getPrices = async (symbols: SymbolModel[]): Promise<Price[]> => {
  const response = await binanceClient.symbolPriceTicker();

  return (response as RestMarketTypes.symbolPriceTickerResponse[])
    .filter((t) => symbols.some(s => s.Code === t.symbol))
    .map((t) => {
      const symbol = symbols.find(s => s.Code === t.symbol) as SymbolModel;
      return ({Symbol: symbol.Id, Price: round(t.price)});
    });
};

const savePrices = async (prices: Price[]): Promise<void> => {
  const now = new Date();
  const tasks = prices.map(x =>
    prisma.assetPrices.upsert({
      where: {id: x.Symbol},
      update: {price: x.Price, timestamp: now},
      create: {id: x.Symbol, price: x.Price, timestamp: now}
    }));

  await Promise.all(tasks);

  await prisma.assetPrices.deleteMany({
    where: {
      timestamp: {lt: new Date(Date.now() - 1000 * 60 * cleanHistoryMinutes)}
    }
  });
}

export type Price = {
  Symbol: string;
  Price: number;
};

const bot = async (): Promise<void> => {
  const symbols = await getSymbols();
  const prices = await getPrices(symbols);

  await savePrices(prices);

  await saveJobRunTime("PricesBot");
}

const run = async () => {
  await bot().catch(async (e) => {
    await printError("Prices Bot Exception", e);
  });
};

export {run};
