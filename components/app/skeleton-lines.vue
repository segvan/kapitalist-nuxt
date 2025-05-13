<script setup lang="ts">
interface Props {
  condition: boolean;
  numberOfLines: number;
  linesWidth?: number;
}

const props = defineProps<Props>();
</script>

<template>
  <div
      v-if="props.condition"
      :style="{ width: (props.linesWidth ?? 100) + '%' }"
      class="skeleton-lines">
    <div v-for="(_, index) in Array.from({ length: props.numberOfLines })" :key="index"/>
  </div>
  <slot v-else />
</template>
