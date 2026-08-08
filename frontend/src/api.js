import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('hostelfix_token') || localStorage.getItem('haven_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hostelfix_token')
      localStorage.removeItem('hostelfix_user')
      localStorage.removeItem('haven_token')
      localStorage.removeItem('haven_user')
    }
    return Promise.reject(error)
  }
)
export default api

