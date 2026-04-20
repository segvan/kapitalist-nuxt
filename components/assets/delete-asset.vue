<script setup lang="ts">
import {ref} from 'vue';

interface DeleteAssetProps {
  assetId: string;
}

const props = defineProps<DeleteAssetProps>();
const emit = defineEmits<{(e: 'deleted'): void}>();

const isDialogOpened = ref(false);
const isLoading = ref(false);
const error = ref('');

async function deleteAsset() {
  isLoading.value = true;
  error.value = '';
  try {
    await $fetch(`/api/assets/${props.assetId}`, {method: 'DELETE'});
    isDialogOpened.value = false;
    emit('deleted');
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to delete asset';
  } finally {
    isLoading.value = false;
  }
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
          <button
              class="button is-danger"
              :disabled="isLoading"
              :class="{'is-loading': isLoading}"
              @click="deleteAsset"
          >Delete</button>
          <button class="button" :disabled="isLoading" @click="isDialogOpened = false">Cancel</button>
        </div>
        <p v-if="error" class="help is-danger">{{ error }}</p>
      </footer>
    </div>
  </div>
</template>