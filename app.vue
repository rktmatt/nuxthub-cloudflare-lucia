<script setup lang="ts">
  // do something to present user with a message
  const errors = ref()

  async function logout() {
    try {
      await useLogout()
      return navigateTo('/')
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
        grid-template-columns: repeat(3, minmax(0, 1fr));
        max-width: 30rem;
      ">
      <NuxtLink to="/">home</NuxtLink>
      <NuxtLink to="/restricted">restricted page</NuxtLink>
      <button @click="logout">Logout</button>
    </nav>
    <NuxtPage />
  </div>
</template>
