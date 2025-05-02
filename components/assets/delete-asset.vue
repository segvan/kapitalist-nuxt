<script setup lang="ts">
import { ref } from 'vue';

interface DeleteAssetProps {
  assetId: string;
}

const props = defineProps<DeleteAssetProps>();
const isDialogOpened = ref(false);

function deleteAsset(assetId: string) {
  // TODO: Remove asset from the list
  alert(assetId);
  isDialogOpened.value = false;
}
</script>

<template>
  <button class="delete is-medium" @click="isDialogOpened = true"/>

  <div :class="`modal ${isDialogOpened ? 'is-active' : ''}`">
    <div class="modal-background"/>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Delete {{ props.assetId }}?</p>
      </header>
      <footer class="modal-card-foot">
        <div class="buttons">
          <button class="button is-danger" @click="deleteAsset(props.assetId)">Delete</button>
          <button class="button" @click="isDialogOpened = false">Cancel</button>
        </div>
      </footer>
    </div>
  </div>
</template>