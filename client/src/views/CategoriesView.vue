<script setup>
import { onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import CategoryForm from '@/components/CategoryForm.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useCategoriesStore } from '@/stores/categories'

const store = useCategoriesStore()
const formOpen = ref(false)
const deleteOpen = ref(false)
const selected = ref(null)
const deleting = ref(false)
const error = ref('')

function openCreate() {
  selected.value = null
  formOpen.value = true
}

function openEdit(category) {
  selected.value = category
  formOpen.value = true
}

async function save(payload) {
  if (selected.value) {
    await store.updateCategory(selected.value.id, payload)
  } else {
    await store.createCategory(payload)
  }
  formOpen.value = false
}

function askDelete(category) {
  selected.value = category
  deleteOpen.value = true
}

async function remove() {
  deleting.value = true
  error.value = ''
  try {
    await store.deleteCategory(selected.value.id)
    deleteOpen.value = false
    selected.value = null
  } catch (deleteError) {
    error.value = deleteError.friendlyMessage || 'Não foi possível excluir a categoria.'
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  try {
    await store.fetchCategories()
  } catch (loadError) {
    error.value = loadError.friendlyMessage
  }
})
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <span class="eyebrow">Organização</span>
        <h1>Categorias</h1>
        <p>Crie grupos para entender melhor para onde vai seu dinheiro.</p>
      </div>
      <button class="button button--primary" type="button" @click="openCreate">
        <span class="button__plus">+</span>
        Nova categoria
      </button>
    </header>

    <p v-if="error" class="alert alert--error">{{ error }}</p>

    <div v-if="store.loading" class="category-grid">
      <div v-for="item in 6" :key="item" class="category-card category-card--skeleton"></div>
    </div>

    <EmptyState
      v-else-if="!store.categories.length"
      title="Crie sua primeira categoria"
      description="Categorias ajudam a visualizar os gastos de forma clara."
    >
      <button class="button button--primary" type="button" @click="openCreate">Criar categoria</button>
    </EmptyState>

    <section v-else class="category-grid">
      <article v-for="category in store.categories" :key="category.id" class="category-card">
        <div class="category-card__mark" :style="{ backgroundColor: `${category.color}18`, color: category.color }">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 13 13 20 4 11V4h7l9 9Z" />
            <circle cx="8.5" cy="8.5" r="1.5" />
          </svg>
        </div>
        <div>
          <h2>{{ category.name }}</h2>
          <span><i :style="{ backgroundColor: category.color }"></i>{{ category.color }}</span>
        </div>
        <div class="category-card__actions">
          <button class="icon-button icon-button--small" type="button" title="Editar" @click="openEdit(category)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m4 16-1 5 5-1L19 9l-4-4L4 16ZM13.5 6.5l4 4" />
            </svg>
          </button>
          <button class="icon-button icon-button--small icon-button--danger" type="button" title="Excluir" @click="askDelete(category)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
            </svg>
          </button>
        </div>
      </article>
    </section>

    <BaseModal :open="formOpen" :title="selected ? 'Editar categoria' : 'Nova categoria'" size="small" @close="formOpen = false">
      <CategoryForm
        :category="selected"
        :submit-action="save"
        @cancel="formOpen = false"
      />
    </BaseModal>

    <BaseModal :open="deleteOpen" title="Excluir categoria" size="small" @close="deleteOpen = false">
      <div class="confirm-dialog">
        <span class="confirm-dialog__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 9v4M12 17h.01M10.3 3.8 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
          </svg>
        </span>
        <p>Excluir a categoria <strong>{{ selected?.name }}</strong>? As transações vinculadas ficarão sem categoria.</p>
        <div class="form-actions">
          <button class="button button--secondary" type="button" @click="deleteOpen = false">Cancelar</button>
          <button class="button button--danger" type="button" :disabled="deleting" @click="remove">
            {{ deleting ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
