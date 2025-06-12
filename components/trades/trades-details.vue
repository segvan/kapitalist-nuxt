<script setup lang="ts">
import {ref} from 'vue';
import type {TradesDataModel} from "~/components/trades/TradesDataModel";

interface Props {
  data: TradesDataModel[];
  invested: number;
}

const props = defineProps<Props>();

const visible = ref(false);

const columnToggle = computed(() => (visible.value ? 'column-visible' : 'column-hidden'));

function toggleVisibility() {
  visible.value = !visible.value;
}
</script>

<template>
  <div :class="visible ? 'is-overflow-y-hidden' : ''">
    <table
        class="table is-narrow is-hoverable is-striped"
        @click="toggleVisibility"
    >
      <thead>
      <tr>
        <th scope="col">Currency</th>
        <th :class="columnToggle" scope="col">%</th>
        <th :class="columnToggle" scope="col">Invested</th>
        <th :class="columnToggle" scope="col">Current Price</th>
        <th :class="columnToggle" scope="col">Average Price</th>
        <th :class="columnToggle" scope="col">Amount</th>
        <th scope="col">Current Value</th>
        <th scope="col">Earnings</th>
        <th scope="col">Difference</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="trade in props.data" :key="trade.Symbol">
        <td>{{ trade.Symbol }}</td>
        <td :class="columnToggle">
          {{ ((trade.QuoteQty / props.invested) * 100).toFixed(2) }}
        </td>
        <td :class="columnToggle">{{ trade.QuoteQty.toFixed(2) }}</td>
        <td :class="columnToggle">{{ trade.CurrentPrice.toFixed(2) }}</td>
        <td :class="columnToggle">{{ trade.AvgPrice.toFixed(2) }}</td>
        <td :class="columnToggle">{{ trade.Qty }}</td>
        <td
            :class="[
              'has-text-white',
              trade.CurrentTotalAmount >= trade.QuoteQty
                ? 'has-background-success'
                : 'has-background-danger'
            ]"
        >
          {{ trade.CurrentTotalAmount.toFixed(2) }}
        </td>
        <td
            :class="[
              'has-text-white',
              trade.TotalEarnings >= 0
                ? 'has-background-success'
                : 'has-background-danger'
            ]"
        >
          {{ trade.TotalEarnings.toFixed(2) }}
        </td>
        <td
            :class="[
              'has-text-white',
              trade.TotalDifference >= 0
                ? 'has-background-success'
                : 'has-background-danger'
            ]"
        >
          {{ trade.TotalDifference.toFixed(2) }} %
        </td>
      </tr>
      </tbody>
    </table>
  </div>
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