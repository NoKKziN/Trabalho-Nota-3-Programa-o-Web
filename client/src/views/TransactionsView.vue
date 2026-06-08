<script setup>
import { onMounted, reactive, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import TransactionForm from '@/components/TransactionForm.vue'
import TransactionTable from '@/components/TransactionTable.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useTransactionsStore } from '@/stores/transactions'

const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const formOpen = ref(false)
const deleteOpen = ref(false)
const selected = ref(null)
const deleting = ref(false)
const error = ref('')
const filters = reactive({
  search: '',
  type: '',
  categoryId: '',
  page: 1,
  limit: 20
})

async function load() {
  error.value = ''
  try {
    await transactionsStore.fetchTransactions(cleanFilters())
  } catch (loadError) {
    error.value = loadError.friendlyMessage
  }
}

function cleanFilters() {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
}

function applyFilters() {
  filters.page = 1
  load()
}

function clearFilters() {
  Object.assign(filters, { search: '', type: '', categoryId: '', page: 1, limit: 20 })
  load()
}

function openCreate() {
  selected.value = null
  formOpen.value = true
}

function openEdit(transaction) {
  selected.value = transaction
  formOpen.value = true
}

function askDelete(transaction) {
  selected.value = transaction
  deleteOpen.value = true
}

async function save(payload) {
  if (selected.value) {
    await transactionsStore.updateTransaction(selected.value.id, payload)
  } else {
    await transactionsStore.createTransaction(payload)
  }
  formOpen.value = false
  await load()
}

async function remove() {
  deleting.value = true
  try {
    await transactionsStore.deleteTransaction(selected.value.id)
    deleteOpen.value = false
    selected.value = null
    await load()
  } catch (deleteError) {
    error.value = deleteError.friendlyMessage
  } finally {
    deleting.value = false
  }
}

function changePage(page) {
  filters.page = page
  load()
}

onMounted(async () => {
  await Promise.all([categoriesStore.fetchCategories(), load()])
})
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <span class="eyebrow">Movimentações</span>
        <h1>Transações</h1>
        <p>Cadastre e acompanhe todas as entradas e saídas.</p>
      </div>
      <button class="button button--primary" type="button" @click="openCreate">
        <span class="button__plus">+</span>
        Nova transação
      </button>
    </header>

    <p v-if="error" class="alert alert--error">{{ error }}</p>

    <section class="panel">
      <form class="filters" @submit.prevent="applyFilters">
        <label class="search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 5 5" />
          </svg>
          <input v-model="filters.search" type="search" placeholder="Buscar por descrição..." />
        </label>
        <select v-model="filters.type" aria-label="Tipo">
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select v-model="filters.categoryId" aria-label="Categoria">
          <option value="">Todas as categorias</option>
          <option v-for="category in categoriesStore.categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <button class="button button--secondary" type="submit">Filtrar</button>
        <button class="text-button" type="button" @click="clearFilters">Limpar</button>
      </form>

      <div class="table-summary">
        <span>
          <strong>{{ transactionsStore.pagination.total }}</strong>
          {{ transactionsStore.pagination.total === 1 ? 'transação encontrada' : 'transações encontradas' }}
        </span>
      </div>

      <TransactionTable
        :transactions="transactionsStore.transactions"
        :loading="transactionsStore.loading"
        @edit="openEdit"
        @delete="askDelete"
      />

      <nav v-if="transactionsStore.pagination.pages > 1" class="pagination" aria-label="Paginação">
        <button
          type="button"
          :disabled="filters.page === 1"
          @click="changePage(filters.page - 1)"
        >
          Anterior
        </button>
        <span>Página {{ filters.page }} de {{ transactionsStore.pagination.pages }}</span>
        <button
          type="button"
          :disabled="filters.page === transactionsStore.pagination.pages"
          @click="changePage(filters.page + 1)"
        >
          Próxima
        </button>
      </nav>
    </section>

    <BaseModal :open="formOpen" :title="selected ? 'Editar transação' : 'Nova transação'" @close="formOpen = false">
      <TransactionForm
        :transaction="selected"
        :categories="categoriesStore.categories"
        :submit-action="save"
        @cancel="formOpen = false"
      />
    </BaseModal>

    <BaseModal :open="deleteOpen" title="Excluir transação" size="small" @close="deleteOpen = false">
      <div class="confirm-dialog">
        <span class="confirm-dialog__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 9v4M12 17h.01M10.3 3.8 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
          </svg>
        </span>
        <p>Tem certeza que deseja excluir <strong>{{ selected?.description }}</strong>? Esta ação não pode ser desfeita.</p>
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
