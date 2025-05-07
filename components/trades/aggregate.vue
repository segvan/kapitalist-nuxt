<script setup lang="ts">
import type {TradesDataModel} from "~/components/trades/TradesDataModel";
import type {AssetPriceModel, TradesAggregateModel} from "~/lib/apiModels";
import TradesSummary from "~/components/trades/trades-summary.vue";

const {data: tradesData} = await useFetch('/api/trades-aggregates', {
  lazy: true,
  headers: useRequestHeaders(['cookie']),
});

const {data: prices} = await useFetch('/api/asset-prices', {
  lazy: true,
  headers: useRequestHeaders(['cookie']),
});

const data = await LoadData(tradesData.value as TradesAggregateModel[] | null, prices.value as AssetPriceModel[] | null);

let invested = 0;
let currentVal = 0;
for (const item of data) {
  invested += item.QuoteQty;
  currentVal += item.CurrentTotalAmount;
}

async function LoadData(tradesData: TradesAggregateModel[] | null, prices: AssetPriceModel[] | null): Promise<TradesDataModel[]> {
  return tradesData
      ? tradesData.map((trade: TradesAggregateModel) => {
        const currentPrice = prices?.find((price: AssetPriceModel) => price.id === trade.symbol)?.price || 0;
        const currentTotalAmount = currentPrice * trade.qty;
        const totalDifference = trade.quoteQty !== 0
            ? ((currentTotalAmount - trade.quoteQty) / trade.quoteQty) * 100
            : 0;
        const totalEarnings = currentTotalAmount - trade.quoteQty;
        return {
          Symbol: trade.symbol,
          Qty: trade.qty,
          QuoteQty: trade.quoteQty,
          AvgPrice: trade.avgPrice,
          CurrentPrice: currentPrice,
          CurrentTotalAmount: currentTotalAmount,
          TotalDifference: totalDifference,
          TotalEarnings: totalEarnings,
        };
      })
          .sort((a: TradesDataModel, b: TradesDataModel) => b.QuoteQty - a.QuoteQty)
      : [];
}
</script>

<template>
  <div class="columns is-desktop is-multiline">
    <div class="column is-10 is-offset-1 block">
      <p class="subtitle">Summary</p>
      <TradesSummary :invested="invested" :current-val="currentVal"/>
    </div>
    <div class="column is-10 is-offset-1 block">
      <p class="subtitle">Details</p>
      <trades-details :invested="invested" :data="data"/>
    </div>
  </div>
</template>