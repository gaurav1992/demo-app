// src/stores/auth.ts
import { Preferences } from '@capacitor/preferences'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function init() {
    const storedToken = await Preferences.get({ key: 'auth_token' })
    if (storedToken.value) {
      token.value = storedToken.value
      await fetchUserProfile()
    }
  }

  async function login(email: string, password: string) {
    try {
      loading.value = true
      // Replace with your actual API call
      const response = await fetch('YOUR_API_URL/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.message)
      
      token.value = data.token
      await Preferences.set({
        key: 'auth_token',
        value: data.token
      })
      
      await fetchUserProfile()
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    await Preferences.remove({ key: 'auth_token' })
  }

  async function fetchUserProfile() {
    if (!token.value) return
    
    try {
      // Replace with your actual API call
      const response = await fetch('YOUR_API_URL/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      
      user.value = data
    } catch (error) {
      await logout()
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      })
  
      if (!response.ok) {
        throw new Error('Password reset failed')
      }
  
      return true
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      loading.value = true
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send reset instructions')
      }

      return true
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    init,
    fetchUserProfile,
    resetPassword,
    forgotPassword
  }
})
