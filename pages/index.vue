<script setup lang="ts">
import Aggregate from "~/components/trades/aggregate.vue";

definePageMeta({
  middleware: ['auth',]
});
</script>

<template>
  <section class="section px-2 pb-6 is-fullheight-100vh">
    <div class="container">
      <Aggregate />
    </div>
  </section>
</template>
