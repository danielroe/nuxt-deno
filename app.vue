<template>
  <div>
    <NuxtWelcome />
  </div>
</template>

<script setup>
console.log(await $fetch('https://jsonplaceholder.typicode.com/posts/1'))
</script>
