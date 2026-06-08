<script setup>
defineProps({
  title: {
    type: String,
    default: 'Nada por aqui'
  },
  description: {
    type: String,
    default: 'Adicione o primeiro item para começar.'
  }
})
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16v12H4zM8 3h8l2 4H6l2-4Z" />
        <path d="M9 13h6" />
      </svg>
    </span>
    <strong>{{ title }}</strong>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>
