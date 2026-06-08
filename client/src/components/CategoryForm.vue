<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    default: null
  },
  submitAction: {
    type: Function,
    required: true
  }
})

defineEmits(['cancel'])
const colors = ['#6c5ce7', '#0984e3', '#00b894', '#fdcb6e', '#e17055', '#d63031', '#e84393', '#636e72']
const form = reactive({ name: '', color: colors[0] })
const saving = ref(false)
const error = ref('')

watch(
  () => props.category,
  (category) => {
    form.name = category?.name || ''
    form.color = category?.color || colors[0]
    error.value = ''
  },
  { immediate: true }
)

async function submit() {
  if (form.name.trim().length < 2) {
    error.value = 'Informe um nome com pelo menos 2 caracteres.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    await props.submitAction({ ...form })
  } catch (submitError) {
    error.value = submitError.friendlyMessage || 'Não foi possível salvar a categoria.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <label class="form-field form-field--full">
      <span>Nome da categoria</span>
      <input v-model="form.name" type="text" maxlength="50" placeholder="Ex.: Alimentação" autofocus />
    </label>

    <div class="form-field form-field--full">
      <span>Cor de identificação</span>
      <div class="color-picker">
        <label v-for="color in colors" :key="color" :title="color">
          <input v-model="form.color" type="radio" :value="color" />
          <span :style="{ backgroundColor: color }"></span>
        </label>
      </div>
    </div>

    <p v-if="error" class="form-error form-field--full">{{ error }}</p>

    <div class="form-actions form-field--full">
      <button class="button button--secondary" type="button" @click="$emit('cancel')">Cancelar</button>
      <button class="button button--primary" type="submit" :disabled="saving">
        {{ saving ? 'Salvando...' : category ? 'Salvar alterações' : 'Criar categoria' }}
      </button>
    </div>
  </form>
</template>
