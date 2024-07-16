<script setup lang="ts">
  const user = computed(() => {
    return data.value?.user
  })

  const session = computed(() => {
    return data.value?.session
  })

  const { data } = await useAsyncData('user', () =>
    $fetch('/api/me')
  )
</script>

<template>
  This is a restricted page
  <pre v-if="user">{{ user }}</pre>
  <pre v-if="session">{{ session }}</pre>
</template>
