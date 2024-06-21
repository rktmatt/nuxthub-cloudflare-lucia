<script setup lang="ts">
  definePageMeta({
    middleware: 'auth',
  })

  const user = computed(() => {
    return useState('user').value
  })

  const session = computed(() => {
    return useState('session').value
  })
</script>

<template>
  This is a restricted page
  <ClientOnly>
    <pre v-if="user">{{ user }}</pre>
    <pre v-if="session">{{ session }}</pre>
  </ClientOnly>
</template>
