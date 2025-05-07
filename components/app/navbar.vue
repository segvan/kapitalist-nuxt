<script setup>
import {ref, computed} from 'vue';
import {useRoute} from 'vue-router';
import {clearUserSession} from "~/lib/localStorage.js";

const route = useRoute();
const isActive = ref(false);

const shouldHideNavbar = computed(() => {
  return route.path === '/login';
});

const toggleNavbar = () => {
  isActive.value = !isActive.value;
};

const closeNavbar = () => {
  isActive.value = false;
};

const logout = async () => {
  await useFetch('/api/logout', {method: 'Post', lazy: true})
  clearUserSession();
  closeNavbar();
}
</script>

<template>
  <nav v-if="!shouldHideNavbar" class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <div class="navbar-item">
        <img src="/logo192.png" alt="" width="32" height="32">
      </div>
      <a
          role="button"
          aria-label="menu"
          aria-expanded="false"
          :class="`navbar-burger burger is-color-primary ${isActive ? 'is-active' : ''}`"
          data-target="navbarMenu"
          @click="toggleNavbar"
      >
        <span aria-hidden="true"/>
        <span aria-hidden="true"/>
        <span aria-hidden="true"/>
        <span aria-hidden="true"/>
      </a>
    </div>

    <div :id="'navbarMenu'" :class="`navbar-menu ${isActive ? 'is-active' : ''}`">
      <div class="navbar-start">
        <NuxtLink to="/" class="navbar-item" @click="closeNavbar">
          Home
        </NuxtLink>

        <NuxtLink to="/jobs" class="navbar-item" @click="closeNavbar">
          Jobs History
        </NuxtLink>

        <div class="navbar-item has-dropdown is-hoverable">
          <div class="navbar-link is-arrowless">
            Administration
          </div>

          <div class="navbar-dropdown is-right is-boxed">
            <NuxtLink to="/administration/assets" class="navbar-item" @click="closeNavbar">
              Assets
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item has-dropdown is-hoverable">
          <div class="navbar-link is-arrowless">
            Profile
          </div>

          <div class="navbar-dropdown is-right is-boxed">
            <div class="navbar-item">
              s.secure.one
            </div>
            <hr class="navbar-divider">
            <NuxtLink to="/login" class="navbar-item" @click="logout">
              Logout
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>