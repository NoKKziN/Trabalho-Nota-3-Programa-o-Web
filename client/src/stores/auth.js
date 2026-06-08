import { defineStore } from 'pinia'
import api from '@/services/api'

const sessionKey = 'finansmart:session'
const userKey = 'finansmart:user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(userKey) || 'null'),
    session: JSON.parse(localStorage.getItem(sessionKey) || 'null'),
    loading: false,
    ready: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.session?.access_token),
    firstName: (state) => state.user?.name?.split(' ')[0] || state.user?.email || 'Usuário'
  },
  actions: {
    persist(user, session) {
      this.user = user
      this.session = session
      localStorage.setItem(userKey, JSON.stringify(user))
      localStorage.setItem(sessionKey, JSON.stringify(session))
    },
    clear() {
      this.user = null
      this.session = null
      localStorage.removeItem(userKey)
      localStorage.removeItem(sessionKey)
    },
    async initialize() {
      this.ready = true
      if (!this.session?.access_token) return

      try {
        await this.fetchMe()
      } catch {
        await this.refreshSession()
      }
    },
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.post('/auth/login', credentials)
        this.persist(normalizeUser(data.user), data.session)
        await this.fetchMe()
      } catch (error) {
        this.error = error.friendlyMessage
        throw error
      } finally {
        this.loading = false
      }
    },
    async register(payload) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.post('/auth/register', payload)
        if (data.session) {
          this.persist(normalizeUser(data.user), data.session)
          await this.fetchMe()
        }
        return data
      } catch (error) {
        this.error = error.friendlyMessage
        throw error
      } finally {
        this.loading = false
      }
    },
    async refreshSession() {
      if (!this.session?.refresh_token) {
        this.clear()
        return
      }

      try {
        const { data } = await api.post('/auth/refresh', {
          refreshToken: this.session.refresh_token
        })
        this.persist(normalizeUser(data.user), data.session)
        await this.fetchMe()
      } catch {
        this.clear()
      }
    },
    async fetchMe() {
      const { data } = await api.get('/auth/me')
      const user = normalizeUser(data.user)
      this.user = user
      localStorage.setItem(userKey, JSON.stringify(user))
    },
    async updateProfile(payload) {
      const { data } = await api.put('/profile', payload)
      this.user = {
        ...this.user,
        ...data.profile,
        monthly_goal: data.profile.monthly_goal
      }
      localStorage.setItem(userKey, JSON.stringify(this.user))
    },
    logout() {
      this.clear()
    }
  }
})

function normalizeUser(user) {
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name || user.full_name || user.user_metadata?.full_name || 'Usuário',
    monthly_goal: Number(user.monthly_goal || 0)
  }
}
