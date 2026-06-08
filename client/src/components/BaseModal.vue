<script setup>
defineProps({
  open: Boolean,
  title: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'medium'
  }
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @mousedown.self="$emit('close')">
        <section class="modal-card" :class="`modal-card--${size}`" role="dialog" aria-modal="true">
          <header class="modal-card__header">
            <h2>{{ title }}</h2>
            <button class="icon-button" type="button" aria-label="Fechar" @click="$emit('close')">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>
          <div class="modal-card__body">
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
