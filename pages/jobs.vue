<script setup lang="ts">
import JobsHistory from "~/components/jobs-history.vue";

definePageMeta({
  middleware: ['auth',]
});
</script>

<template>
  <section class="section is-fullheight-100vh">
    <div class="container is-max-desktop">
      <p class="subtitle">Sync Jobs Execution Time</p>
      <JobsHistory/>
    </div>
  </section>
</template>
