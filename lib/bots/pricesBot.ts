import {printError, round, runInBatches} from "../botsHelpers"
import {saveJobRunTime} from "../jobsHistoryRepository";
import {binanceClient} from "../clients/binanceClient";
import type {SpotRestAPI} from "@binance/spot";
import getSymbols from "../symbolsRepository";
import prisma from "~/lib/prisma";
import type {SymbolModel} from "~/lib/apiModels";

const cleanHistoryMinutes = 10;

const getPrices = async (symbols: SymbolModel[]): Promise<Price[]> => {
  const resp = await binanceClient.restAPI.ticker24hr({
    symbols: symbols.map(s => s.Code),
    type: "FULL" as SpotRestAPI.Ticker24hrTypeEnum
  });
  const data = await resp.data() as SpotRestAPI.Ticker24hrResponse2Inner[];

  return data.map((t) => {
    const symbol = symbols.find(s => s.Code === t.symbol) as SymbolModel;
    return ({
      Symbol: symbol.Id,
      Price: round(t.lastPrice!),
      PrevClosePrice: round(t.prevClosePrice!),
      PriceChangePercent: round(t.priceChangePercent!)
    });
  });
};

const savePrices = async (prices: Price[]): Promise<void> => {
  const now = new Date();
  const savePrice = async (x: Price) => {
    await prisma.assetPrices.upsert({
      where: {id: x.Symbol},
      update: {price: x.Price, prevClosePrice: x.PrevClosePrice, priceChangePercent: x.PriceChangePercent, timestamp: now},
      create: {id: x.Symbol, price: x.Price, prevClosePrice: x.PrevClosePrice, priceChangePercent: x.PriceChangePercent, timestamp: now}
    })
  };

  await runInBatches<Price>(prices, savePrice);

  await prisma.assetPrices.deleteMany({
    where: {
      timestamp: {lt: new Date(Date.now() - 1000 * 60 * cleanHistoryMinutes)}
    }
  });
}

export type Price = {
  Symbol: string;
  Price: number;
  PrevClosePrice: number;
  PriceChangePercent: number;
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
