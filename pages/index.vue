<script setup lang="ts">
  const email = ref<string>()
  const errors = ref()

  const user = computed(() => {
    return data.value?.user
  })

  const session = computed(() => {
    return data.value?.session
  })

  const { data } = await useAsyncData('user', () =>
    $fetch('/api/me')
  )

  async function register() {
    try {
      if (!email.value) return
      errors.value = ''
      await usePassKeyRegistration(email.value)
    } catch (error: any) {
      errors.value = error.data.statusMessage
    }
  }

  async function login() {
    try {
      errors.value = ''
      await usePassKeyLogin()
      return navigateTo('/restricted')
    } catch (error: any) {
      errors.value = error.data.statusMessage
    }
  }
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 0.5rem;
      max-width: 30rem;
    ">
    <label for="email"
      >Readable account name identifier for embedded auth dialog
      (displayed in login and register). On this example I chose
      an email</label
    >
    <input
      id="email"
      v-model="email"
      type="text"
      placeholder="Enter your email"
      autocomplete="email" />
    <button @click="register">Register with passkey</button>

    <hr
      style="
        margin-top: 30px;
        border: 1px solid #000;
        width: 100%;
      " />
    <p>Just a button is required for login</p>
    <button @click="login">Connect with passkey</button>
    <hr
      style="
        margin-top: 30px;
        border: 1px solid #000;
        width: 100%;
      " />
  </div>
  <ClientOnly>
    <pre v-if="user">user: {{ user }}</pre>
    <pre v-if="session">session: {{ session }}</pre>
  </ClientOnly>
  <pre>errors: {{ errors }}</pre>
</template>
