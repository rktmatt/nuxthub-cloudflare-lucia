<script setup lang="ts">
  definePageMeta({
    middleware: 'auth',
  })
  const currentUser = useState('user')
  const session = useState('session')
</script>

<template>
  This is a restricted page
  <pre>{{ currentUser }}</pre>
  <pre>{{ session }}</pre>
</template>
