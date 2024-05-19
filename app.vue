<script setup lang="ts">
  // do something to present user with a message
  const errors = ref()

  async function logout() {
    try {
      await useLogout()
    } catch (error: any) {
      errors.value = error.data.statusMessage
    }
  }
</script>

<template>
  <div>
    <nav
      style="
        margin-bottom: 30px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        max-width: 30rem;
      ">
      <NuxtLink to="/">home</NuxtLink>
      <NuxtLink to="/2">another page</NuxtLink>
      <NuxtLink to="/3">restricted page</NuxtLink>
      <button @click="logout">Logout</button>
    </nav>
    <NuxtPage />
  </div>
</template>
