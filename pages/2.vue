<script setup lang="ts">
  const user = useState('user')
</script>

<template>
  <div>
    To get the user you just can grab it from the state.
    <pre>user : {{ user }}</pre>
  </div>
</template>
