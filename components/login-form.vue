<script setup lang="ts">

import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {LOGIN_REDIRECT_QS_NAME} from "~/lib/auth";
import {saveUserSession} from "~/lib/localStorage";

const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');
const error = ref<string | undefined>();

const handleLogin = async (e: Event) => {
  e.preventDefault();

  try {
    const {status, error: apiError, data} = await useFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });

    if (status.value === 'success') {
      saveUserSession(data.value);
      const redirectUrl = route.query[LOGIN_REDIRECT_QS_NAME] || '/';
      await router.push(redirectUrl.toString());
      return;
    } else {
      password.value = '';
      error.value = apiError.value?.statusMessage;
    }
  } catch {
    password.value = '';
    error.value = 'An error occurred during login';
  }
};
</script>

<template>
  <div>
    <div v-if="error" class="notification is-danger is-light">{{ error }}</div>
    <form @submit="handleLogin">
      <div class="field">
        <div class="control">
          <input
              v-model="username"
              required
              class="input is-medium"
              type="email"
              placeholder="Email"
          >
        </div>
      </div>
      <div class="field">
        <div class="control">
          <input
              v-model="password"
              required
              class="input is-medium"
              type="password"
              placeholder="Password"
          >
        </div>
      </div>
      <button class="button is-block is-success is-large is-fullwidth">
        Login
      </button>
    </form>
  </div>
</template>