<script setup lang="ts">
import Aggregate from "~/components/trades/aggregate.vue";

definePageMeta({
  middleware: ['auth',]
});
</script>

<template>
  <section class="section is-fullheight-100vh">
    <div class="container is-max-desktop">
      <Aggregate />
    </div>
  </section>
</template>
