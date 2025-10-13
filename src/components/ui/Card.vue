<template>
  <div
    class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg w-full max-w-3xl mx-auto"
    style="min-height: 200px;"
  >
    <!-- Header opcional -->
    <div v-if="title" class="mb-4 border-b pb-2 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
      <slot name="actions" />
    </div>

    <!-- Contenido principal -->
    <div>
      <slot />
    </div>

    <!-- Footer opcional -->
    <div v-if="$slots.footer" class="mt-4 pt-2 border-t">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
/* Ajuste extra para que se vea más rectangular */
</style>
