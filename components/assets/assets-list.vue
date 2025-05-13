<script setup lang="ts">
import DeleteAsset from "~/components/assets/delete-asset.vue";
import AddAsset from "~/components/assets/add-asset.vue";
import type {AssetModel} from "~/lib/apiModels";

const {data: assets, status, error} = await useApi<AssetModel[]>('/api/assets');

if (error.value?.statusCode === 401) {
  navigateTo('/login');
}

</script>

<template>
  <div>
    <div class="columns is-mobile">
      <div class="column is-1 is-offset-7-mobile is-offset-9-desktop">
        <button v-if="status==='pending'" class="button skeleton-block">Add asset</button>
        <AddAsset v-else/>
      </div>
    </div>
    <app-external-data-loader :condition="status==='pending'" :number-of-lines="3" :error-message="error?.data?.message">
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
    </app-external-data-loader>
  </div>
</template>