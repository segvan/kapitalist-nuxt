<script setup lang="ts">
import type {TradesDataModel} from "~/components/trades/TradesDataModel";
import type {AssetPriceModel, TradesAggregateModel} from "~/lib/apiModels";
import TradesSummary from "~/components/trades/trades-summary.vue";

const {data: tradesData, status: tradesStatus, error: tradesError} =
    await useApi<TradesAggregateModel[]>('/api/trades-aggregates');

const {data: prices, status: pricesStatus, error: pricesError} =
    await useApi<AssetPriceModel[]>('/api/asset-prices');

if (tradesError.value?.statusCode === 401
    || pricesError.value?.statusCode === 401) {
  navigateTo('/login');
}

const data = ref<TradesDataModel[]>([]);
const invested = ref(0);
const currentVal = ref(0);
const realizedGains = ref(0);

watchEffect(async () => {
  if (tradesData.value && prices.value) {
    data.value = await LoadData(tradesData.value, prices.value);

    invested.value = 0;
    currentVal.value = 0;
    realizedGains.value = 0;
    for (const item of data.value) {
      invested.value += item.EffectiveCostBasis;
      currentVal.value += item.CurrentTotalAmount;
      realizedGains.value += item.RealizedGain;
    }
  }
});

async function LoadData(tradesData: TradesAggregateModel[], prices: AssetPriceModel[]): Promise<TradesDataModel[]> {
  return tradesData
      ? tradesData.map((trade: TradesAggregateModel) => {
        const currentPrice = prices?.find((price: AssetPriceModel) => price.id === trade.symbol)?.price || 0;
        const currentTotalAmount = currentPrice * trade.qty;
        const effectiveCostBasis = Math.max(0, trade.quoteQty);
        const realizedGain = Math.max(0, -trade.quoteQty);
        const totalEarnings = currentTotalAmount - trade.quoteQty;
        const totalDifference = effectiveCostBasis > 0
            ? (totalEarnings / effectiveCostBasis) * 100
            : (realizedGain > 0 ? Infinity : 0);
        return {
          Symbol: trade.symbol,
          Qty: trade.qty,
          QuoteQty: trade.quoteQty,
          EffectiveCostBasis: effectiveCostBasis,
          RealizedGain: realizedGain,
          AvgPrice: trade.avgPrice,
          CurrentPrice: currentPrice,
          CurrentTotalAmount: currentTotalAmount,
          TotalDifference: totalDifference,
          TotalEarnings: totalEarnings,
          IsRecouped: trade.quoteQty <= 0,
        };
      })
          .sort((a: TradesDataModel, b: TradesDataModel) => b.EffectiveCostBasis - a.EffectiveCostBasis)
      : [];
}
</script>

<template>
  <div class="columns is-desktop is-multiline">
    <div class="column is-10 is-offset-1 block">
      <p class="subtitle">Summary</p>
      <app-external-data-loader
          :condition="tradesStatus==='pending' || pricesStatus==='pending'" :number-of-lines="4"
          :lines-width="30"
          :error-message="tradesError?.data?.message || pricesError?.data?.message">
        <TradesSummary :invested="invested" :current-val="currentVal" :realized-gains="realizedGains"/>
      </app-external-data-loader>
    </div>
    <div class="column is-10 is-offset-1 block">
      <p class="subtitle">Details</p>
      <app-external-data-loader
          :condition="tradesStatus==='pending' || pricesStatus==='pending'"
          :number-of-lines="6"
          :error-message="tradesError?.data?.message || pricesError?.data?.message">
        <trades-details :invested="invested" :data="data"/>
      </app-external-data-loader>
    </div>
  </div>
</template>
