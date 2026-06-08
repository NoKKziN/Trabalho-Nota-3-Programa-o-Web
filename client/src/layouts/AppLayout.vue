<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const navigation = [
  { name: 'dashboard', label: 'Visão geral', icon: 'grid' },
  { name: 'transactions', label: 'Transações', icon: 'swap' },
  { name: 'categories', label: 'Categorias', icon: 'tag' },
  { name: 'profile', label: 'Meu perfil', icon: 'user' }
]

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ 'sidebar--open': menuOpen }">
      <div class="brand">
        <span class="brand__mark">F</span>
        <span class="brand__name">Finan<span>Smart</span></span>
      </div>

      <nav class="sidebar__nav" aria-label="Menu principal">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="{ name: item.name }"
          class="nav-link"
          @click="menuOpen = false"
        >
          <svg v-if="item.icon === 'grid'" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
          </svg>
          <svg v-else-if="item.icon === 'swap'" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3" />
          </svg>
          <svg v-else-if="item.icon === 'tag'" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 13 13 20 4 11V4h7l9 9Z" />
            <circle cx="8.5" cy="8.5" r="1.5" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar__footer">
        <div class="user-chip">
          <span class="avatar">{{ auth.firstName.charAt(0).toUpperCase() }}</span>
          <div>
            <strong>{{ auth.firstName }}</strong>
            <small>{{ auth.user?.email }}</small>
          </div>
        </div>
        <button class="icon-button" type="button" title="Sair" @click="logout">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
          </svg>
        </button>
      </div>
    </aside>

    <div v-if="menuOpen" class="sidebar-backdrop" @click="menuOpen = false"></div>

    <main class="main-content">
      <header class="mobile-header">
        <div class="brand">
          <span class="brand__mark">F</span>
          <span class="brand__name">Finan<span>Smart</span></span>
        </div>
        <button class="icon-button" type="button" aria-label="Abrir menu" @click="menuOpen = true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>
      <RouterView />
    </main>
  </div>
</template>
