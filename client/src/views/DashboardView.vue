<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import StatCard from '@/components/StatCard.vue'
import TransactionForm from '@/components/TransactionForm.vue'
import TransactionTable from '@/components/TransactionTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useTransactionsStore } from '@/stores/transactions'
import { formatCurrency, monthLabel } from '@/utils/formatters'

const auth = useAuthStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const showForm = ref(false)
const loading = ref(true)
const recent = ref([])
const monthTransactions = ref([])
const error = ref('')

const range = currentMonthRange()
const summary = computed(() => transactionsStore.summary)
const goal = computed(() => Number(auth.user?.monthly_goal || 0))
const goalProgress = computed(() => {
  if (!goal.value) return 0
  return Math.min(Math.max((summary.value.balance / goal.value) * 100, 0), 100)
})

const categoryBreakdown = computed(() => {
  const totals = new Map()
  let totalExpense = 0

  monthTransactions.value
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      const name = item.category?.name || 'Sem categoria'
      const color = item.category?.color || '#b2bec3'
      const amount = Number(item.amount)
      totalExpense += amount
      const current = totals.get(name) || { name, color, amount: 0 }
      current.amount += amount
      totals.set(name, current)
    })

  return [...totals.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      percentage: totalExpense ? Math.round((item.amount / totalExpense) * 100) : 0
    }))
})

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    const [, data] = await Promise.all([
      categoriesStore.fetchCategories(),
      transactionsStore.fetchSummary({
        startDate: range.start,
        endDate: range.end
      })
    ])
    recent.value = data.recent
    monthTransactions.value = data.transactions
  } catch (loadError) {
    error.value = loadError.friendlyMessage || 'Não foi possível carregar o resumo.'
  } finally {
    loading.value = false
  }
}

async function createTransaction(payload) {
  await transactionsStore.createTransaction(payload)
  showForm.value = false
  await loadDashboard()
}

function currentMonthRange() {
  const date = new Date()
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  const format = (value) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return { start: format(start), end: format(end) }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <span class="eyebrow">{{ monthLabel() }}</span>
        <h1>Olá, {{ auth.firstName }}!</h1>
        <p>Aqui está o resumo das suas finanças neste mês.</p>
      </div>
      <button class="button button--primary" type="button" @click="showForm = true">
        <span class="button__plus">+</span>
        Nova transação
      </button>
    </header>

    <p v-if="error" class="alert alert--error">{{ error }}</p>

    <section class="stats-grid" :class="{ 'is-loading': loading }">
      <StatCard
        label="Saldo do mês"
        :value="formatCurrency(summary.balance)"
        :detail="`${summary.total} movimentações no período`"
        tone="primary"
      />
      <StatCard
        label="Total de receitas"
        :value="formatCurrency(summary.income)"
        detail="Entradas registradas no mês"
        tone="income"
      />
      <StatCard
        label="Total de despesas"
        :value="formatCurrency(summary.expense)"
        detail="Saídas registradas no mês"
        tone="expense"
      />
    </section>

    <section class="dashboard-grid">
      <article class="panel spending-panel">
        <header class="panel__header">
          <div>
            <span class="eyebrow">Distribuição</span>
            <h2>Despesas por categoria</h2>
          </div>
          <strong>{{ formatCurrency(summary.expense) }}</strong>
        </header>

        <div v-if="loading" class="chart-skeleton"></div>
        <div v-else-if="categoryBreakdown.length" class="category-chart">
          <div v-for="category in categoryBreakdown" :key="category.name" class="category-chart__row">
            <div class="category-chart__label">
              <span><i :style="{ backgroundColor: category.color }"></i>{{ category.name }}</span>
              <strong>{{ category.percentage }}%</strong>
            </div>
            <div class="progress-track">
              <span :style="{ width: `${category.percentage}%`, backgroundColor: category.color }"></span>
            </div>
            <small>{{ formatCurrency(category.amount) }}</small>
          </div>
        </div>
        <div v-else class="chart-empty">
          <span>Sem despesas neste mês</span>
          <p>As categorias aparecerão aqui após o primeiro lançamento.</p>
        </div>
      </article>

      <article class="panel goal-panel">
        <span class="eyebrow">Planejamento</span>
        <h2>Meta de economia</h2>
        <div v-if="goal" class="goal-ring" :style="{ '--progress': `${goalProgress * 3.6}deg` }">
          <div>
            <strong>{{ Math.round(goalProgress) }}%</strong>
            <span>alcançado</span>
          </div>
        </div>
        <div v-else class="goal-ring goal-ring--empty">
          <div>
            <strong>0%</strong>
            <span>sem meta</span>
          </div>
        </div>
        <div class="goal-panel__values">
          <span>
            <small>Economizado</small>
            <strong>{{ formatCurrency(Math.max(summary.balance, 0)) }}</strong>
          </span>
          <span>
            <small>Meta mensal</small>
            <strong>{{ goal ? formatCurrency(goal) : 'Não definida' }}</strong>
          </span>
        </div>
        <RouterLink class="text-link" :to="{ name: 'profile' }">
          {{ goal ? 'Editar meta' : 'Definir uma meta' }}
        </RouterLink>
      </article>
    </section>

    <section class="panel recent-panel">
      <header class="panel__header">
        <div>
          <span class="eyebrow">Atividade recente</span>
          <h2>Últimas transações</h2>
        </div>
        <RouterLink class="text-link" :to="{ name: 'transactions' }">Ver todas</RouterLink>
      </header>
      <TransactionTable :transactions="recent" :loading="loading" compact :editable="false" />
    </section>

    <BaseModal :open="showForm" title="Nova transação" @close="showForm = false">
      <TransactionForm
        :categories="categoriesStore.categories"
        :submit-action="createTransaction"
        @cancel="showForm = false"
      />
    </BaseModal>
  </div>
</template>
