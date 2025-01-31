<!-- src/views/auth/ResetPasswordPage.vue -->
<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="login-box">
          <!-- Logo and App Name -->
          <div class="logo-section">
            <img src="@/assets/logo.png" alt="Maintenify" class="app-logo" />
            <h1 class="app-name">Maintenify</h1>
            <p class="app-description">Reset your password</p>
          </div>

          <!-- Reset Password Form -->
          <form @submit.prevent="handleResetPassword">
            <ion-list>
              <ion-item>
                <ion-label position="floating">New Password</ion-label>
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :class="{ 'ion-invalid': errors.password }"
                >
                  <ion-button 
                    slot="end"
                    fill="clear"
                    @click="showPassword = !showPassword"
                  >
                    <ion-icon 
                      :icon="showPassword ? eyeOffOutline : eyeOutline"
                      slot="icon-only"
                    />
                  </ion-button>
                </ion-input>
                <ion-note slot="error" v-if="errors.password">
                  {{ errors.password }}
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Confirm Password</ion-label>
                <ion-input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  :class="{ 'ion-invalid': errors.confirmPassword }"
                >
                  <ion-button 
                    slot="end"
                    fill="clear"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <ion-icon 
                      :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
                      slot="icon-only"
                    />
                  </ion-button>
                </ion-input>
                <ion-note slot="error" v-if="errors.confirmPassword">
                  {{ errors.confirmPassword }}
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
              <span v-else>Reset Password</span>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
  IonIcon,
  toastController
} from '@ionic/vue'
import { eyeOutline, eyeOffOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { theme } from '@/theme/variables'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const resetToken = ref('')

const errors = reactive({
  password: '',
  confirmPassword: ''
})

onMounted(() => {
  // Get reset token from URL query parameter
  resetToken.value = route.query.token as string
  
  if (!resetToken.value) {
    router.push('/login')
    showError('Invalid or expired reset link')
  }
})

async function handleResetPassword() {
  // Reset errors
  errors.password = ''
  errors.confirmPassword = ''

  // Validate password
  if (!password.value) {
    errors.password = 'Password is required'
    return
  }
  if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    return
  }

  // Validate confirm password
  if (!confirmPassword.value) {
    errors.confirmPassword = 'Please confirm your password'
    return
  }
  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    // Call your reset password API
    await authStore.resetPassword(resetToken.value, password.value)
    
    const toast = await toastController.create({
      message: 'Password reset successful',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    })
    await toast.present()
    
    router.push('/login')
  } catch (error) {
    const toast = await toastController.create({
      message: error instanceof Error ? error.message : 'Password reset failed',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}

async function showError(message: string) {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color: 'danger',
    position: 'bottom'
  })
  await toast.present()
}
</script>

<style scoped>
/* Container styles */
.login-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: v-bind('theme.primary');
  padding: 20px;
}

.login-box {
  background: v-bind('theme.surface');
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
  color: v-bind('theme.textPrimary');
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

/* Form styles */
ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: v-bind('theme.background');
  --border-radius: 8px;
  margin-bottom: 16px;
  --color: v-bind('theme.textPrimary');
}

ion-label {
  --color: v-bind('theme.textSecondary');
}

/* Error styles */
ion-item.ion-invalid {
  --border-color: v-bind('theme.error');
}

ion-note[slot="error"] {
  color: v-bind('theme.error');
  font-size: 12px;
  margin-top: 4px;
}

/* Button styles */
.submit-button {
  margin-top: 24px;
  --background: v-bind('theme.primary');
  --background-activated: v-bind('theme.primaryDarken');
  --background-focused: v-bind('theme.primaryDarken');
  --background-hover: v-bind('theme.primaryDarken');
  --border-radius: 8px;
  --color: v-bind('theme.textLight');
}

/* Content background */
ion-content {
  --background: v-bind('theme.primary');
}

/* Password toggle button */
ion-button[fill="clear"] {
  --color: v-bind('theme.textSecondary');
}

/* Loading spinner */
ion-spinner {
  --color: v-bind('theme.textLight');
}

.app-description {
  color: v-bind('theme.textSecondary');
  font-size: 14px;
  margin: 8px 0 0 0;
}

.back-to-login {
  text-align: center;
  margin-top: 16px;
}

.back-to-login a {
  color: v-bind('theme.primary');
  text-decoration: none;
  font-size: 14px;
}

.back-to-login a:hover {
  text-decoration: underline;
}
</style>
