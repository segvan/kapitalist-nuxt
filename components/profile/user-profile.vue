<script setup>
const {data: profile, status} = useApi('/api/profile');

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const changePassword = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'New passwords do not match';
    return;
  }

  isLoading.value = true;
  try {
    await $fetch('/api/profile/password', {
      method: 'PUT',
      body: {currentPassword: currentPassword.value, newPassword: newPassword.value},
    });
    successMessage.value = 'Password changed successfully';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (e) {
    errorMessage.value = e?.data?.statusMessage || 'Failed to change password';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="box">
      <p class="label">Email</p>
      <p v-if="status === 'pending'">Loading...</p>
      <p v-else>{{ profile?.email }}</p>
    </div>

    <div class="box">
      <p class="title is-5">Change Password</p>

      <div v-if="successMessage" class="notification is-success is-light">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="notification is-danger is-light">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="changePassword">
        <div class="field">
          <label class="label">Current Password</label>
          <div class="control">
            <input
                v-model="currentPassword"
                class="input"
                type="password"
                placeholder="Current password"
                required
            />
          </div>
        </div>

        <div class="field">
          <label class="label">New Password</label>
          <div class="control">
            <input
                v-model="newPassword"
                class="input"
                type="password"
                placeholder="New password (min 8 characters)"
                minlength="8"
                required
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Confirm New Password</label>
          <div class="control">
            <input
                v-model="confirmPassword"
                class="input"
                type="password"
                placeholder="Confirm new password"
                required
            />
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button
                type="submit"
                class="button is-primary"
                :class="{'is-loading': isLoading}"
                :disabled="isLoading"
            >
              Change Password
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
