<script setup lang="ts">
import WalletOverview from "~/components/wallet/wallet-overview.vue";

definePageMeta({middleware: ['auth']});
</script>

<template>
  <section class="section is-fullheight-100vh">
    <div class="container is-max-desktop">
      <p class="subtitle">Wallet</p>
      <WalletOverview />
    </div>
  </section>
</template>