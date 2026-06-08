<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const saving = ref(false)
const message = ref('')
const error = ref('')
const form = reactive({
  name: auth.user?.name || '',
  monthlyGoal: Number(auth.user?.monthly_goal || 0)
})

async function save() {
  saving.value = true
  message.value = ''
  error.value = ''

  try {
    await auth.updateProfile(form)
    message.value = 'Perfil atualizado com sucesso.'
  } catch (saveError) {
    error.value = saveError.friendlyMessage || 'Não foi possível atualizar o perfil.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page page--narrow">
    <header class="page-header">
      <div>
        <span class="eyebrow">Configurações</span>
        <h1>Meu perfil</h1>
        <p>Atualize seus dados e defina sua meta de economia.</p>
      </div>
    </header>

    <section class="panel profile-panel">
      <div class="profile-hero">
        <span class="profile-avatar">{{ auth.firstName.charAt(0).toUpperCase() }}</span>
        <div>
          <h2>{{ auth.user?.name }}</h2>
          <p>{{ auth.user?.email }}</p>
        </div>
      </div>

      <form class="profile-form" @submit.prevent="save">
        <div class="form-section">
          <header>
            <h3>Dados pessoais</h3>
            <p>Informações usadas para personalizar sua experiência.</p>
          </header>
          <label class="form-field">
            <span>Nome completo</span>
            <input v-model="form.name" type="text" minlength="3" maxlength="100" required />
          </label>
          <label class="form-field">
            <span>E-mail</span>
            <input :value="auth.user?.email" type="email" disabled />
            <small>O e-mail de acesso não pode ser alterado por aqui.</small>
          </label>
        </div>

        <div class="form-section">
          <header>
            <h3>Planejamento mensal</h3>
            <p>Defina quanto pretende guardar por mês.</p>
          </header>
          <label class="form-field">
            <span>Meta de economia</span>
            <div class="input-prefix">
              <span>R$</span>
              <input v-model="form.monthlyGoal" type="number" min="0" step="0.01" />
            </div>
          </label>
        </div>

        <p v-if="message" class="alert alert--success">{{ message }}</p>
        <p v-if="error" class="alert alert--error">{{ error }}</p>

        <div class="profile-form__footer">
          <button class="button button--primary" type="submit" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
