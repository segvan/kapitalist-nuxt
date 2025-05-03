<script setup lang="ts">
import DeleteAsset from "~/components/assets/delete-asset.vue";
import AddAsset from "~/components/assets/add-asset.vue";

const {data: assets} = await useFetch('/api/assets', {lazy: true});
</script>

<template>
  <div>
    <div class="columns is-mobile">
      <div class="column is-1 is-offset-7-mobile is-offset-9-desktop">
        <AddAsset/>
      </div>
    </div>
    <div class="tags are-large">
      <div
          v-for="asset in assets"
          :key="asset.id"
          class="tag is-primary is-light"
      >
        <h1 class="is-size-4 is-size-3-desktop has-text-weight-medium">{{ asset.id }}</h1>
        <DeleteAsset :asset-id="asset.id"/>
      </div>
    </div>
  </div>
</template>