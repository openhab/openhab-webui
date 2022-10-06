<script setup>
import { RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth";

const { isTokenRequired, refreshAccessToken } = useAuthStore();
isTokenRequired().then(async (requireToken) => {
  console.debug("Token required: " + requireToken);
  if (requireToken) {
    console.debug("Refreshing token...");
    await refreshAccessToken();
  } else {
    console.debug("Authorization no required!");
  }
});
</script>

<template>
  <header>
    <div class="title">
      <span>HAB </span>
      <span class="grey">Assistant</span>
    </div>
    <nav>
      <RouterLink to="/">Assistant</RouterLink>
      <RouterLink to="/Settings">Settings</RouterLink>
    </nav>
  </header>

  <RouterView />
  <div class="logo-container">
    <img
      alt="openHAB logo"
      class="logo"
      src="@/assets/openhab-logo.svg"
      width="125"
      height="48"
    />
  </div>
</template>

<style scoped>
header {
  position: relative;
  line-height: 1.5;
  max-height: 100vh;
}

.title {
  position: absolute;
  font-size: 30px;
  color: #e64a19;
  top: -0.3rem;
  width: 180px;
  height: 46px;
  left: 50%;
  margin-left: -90px;
  text-align: center;
  line-height: 46px;
  display: inline-flex;
  user-select: none;
  user-select: none;
  -webkit-user-select: none;
}

.title .grey {
  color: #474747;
  font-family: Chalkboard SE;
  line-height: 40px;
  margin-left: 6px;
}

@media (orientation: portrait) {
  .title {
    left: 0%;
    margin-left: 0px;
  }
}

.logo-container {
  text-align: right;
  -webkit-user-select: none;
}

nav {
  position: relative;
  width: 100%;
  text-align: right;
}

nav a.router-link-exact-active {
  color: var(--color-text);
  display: none;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1rem;
}

nav a:first-of-type {
  border: 0;
}
</style>
