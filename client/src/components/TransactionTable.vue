<script setup>
import EmptyState from './EmptyState.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  compact: Boolean,
  editable: {
    type: Boolean,
    default: true
  }
})

defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="table-wrap">
    <div v-if="loading" class="loading-list">
      <span v-for="item in 4" :key="item"></span>
    </div>

    <EmptyState
      v-else-if="!transactions.length"
      title="Nenhuma transação encontrada"
      description="Cadastre uma receita ou despesa para acompanhar suas finanças."
    />

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Descrição</th>
          <th v-if="!compact">Categoria</th>
          <th>Data</th>
          <th class="align-right">Valor</th>
          <th v-if="editable" aria-label="Ações"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>
            <div class="transaction-name">
              <span class="transaction-icon" :class="`transaction-icon--${transaction.type}`">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path v-if="transaction.type === 'income'" d="m7 17 10-10M8 7h9v9" />
                  <path v-else d="m7 7 10 10M16 17H7V8" />
                </svg>
              </span>
              <div>
                <strong>{{ transaction.description }}</strong>
                <small v-if="compact">{{ transaction.category?.name || 'Sem categoria' }}</small>
              </div>
            </div>
          </td>
          <td v-if="!compact">
            <span v-if="transaction.category" class="category-pill">
              <i :style="{ backgroundColor: transaction.category.color }"></i>
              {{ transaction.category.name }}
            </span>
            <span v-else class="muted-text">Sem categoria</span>
          </td>
          <td class="muted-text">{{ formatDate(transaction.transaction_date) }}</td>
          <td class="align-right">
            <strong :class="`amount amount--${transaction.type}`">
              {{ transaction.type === 'expense' ? '-' : '+' }} {{ formatCurrency(transaction.amount) }}
            </strong>
          </td>
          <td v-if="editable" class="table-actions">
            <button class="icon-button icon-button--small" type="button" title="Editar" @click="$emit('edit', transaction)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 16-1 5 5-1L19 9l-4-4L4 16ZM13.5 6.5l4 4" />
              </svg>
            </button>
            <button class="icon-button icon-button--small icon-button--danger" type="button" title="Excluir" @click="$emit('delete', transaction)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
