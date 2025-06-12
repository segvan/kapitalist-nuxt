<script setup lang="ts">
interface Props {
  condition: boolean;
  numberOfLines: number;
  linesWidth?: number;
  errorMessage?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
      v-if="props.condition"
      :style="{ width: (props.linesWidth ?? 100) + '%' }"
      class="skeleton-lines">
    <div v-for="(index) in props.numberOfLines" :key="index"/>
  </div>
  <div v-else-if="!!props.errorMessage" class="notification is-danger is-light">
    {{ props.errorMessage}}
  </div>
  <slot v-else />
</template>
