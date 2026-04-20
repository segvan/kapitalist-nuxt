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
        <th :class="columnToggle" scope="col">Amount</th>
        <th :class="columnToggle" scope="col">Invested</th>
        <th :class="columnToggle" scope="col">Current Price</th>
        <th :class="columnToggle" scope="col">Average Price</th>
        <th scope="col">Current Value</th>
        <th scope="col">Earnings</th>
        <th scope="col">Difference</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="trade in props.data" :key="trade.Symbol">
        <!--Currency-->
        <td>{{ trade.Symbol }}</td>
        <!--%-->
        <td :class="columnToggle">
          {{ props.invested > 0 ? ((trade.Invested / props.invested) * 100).toFixed(2) : '-' }}
        </td>
        <!--Amount-->
        <td :class="columnToggle">{{ trade.Qty }}</td>
        <!--Invested-->
        <td :class="columnToggle">{{ trade.Invested.toFixed(2) }}</td>
        <!--Current Price-->
        <td :class="columnToggle">{{ trade.CurrentPrice.toFixed(2) }}</td>
        <!--Average Price-->
        <td
            :class="[columnToggle, trade.Qty > 0 ? 'has-text-white' : '',
              trade.Qty > 0
                ? trade.CurrentPrice >= trade.AvgPrice
                  ? 'has-background-success'
                  : 'has-background-danger'
                : ''
            ]"
        >
          {{ trade.IsRecouped ? '-' : trade.AvgPrice.toFixed(2) }}
        </td>
        <!--Current Value-->
        <td
            :class="['has-text-white',
              trade.CurrentValue >= trade.Invested
                ? 'has-background-success'
                : 'has-background-danger'
            ]"
        >
          {{ trade.CurrentValue.toFixed(2) }}
        </td>
        <!--Earnings-->
        <td
            :class="['has-text-white',
              trade.Earnings >= 0
                ? 'has-background-success'
                : 'has-background-danger'
            ]"
        >
          {{ trade.Earnings.toFixed(2) }}
        </td>
        <!--Difference-->
        <td
            :class="['has-text-white',
              trade.Difference >= 0
                ? 'has-background-success'
                : 'has-background-danger'
            ]"
        >
          {{ trade.IsRecouped ? '-' : trade.Difference.toFixed(2) + ' %' }}
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
