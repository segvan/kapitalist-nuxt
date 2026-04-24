import {printError, runInBatches} from "../botsHelpers";
import {saveJobRunTime} from "../jobsHistoryRepository";
import {binanceClient, simpleEarnClient} from "../clients/binanceClient";
import type {SimpleEarnRestAPI} from "@binance/simple-earn";
import prisma from "~/lib/prisma";

type Balance = { asset: string; qty: number };

const fetchSpotBalances = async (): Promise<Balance[]> => {
  const data = await (await binanceClient.restAPI.getAccount({omitZeroBalances: true})).data();
  return data.balances!.map(b => ({
    asset: b.asset!,
    qty: parseFloat(b.free!) + parseFloat(b.locked!),
  }));
};

const fetchAllPages = async <T>(
  fetcher: (current: number) => Promise<{ rows?: T[]; total?: number | bigint }>
): Promise<T[]> => {
  const size = 100;
  const all: T[] = [];
  let current = 1;
  while (true) {
    const resp = await fetcher(current);
    const rows = resp.rows ?? [];
    all.push(...rows);
    if (all.length >= Number(resp.total ?? 0) || rows.length < size) break;
    current++;
  }
  return all;
};

const fetchEarnBalances = async (): Promise<Balance[]> => {
  const [flexRows, lockedRows] = await Promise.all([
    fetchAllPages<SimpleEarnRestAPI.GetFlexibleProductPositionResponseRowsInner>(
      (current) => simpleEarnClient.restAPI.getFlexibleProductPosition({current, size: 100}).then(r => r.data())
    ),
    fetchAllPages<SimpleEarnRestAPI.GetLockedProductPositionResponseRowsInner>(
      (current) => simpleEarnClient.restAPI.getLockedProductPosition({current, size: 100}).then(r => r.data())
    ),
  ]);

  const map = new Map<string, number>();

  for (const row of flexRows) {
    if (!row.asset || !row.totalAmount) continue;
    const qty = parseFloat(row.totalAmount);
    if (qty > 0) map.set(row.asset, (map.get(row.asset) ?? 0) + qty);
  }

  for (const row of lockedRows) {
    if (!row.asset || !row.amount) continue;
    const qty = parseFloat(row.amount);
    if (qty > 0) map.set(row.asset, (map.get(row.asset) ?? 0) + qty);
  }

  return Array.from(map.entries()).map(([asset, qty]) => ({asset, qty}));
};

const mergeBalances = (spot: Balance[], earn: Balance[]): Balance[] => {
  const map = new Map<string, number>(spot.map(b => [b.asset, b.qty]));
  for (const b of earn) {
    map.set(b.asset, (map.get(b.asset) ?? 0) + b.qty);
  }
  return Array.from(map.entries()).map(([asset, qty]) => ({asset, qty}));
};

const bot = async (): Promise<void> => {
  const [spotBalances, earnBalances] = await Promise.all([
    fetchSpotBalances(),
    fetchEarnBalances(),
  ]);

  const balances = mergeBalances(spotBalances, earnBalances);
  const now = new Date();

  await runInBatches(balances, async (b) => {
    await prisma.walletBalance.upsert({
      where: {symbol: b.asset},
      update: {qty: b.qty, timestamp: now},
      create: {symbol: b.asset, qty: b.qty, timestamp: now}
    });
  });

  const activeSymbols = balances.map(b => b.asset);
  await prisma.walletBalance.deleteMany({where: {symbol: {notIn: activeSymbols}}});

  await saveJobRunTime("WalletBot", "Wallet Bot");
};

const run = async () => {
  await bot().catch(async (e) => {
    await printError("Wallet Bot Exception", e);
  });
};

export {run};
