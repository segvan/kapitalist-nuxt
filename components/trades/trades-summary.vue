<script setup lang="ts">
import {computed} from 'vue';

interface Props {
  invested: number;
  currentVal: number;
}

const props = defineProps<Props>();

const earnings = computed(() => props.currentVal - props.invested);
const difference = computed(() => props.invested > 0
    ? ((props.currentVal - props.invested) / props.invested) * 100
    : 0);
</script>

<template>
  <table class="table is-narrow">
    <thead>
    <tr>
      <th scope="col">Invested</th>
      <th scope="col">Current Value</th>
      <th scope="col">Earnings</th>
      <th scope="col">Difference</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td class="has-background-success has-text-white">
        {{ invested.toFixed(2) }}
      </td>
      <td
          :class="[
            'has-text-white',
            currentVal >= invested
              ? 'has-background-success'
              : 'has-background-danger'
          ]"
      >
        {{ currentVal.toFixed(2) }}
      </td>
      <td
          :class="[
            'has-text-white',
            earnings >= 0
              ? 'has-background-success'
              : 'has-background-danger'
          ]"
      >
        {{ earnings.toFixed(2) }}
      </td>
      <td
          :class="[
            'has-text-white',
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