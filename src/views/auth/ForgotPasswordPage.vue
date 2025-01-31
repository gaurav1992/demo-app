<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="login-box">
          <!-- Logo and App Name -->
          <div class="logo-section">
            <img src="@/assets/logo.png" alt="Maintenify" class="app-logo" />
            <h1 class="app-name">Forgot Password</h1>
            <p class="app-description">Enter your email to receive password reset instructions</p>
          </div>

          <!-- Forgot Password Form -->
          <form @submit.prevent="handleForgotPassword">
            <ion-list>
              <ion-item>
                <ion-label position="floating">Email</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  required
                  :class="{ 'ion-invalid': error }"
                />
                <ion-note slot="error" v-if="error">
                  {{ error }}
                </ion-note>
              </ion-item>
            </ion-list>

            <ion-button
              type="submit"
              expand="block"
              class="submit-button"
              :disabled="loading"
            >
              <ion-spinner v-if="loading" name="crescent" />
              <span v-else>Send Reset Instructions</span>
            </ion-button>

            <div class="back-to-login">
              <router-link to="/login">Back to Login</router-link>
            </div>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonNote,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { theme } from '@/theme/variables'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const error = ref('')
const loading = ref(false)

async function handleForgotPassword() {
  if (!email.value) {
    error.value = 'Email is required'
    return
  }

  try {
    loading.value = true
    await authStore.forgotPassword(email.value)
    
    const toast = await toastController.create({
      message: 'Password reset instructions have been sent to your email',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    })
    await toast.present()
    
    router.push('/login')
  } catch (err) {
    const toast = await toastController.create({
      message: err instanceof Error ? err.message : 'Failed to send reset instructions',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Container styles */
.login-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: v-bind('$theme.primary');
  padding: 20px;
}

.login-box {
  background: v-bind('$theme.surface');
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Logo section */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.app-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.app-name {
  color: v-bind('$theme.textPrimary');
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.app-description {
  color: v-bind('$theme.textSecondary');
  font-size: 14px;
  margin: 8px 0 0 0;
}

/* Form styles */
ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: v-bind('$theme.background');
  --border-radius: 8px;
  margin-bottom: 16px;
  --color: v-bind('$theme.textPrimary');
}

ion-label {
  --color: v-bind('$theme.textSecondary');
}

/* Error styles */
ion-item.ion-invalid {
  --border-color: v-bind('$theme.error');
}

ion-note[slot="error"] {
  color: v-bind('$theme.error');
  font-size: 12px;
  margin-top: 4px;
}

/* Button styles */
.submit-button {
  margin-top: 24px;
  --background: v-bind('$theme.primary');
  --background-activated: v-bind('$theme.primaryDarken');
  --background-focused: v-bind('$theme.primaryDarken');
  --background-hover: v-bind('$theme.primaryDarken');
  --border-radius: 8px;
  --color: v-bind('$theme.textLight');
}

/* Content background */
ion-content {
  --background: v-bind('$theme.primary');
}

/* Back to login link */
.back-to-login {
  text-align: center;
  margin-top: 16px;
}

.back-to-login a {
  color: v-bind('$theme.primary');
  text-decoration: none;
  font-size: 14px;
}

.back-to-login a:hover {
  text-decoration: underline;
}

/* Loading spinner */
ion-spinner {
  --color: v-bind('$theme.textLight');
}
</style>