<script setup lang="ts">
import type {WalletModel} from "~/lib/apiModels";

const {data: wallet, status, error} = await useApi<WalletModel>('/api/wallet');

if (error.value?.statusCode === 401) {
  navigateTo('/login');
}

const visible = ref(false);
const columnToggle = computed(() => visible.value ? 'column-visible' : 'column-hidden');

const fmt = (val: number, decimals = 2) =>
  val.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

const fmtQty = (val: number) => {
  if (val >= 1000) return fmt(val, 2);
  if (val >= 1) return fmt(val, 4);
  return fmt(val, 8);
};

const pnlClass = (val: number) => val >= 0 ? 'has-text-success' : 'has-text-danger';
const pnlSign = (val: number) => val >= 0 ? '+' : '';

const sortedAssets = computed(() => [...(wallet.value?.assets ?? [])].sort((a, b) => b.value - a.value));
</script>

<template>
  <app-external-data-loader
    :condition="status === 'pending'"
    :number-of-lines="8"
    :lines-width="60"
    :error-message="error?.data?.message"
  >
    <template v-if="wallet">
      <div class="box mb-5">
        <p class="is-size-7 has-text-grey mb-1">Est. Total Value</p>
        <p class="is-size-2 has-text-weight-bold">${{ fmt(wallet.totalValue) }}</p>
        <p class="is-size-6 mt-1">
          Today's PNL:&nbsp;
          <span :class="pnlClass(wallet.dailyPnl)">
            {{ pnlSign(wallet.dailyPnl) }}${{ fmt(Math.abs(wallet.dailyPnl)) }}
            ({{ pnlSign(wallet.dailyPnlPct) }}{{ fmt(wallet.dailyPnlPct) }}%)
          </span>
        </p>
      </div>

      <div class="table-container">
        <table class="table is-fullwidth is-narrow is-hoverable" @click="visible = !visible">
          <thead>
            <tr style="white-space: nowrap">
              <th>Asset</th>
              <th :class="['has-text-right', columnToggle]">Amount</th>
              <th class="has-text-right">Value</th>
              <th class="has-text-right">Today's PNL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in sortedAssets" :key="asset.symbol">
              <td><strong>{{ asset.symbol }}</strong></td>
              <td :class="['has-text-right', 'is-family-monospace', columnToggle]">{{ fmtQty(asset.qty) }}</td>
              <td class="has-text-right">${{ fmt(asset.value) }}</td>
              <td class="has-text-right" :class="pnlClass(asset.dailyPnl)">
                {{ pnlSign(asset.dailyPnl) }}${{ fmt(Math.abs(asset.dailyPnl)) }}
                <span class="is-size-7">({{ pnlSign(asset.dailyPnlPct) }}{{ fmt(asset.dailyPnlPct) }}%)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </app-external-data-loader>
</template>

<style scoped>
@media screen and (max-width: 768px) {
  .column-visible {
    visibility: visible;
    opacity: 1;
    transition: all 0.5s ease-in-out;
  }

  .column-hidden {
    visibility: collapse;
    width: 0;
    opacity: 0;
    font-size: 0;
    padding: 0;
    margin: 0;
    border: 0;
    transition: all 0.5s ease-in-out;
  }
}
</style>