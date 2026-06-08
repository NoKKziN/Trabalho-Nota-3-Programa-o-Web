import { defineStore } from 'pinia'
import api from '@/services/api'

const defaultColors = ['#6c5ce7', '#00b894', '#0984e3', '#fdcb6e', '#e17055', '#d63031']

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),
  getters: {
    options: (state) => state.categories.map((category) => ({
      label: category.name,
      value: category.id,
      color: category.color
    })),
    defaultColor: (state) => defaultColors[state.categories.length % defaultColors.length]
  },
  actions: {
    async fetchCategories() {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get('/categories')
        this.categories = data.categories
      } catch (error) {
        this.error = error.friendlyMessage
        throw error
      } finally {
        this.loading = false
      }
    },
    async createCategory(payload) {
      const { data } = await api.post('/categories', payload)
      this.categories.push(data.category)
      this.categories.sort((a, b) => a.name.localeCompare(b.name))
      return data.category
    },
    async updateCategory(id, payload) {
      const { data } = await api.put(`/categories/${id}`, payload)
      const index = this.categories.findIndex((category) => category.id === id)
      if (index >= 0) this.categories[index] = data.category
      this.categories.sort((a, b) => a.name.localeCompare(b.name))
      return data.category
    },
    async deleteCategory(id) {
      await api.delete(`/categories/${id}`)
      this.categories = this.categories.filter((category) => category.id !== id)
    }
  }
})
