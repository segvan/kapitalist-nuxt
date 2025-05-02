<script setup lang="ts">
import {ref, computed} from 'vue';

const isDialogOpened = ref(false);
const assetValue = ref('');

const isValid = computed(() => !assetValue.value || assetValue.value.length >= 3);

const openModal = () => {
  isDialogOpened.value = true;
};

const closeModal = () => {
  assetValue.value = '';
  isDialogOpened.value = false;
};

function addAsset() {
  // TODO: Add new asset to the list
  alert(JSON.stringify({id: assetValue.value}));
  closeModal();
}
</script>

<template>
  <div>
    <button class="button is-primary is-outlined" @click="openModal">Add asset</button>

    <div class="modal" :class="{ 'is-active': isDialogOpened }">
      <div class="modal-background"/>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Add new asset</p>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Asset Id</label>
            <div class="control">
              <input
                  v-model="assetValue"
                  class="input"
                  type="text"
                  placeholder="Enter asset id"
              >
              <p v-if="!isValid" class="help is-danger">Invalid asset Id</p>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="buttons">
            <button
                class="button is-success"
                :disabled="!isValid || !assetValue"
                @click="addAsset"
            >
              Save
            </button>
            <button class="button" @click="closeModal">Cancel</button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
