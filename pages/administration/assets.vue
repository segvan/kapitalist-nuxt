<script setup lang="ts">
const {data: assets} = await useFetch('/api/assets', {lazy: true});
</script>

<template>
  <section class="section is-fullheight-100vh">
    <div class="container is-max-desktop">
      <p class="subtitle">Assets administration</p>
      <AssetsList v-if="assets" :data="assets"/>
    </div>
  </section>
</template>