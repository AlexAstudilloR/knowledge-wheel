<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <NavBar />
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/ui/NavBar.vue';
</script>

<style>
/* Estilos base opcionales */
html, body {
  scroll-behavior: smooth;
}
</style>
