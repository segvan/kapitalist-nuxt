<template>
  <div>
    <AppNavbar/>
    <slot/>
    <AppFooter/>
  </div>
</template>

<style>
body {
  padding: 0;
  margin: 0;
}

.is-fullheight-100vh {
  min-height: 100vh;
}
</style>
