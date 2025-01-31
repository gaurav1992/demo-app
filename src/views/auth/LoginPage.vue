<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="login-container">
          <div class="login-box">
            <!-- Logo and App Name -->
            <div class="logo-section">
              <img src="@/assets/logo.png" alt="Maintenify" class="app-logo" />
              <h1 class="app-name">Maintenify</h1>
              <p class="app-description">Streamline your maintenance operations with ease</p>
            </div>
  
            <!-- Login Form -->
            <form @submit.prevent="handleLogin">
              <ion-list>
                <ion-item>
                  <ion-label position="floating">Email</ion-label>
                  <ion-input
                    v-model="email"
                    type="email"
                    required
                    :class="{ 'ion-invalid': errors.email }"
                  />
                  <ion-note slot="error" v-if="errors.email">
                    {{ errors.email }}
                  </ion-note>
                </ion-item>
  
                <ion-item>
                  <ion-label position="floating">Password</ion-label>
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
              </ion-list>
  
              <ion-button
                type="submit"
                expand="block"
                class="submit-button"
                :disabled="loading"
              >
                <ion-spinner v-if="loading" name="crescent" />
                <span v-else>Sign In</span>
              </ion-button>
  
              <div class="forgot-password-link">
                <router-link to="/forgot-password">Forgot Password?</router-link>
              </div>
            </form>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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
  IonIcon,
  toastController
} from '@ionic/vue'
import { eyeOutline, eyeOffOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { theme } from '@/theme/variables'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errors = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  errors.email = ''
  errors.password = ''

  if (!email.value) {
    errors.email = 'Email is required'
    return
  }
  if (!password.value) {
    errors.password = 'Password is required'
    return
  }

  try {
    loading.value = true
    await authStore.login(email.value, password.value)
    localStorage.setItem('user-token', 'your-auth-token')
    router.replace('/dashboard/my-jobs')
  } catch (error) {
    const toast = await toastController.create({
      message: error instanceof Error ? error.message : 'Login failed',
      duration: 2000,
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
  color: v-bind('theme.textPrimary'); /* Black text for app name on white background */
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
  --color: v-bind('theme.textPrimary'); /* Black text for inputs */
}

ion-label {
  --color: v-bind('theme.textSecondary'); /* Grey text for labels */
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
  --color: v-bind('theme.textLight'); /* White text for primary colored button */
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
  --color: v-bind('theme.textLight'); /* White spinner on primary button */
}

.app-description {
  color: v-bind('theme.textSecondary');
  font-size: 14px;
  margin: 8px 0 0 0;
}

.forgot-password-link {
  text-align: center;
  margin-top: 16px;
}

.forgot-password-link a {
  color: v-bind('theme.primary');
  text-decoration: none;
  font-size: 14px;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}
</style>