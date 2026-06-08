import { defineStore } from 'pinia'
import api from '@/services/api'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    summary: {
      income: 0,
      expense: 0,
      balance: 0,
      total: 0
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null
  }),
  getters: {
    expenses: (state) => state.transactions.filter((item) => item.type === 'expense'),
    incomes: (state) => state.transactions.filter((item) => item.type === 'income')
  },
  actions: {
    async fetchTransactions(filters = {}) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get('/transactions', { params: filters })
        this.transactions = data.transactions
        this.pagination = data.pagination
      } catch (error) {
        this.error = error.friendlyMessage
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchSummary(filters = {}) {
      const { data } = await api.get('/transactions/summary', { params: filters })
      this.summary = data.summary
      return data
    },
    async createTransaction(payload) {
      const { data } = await api.post('/transactions', payload)
      this.transactions.unshift(data.transaction)
      return data.transaction
    },
    async updateTransaction(id, payload) {
      const { data } = await api.put(`/transactions/${id}`, payload)
      const index = this.transactions.findIndex((transaction) => transaction.id === id)
      if (index >= 0) this.transactions[index] = data.transaction
      return data.transaction
    },
    async deleteTransaction(id) {
      await api.delete(`/transactions/${id}`)
      this.transactions = this.transactions.filter((transaction) => transaction.id !== id)
    }
  }
})
