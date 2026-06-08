import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('finansmart:session') || 'null')

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Não foi possível concluir a operação.'
    error.friendlyMessage = message
    return Promise.reject(error)
  }
)

export default api
