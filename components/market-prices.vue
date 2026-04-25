<script setup lang="ts">
import {useApi} from "~/composables/useApi";
import type {AssetPriceModel} from "~/lib/apiModels";

const {data: prices, status, error} = await useApi<AssetPriceModel[]>('/api/asset-prices');

const sortedPrices = computed(() => [...(prices.value ?? [])].sort((a, b) => b.price - a.price));

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 });
}

function formatPercent(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}
</script>

<template>
  <app-external-data-loader :condition="status==='pending'" :number-of-lines="8" :lines-width="30" :error-message="error?.data?.message">
    <div class="table-container">
      <table class="table is-fullwidth is-narrow is-hoverable market-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th class="has-text-right">Price</th>
            <th class="has-text-right">Change %</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedPrices" :key="item.id">
            <td>
              <strong>{{ item.id }}</strong>
            </td>
            <td class="has-text-right is-family-monospace">${{ formatPrice(item.price) }}</td>
            <td
              class="has-text-right is-family-monospace"
              :class="item.priceChangePercent >= 0 ? 'has-text-success' : 'has-text-danger'"
            >{{ formatPercent(item.priceChangePercent) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </app-external-data-loader>
</template>

<style scoped>
.market-table th {
  white-space: nowrap;
}
</style>
