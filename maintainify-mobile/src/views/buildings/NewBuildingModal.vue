<!-- src/components/buildings/NewBuildingModal.vue -->
<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>New Building</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form @submit.prevent="handleSubmit" class="form-content">
        <ion-item>
          <ion-label position="stacked">Building Name*</ion-label>
          <ion-input 
            v-model="formData.name"
            required
            placeholder="Enter building name"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Street Line 1*</ion-label>
          <ion-input 
            v-model="formData.streetLine1"
            required
            placeholder="Enter street address"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Street Line 2</ion-label>
          <ion-input 
            v-model="formData.streetLine2"
            placeholder="Enter additional address info"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">City*</ion-label>
          <ion-input 
            v-model="formData.city"
            required
            placeholder="Enter city"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Postcode*</ion-label>
          <ion-input 
            v-model="formData.postcode"
            required
            placeholder="Enter postcode"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Country*</ion-label>
          <ion-select 
            v-model="formData.country"
            required
            placeholder="Select country"
          >
            <ion-select-option v-for="country in countries" :key="country" :value="country">
              {{ country }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <div class="form-actions">
          <ion-button type="submit" expand="block">
            Create Building
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'save'])

const formData = ref({
  name: '',
  streetLine1: '',
  streetLine2: '',
  city: '',
  postcode: '',
  country: ''
})

// Mock data (replace with actual data)
const countries = ['United Kingdom', 'United States', 'Canada', 'Australia']

const handleSubmit = () => {
  emit('save', formData.value)
  resetForm()
  emit('close')
}

const resetForm = () => {
  formData.value = {
    name: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    postcode: '',
    country: ''
  }
}

const close = () => {
  resetForm()
  emit('close')
}
</script>

<style scoped>
.form-content {
  padding: 20px;
}

.form-actions {
  margin-top: 24px;
}

ion-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

ion-label {
  margin-bottom: 8px;
}

ion-input, ion-select {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --background: var(--ion-color-light);
  --border-radius: 8px;
}
</style>
