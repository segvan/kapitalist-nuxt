import {printError, round, roundDecimal, roundNumber, runInBatches} from "../botsHelpers"
import {saveJobRunTime} from "../jobsHistoryRepository";
import {binanceClient} from "../clients/binanceClient";
import getSymbols from "../symbolsRepository";
import * as telegramClient from "../clients/telegramClient";
import prisma from "~/lib/prisma";
import type {SymbolModel} from "~/lib/apiModels";
import type {SpotRestAPI} from "@binance/spot";

const getBeginDates = async (): Promise<Record<string, Date>> => {
  const dates = await prisma.trades.groupBy(
    {
      by: ["symbol"],
      _max: {timestamp: true},
    }
  );

  return Object.fromEntries(dates
    .map(item => [item.symbol, item._max.timestamp ?? new Date(0)]));
}

const getMyTrades = async (beginDates: Record<string, Date>, symbols: SymbolModel[]): Promise<Trade[]> => {
  const limit = 1000;

  const tasks = symbols.map(async (asset) => {
    const beginDate = beginDates[asset.Id];
    const startTime = beginDate ? beginDate.getTime() + 1 : undefined;
    const allTrades: SpotRestAPI.MyTradesResponseInner[] = [];
    let fromId: number | undefined = beginDate ? undefined : 0;

    try {
      while (true) {
        const resp = await binanceClient.restAPI.myTrades({
          symbol: asset.Code,
          ...(fromId !== undefined ? {fromId} : {startTime}),
          limit,
          recvWindow: 50000
        });
        const page = await resp.data();
        allTrades.push(...page);
        if (page.length < limit) break;
        fromId = (page.at(-1)!.id as number) + 1;
      }
      return {asset: asset.Id, assetTrades: allTrades};
    } catch (e: unknown) {
      if (e !== "Invalid symbol.") {
        await printError("Trade History Bot Exception", e);
      }

      return {asset: asset.Id, assetTrades: []};
    }
  });

  const trades = await Promise.all(tasks);

  return trades.flatMap((trade) => {
    return trade.assetTrades.map((assetTrade) => {
      return {
        Id: assetTrade.id as number,
        Symbol: trade.asset,
        Time: new Date(assetTrade.time as number),
        IsBuyer: assetTrade.isBuyer!,
        Qty: round(assetTrade.qty!),
        QuoteQty: round(assetTrade.quoteQty!),
        Price: round(assetTrade.price!),
      };
    });
  });
};

const saveNewTrades = async (newHistory: Trade[]): Promise<void> => {
  const saveTrade = async (entry: Trade) => {
    await prisma.trades.upsert({
      where: {id: entry.Id},
      create: {
        id: entry.Id,
        symbol: entry.Symbol,
        timestamp: entry.Time,
        qty: entry.Qty * (entry.IsBuyer ? 1 : -1),
        quoteQty: entry.QuoteQty * (entry.IsBuyer ? 1 : -1),
        price: entry.Price,
      },
      update: {
        symbol: entry.Symbol,
        timestamp: entry.Time,
        qty: entry.Qty * (entry.IsBuyer ? 1 : -1),
        quoteQty: entry.QuoteQty * (entry.IsBuyer ? 1 : -1),
        price: entry.Price,
      }
    });
  };

  await runInBatches<Trade>(newHistory, saveTrade);
}

const sendTradesDetails = async (newHistory: Trade[]) => {
  for (const entry of newHistory) {
    await telegramClient.sendMessage(
      `${entry.Symbol} ${entry.IsBuyer ? "BUY" : "SELL"} ${entry.Qty} at ${
        entry.Price
      }`
    );
  }
};

const saveHistoryAggr = async (newHistory: Trade[]): Promise<void> => {
  const uniqueSymbols = [...new Set(newHistory.map(x => x.Symbol))]

  if (uniqueSymbols.length === 0) {
    return;
  }

  const tradesAggr = (await prisma.trades.groupBy(
    {
      by: ["symbol"],
      where: { symbol: { in: uniqueSymbols } },
      _sum: {qty: true, quoteQty: true},
    }
  )).map((t) => {
    return {
      symbol: t.symbol,
      qty: roundDecimal(t._sum.qty),
      quoteQty: roundDecimal(t._sum.quoteQty)
    };
  });

  const now = new Date();
  const saveTradeAggr = async (entry: TradeAggr) => {
    await prisma.tradesAggr.upsert({
      where: {symbol: entry.symbol},
      create: {
        symbol: entry.symbol,
        qty: entry.qty,
        quoteQty: entry.quoteQty,
        avgPrice: entry.qty == 0 ? 0 : roundNumber(entry.quoteQty / entry.qty),
        timestamp: now
      },
      update: {
        qty: entry.qty,
        quoteQty: entry.quoteQty,
        avgPrice: entry.qty == 0 ? 0 : roundNumber(entry.quoteQty / entry.qty),
        timestamp: now
      }
    });
  };

  await runInBatches<TradeAggr>(tradesAggr, saveTradeAggr);
};

type Trade = {
  Id: number;
  Symbol: string;
  Time: Date;
  IsBuyer: boolean;
  Qty: number;
  QuoteQty: number;
  Price: number;
}

type TradeAggr = {
  symbol: string;
  qty: number;
  quoteQty: number;
}

async function bot(): Promise<void> {
  const symbols = await getSymbols(false);
  const beginDates = await getBeginDates();

  const newHistory = await getMyTrades(beginDates, symbols);

  if (newHistory.length > 0) {
    await saveNewTrades(newHistory);

    await saveHistoryAggr(newHistory);

    await telegramClient.sendMessage(`Registered ${newHistory.length} new trades.`);
    setTimeout(async () => {
      await sendTradesDetails(newHistory);
    }, 1000);
  }

  await saveJobRunTime("TradeHistoryBot");
}

const run = async () => {
  await bot().catch(async (e) => {
    await printError("Trade History Bot Exception", e);
  });
};

export {run};
