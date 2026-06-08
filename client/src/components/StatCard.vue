<script setup>
defineProps({
  label: String,
  value: String,
  detail: String,
  tone: {
    type: String,
    default: 'primary'
  }
})
</script>

<template>
  <article class="stat-card" :class="`stat-card--${tone}`">
    <div class="stat-card__icon">
      <svg v-if="tone === 'income'" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 17 10-10M8 7h9v9" />
      </svg>
      <svg v-else-if="tone === 'expense'" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 7 10 10M16 17H7V8" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="3" />
        <path d="M16 12h2M7 6V4h10v2" />
      </svg>
    </div>
    <div class="stat-card__content">
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <small>{{ detail }}</small>
    </div>
  </article>
</template>
