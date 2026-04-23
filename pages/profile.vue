<script setup>
definePageMeta({middleware: ['auth']});
</script>

<template>
  <section class="section is-fullheight-100vh">
    <div class="container is-max-desktop">
      <p class="subtitle">Profile</p>
      <ProfileUserProfile/>
    </div>
  </section>
</template>
