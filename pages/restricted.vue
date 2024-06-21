<script setup lang="ts">
  definePageMeta({
    middleware: 'auth',
  })
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)

  onMounted(() => {
    user.value = useState<User>('user').value
    session.value = useState<Session>('session').value
  })
</script>

<template>
  This is a restricted page
  <pre v-if="user">{{ user }}</pre>
  <pre v-if="session">{{ session }}</pre>
</template>
