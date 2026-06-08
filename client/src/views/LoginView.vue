<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const mode = ref('login')
const notice = ref('')
const showPassword = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: ''
})

const isRegister = computed(() => mode.value === 'register')

function switchMode(nextMode) {
  mode.value = nextMode
  auth.error = null
  notice.value = ''
}

async function submit() {
  notice.value = ''

  try {
    if (isRegister.value) {
      const response = await auth.register(form)
      if (!response.session) {
        switchMode('login')
        notice.value = response.message
        return
      }
    } else {
      await auth.login(form)
    }

    router.push(route.query.redirect || { name: 'dashboard' })
  } catch {
    // A store exibe a mensagem tratada.
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-showcase">
      <div class="auth-showcase__content">
        <div class="brand brand--light">
          <span class="brand__mark">F</span>
          <span class="brand__name">Finan<span>Smart</span></span>
        </div>

        <div class="auth-copy">
          <span class="eyebrow eyebrow--light">Controle simples. Decisões melhores.</span>
          <h1>Seu dinheiro,<br /><em>sob controle.</em></h1>
          <p>Organize suas receitas e despesas, acompanhe sua evolução e transforme seus planos em resultados.</p>
        </div>

        <div class="auth-preview">
          <div class="auth-preview__top">
            <span>Saldo disponível</span>
            <span class="status-dot">Atualizado</span>
          </div>
          <strong>R$ 8.420,50</strong>
          <div class="mini-chart" aria-hidden="true">
            <span style="height: 34%"></span>
            <span style="height: 48%"></span>
            <span style="height: 42%"></span>
            <span style="height: 68%"></span>
            <span style="height: 55%"></span>
            <span style="height: 82%"></span>
            <span style="height: 92%"></span>
          </div>
        </div>
      </div>
      <div class="auth-orb auth-orb--one"></div>
      <div class="auth-orb auth-orb--two"></div>
    </section>

    <section class="auth-panel">
      <div class="auth-box">
        <header>
          <span class="eyebrow">{{ isRegister ? 'Comece agora' : 'Bem-vindo de volta' }}</span>
          <h2>{{ isRegister ? 'Crie sua conta' : 'Acesse sua conta' }}</h2>
          <p>{{ isRegister ? 'Leva menos de um minuto.' : 'Entre para continuar cuidando das suas finanças.' }}</p>
        </header>

        <div class="auth-tabs">
          <button :class="{ active: !isRegister }" type="button" @click="switchMode('login')">Entrar</button>
          <button :class="{ active: isRegister }" type="button" @click="switchMode('register')">Criar conta</button>
        </div>

        <form class="auth-form" @submit.prevent="submit">
          <label v-if="isRegister" class="form-field">
            <span>Nome completo</span>
            <input v-model="form.name" type="text" autocomplete="name" placeholder="Como podemos chamar você?" required />
          </label>

          <label class="form-field">
            <span>E-mail</span>
            <input v-model="form.email" type="email" autocomplete="email" placeholder="voce@email.com" required />
          </label>

          <label class="form-field">
            <span>Senha</span>
            <div class="password-input">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :autocomplete="isRegister ? 'new-password' : 'current-password'"
                placeholder="Mínimo de 6 caracteres"
                minlength="6"
                required
              />
              <button type="button" @click="showPassword = !showPassword">
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </label>

          <p v-if="auth.error" class="form-error">{{ auth.error }}</p>
          <p v-if="notice" class="form-notice">{{ notice }}</p>

          <button class="button button--primary button--large" type="submit" :disabled="auth.loading">
            {{ auth.loading ? 'Aguarde...' : isRegister ? 'Criar minha conta' : 'Entrar na plataforma' }}
          </button>
        </form>

        <p class="auth-terms">Ao continuar, você concorda com os termos de uso da plataforma.</p>
      </div>
    </section>
  </main>
</template>
