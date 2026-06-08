<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  transaction: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  },
  submitAction: {
    type: Function,
    required: true
  }
})

defineEmits(['cancel'])
const saving = ref(false)
const error = ref('')

const emptyForm = () => ({
  description: '',
  amount: '',
  type: 'expense',
  categoryId: '',
  transaction_date: new Date().toISOString().slice(0, 10),
  notes: ''
})

const form = reactive(emptyForm())

watch(
  () => props.transaction,
  (transaction) => {
    Object.assign(form, transaction
      ? {
          description: transaction.description,
          amount: Number(transaction.amount).toFixed(2),
          type: transaction.type,
          categoryId: transaction.category_id || '',
          transaction_date: transaction.transaction_date,
          notes: transaction.notes || ''
        }
      : emptyForm())
    error.value = ''
  },
  { immediate: true }
)

async function submit() {
  if (!form.description.trim() || Number(form.amount) <= 0 || !form.transaction_date) {
    error.value = 'Preencha a descrição, o valor e a data.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    await props.submitAction({ ...form })
  } catch (submitError) {
    error.value = submitError.friendlyMessage || 'Não foi possível salvar a transação.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <div class="type-selector form-field--full">
      <label :class="{ active: form.type === 'expense' }">
        <input v-model="form.type" type="radio" value="expense" />
        <span class="type-dot type-dot--expense"></span>
        Despesa
      </label>
      <label :class="{ active: form.type === 'income' }">
        <input v-model="form.type" type="radio" value="income" />
        <span class="type-dot type-dot--income"></span>
        Receita
      </label>
    </div>

    <label class="form-field form-field--full">
      <span>Descrição</span>
      <input v-model="form.description" type="text" maxlength="100" placeholder="Ex.: Conta de energia" />
    </label>

    <label class="form-field">
      <span>Valor</span>
      <div class="input-prefix">
        <span>R$</span>
        <input v-model="form.amount" type="number" min="0.01" step="0.01" placeholder="0,00" />
      </div>
    </label>

    <label class="form-field">
      <span>Data</span>
      <input v-model="form.transaction_date" type="date" />
    </label>

    <label class="form-field form-field--full">
      <span>Categoria</span>
      <select v-model="form.categoryId">
        <option value="">Sem categoria</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </label>

    <label class="form-field form-field--full">
      <span>Observações <small>(opcional)</small></span>
      <textarea v-model="form.notes" rows="3" maxlength="300" placeholder="Adicione detalhes sobre esta transação"></textarea>
    </label>

    <p v-if="error" class="form-error form-field--full">{{ error }}</p>

    <div class="form-actions form-field--full">
      <button class="button button--secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      <button class="button button--primary" type="submit" :disabled="saving">
        {{ saving ? 'Salvando...' : transaction ? 'Salvar alterações' : 'Adicionar transação' }}
      </button>
    </div>
  </form>
</template>
