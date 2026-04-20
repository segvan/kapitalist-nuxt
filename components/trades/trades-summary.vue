<script setup lang="ts">
import {computed} from 'vue';

interface Props {
  invested: number;
  currentVal: number;
  realizedProfit: number;
}

const props = defineProps<Props>();
const unrealizedProfit = computed(() => props.currentVal - props.invested);
const total = computed(() => props.currentVal + props.realizedProfit);
const difference = computed(() => props.invested > 0
    ? ((total.value - props.invested) / props.invested) * 100
    : 0);
</script>

<template>
  <table class="table is-narrow">
    <thead>
    <tr>
      <th scope="col">Invested</th>
      <th scope="col">Current Value</th>
      <th scope="col">Unrealized Profit</th>
      <th scope="col">Realized Profit</th>
      <th scope="col">Total Value</th>
      <th scope="col">Difference</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <!--Invested-->
      <td class="has-background-success has-text-white">
        {{ props.invested.toFixed(2) }}
      </td>
      <!--Current Value-->
      <td
          :class="['has-text-white',
            props.currentVal >= props.invested
              ? 'has-background-success'
              : 'has-background-danger'
          ]"
      >
        {{ props.currentVal.toFixed(2) }}
      </td>
      <!--Unrealized Profit-->
      <td
          :class="['has-text-white',
            unrealizedProfit >= 0
              ? 'has-background-success'
              : 'has-background-danger'
          ]"
      >
        {{ unrealizedProfit.toFixed(2) }}
      </td>
      <!--Realized Profit-->
      <td
          :class="['has-text-white',
            props.realizedProfit >= 0
              ? 'has-background-success'
              : 'has-background-danger'
          ]"
      >
        {{ props.realizedProfit.toFixed(2) }}
      </td>
      <!--Total Value-->
      <td
          :class="['has-text-white',
            total >= props.invested
              ? 'has-background-success'
              : 'has-background-danger'
          ]"
      >
        {{ total.toFixed(2) }}
      </td>
      <!--Difference-->
      <td
          :class="['has-text-white',
            difference >= 0
              ? 'has-background-success'
              : 'has-background-danger'
          ]"
      >
        {{ difference.toFixed(2) }} %
      </td>
    </tr>
    </tbody>
  </table>
</template>