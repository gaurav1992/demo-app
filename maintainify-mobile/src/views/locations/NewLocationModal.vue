<!-- src/components/locations/NewLocationModal.vue -->
<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ mode === 'edit' ? 'Edit Location' : 'New Location' }}</ion-title>
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
          <ion-label position="stacked">Building*</ion-label>
          <ion-select 
            v-model="formData.buildingId"
            required
            placeholder="Select building"
          >
            <ion-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Location Name*</ion-label>
          <ion-input 
            v-model="formData.name"
            required
            placeholder="Enter location name"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Location Type*</ion-label>
          <ion-select 
            v-model="formData.type"
            required
            placeholder="Select type"
          >
            <ion-select-option v-for="type in locationTypes" :key="type" :value="type">
              {{ type }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <div class="form-actions">
          <ion-button type="submit" expand="block">
            {{ mode === 'edit' ? 'Update' : 'Create' }} Location
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-modal>
</template>
<!-- src/components/locations/NewLocationModal.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

interface Location {
  id?: number
  buildingId: number
  name: string
  type: string
}

const props = defineProps<{
  isOpen: boolean
  mode?: 'new' | 'edit'
  location?: Location | null
}>()

const emit = defineEmits(['close', 'save'])

// Location types
const locationTypes = ['Floor', 'Room', 'Area', 'Outdoors', 'General']

// Mock buildings data (replace with actual data from your API)
const buildings = ref([
  { id: 1, name: 'Building A' },
  { id: 2, name: 'Building B' },
  { id: 3, name: 'Building C' },
])

// Form data
const formData = ref({
  buildingId: '',
  name: '',
  type: ''
})

// Watch for location prop changes to update form data
watch(() => props.location, (newLocation) => {
  if (newLocation) {
    formData.value = {
      buildingId: newLocation.buildingId,
      name: newLocation.name,
      type: newLocation.type
    }
  }
}, { immediate: true })

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

// Methods
const resetForm = () => {
  formData.value = {
    buildingId: '',
    name: '',
    type: ''
  }
}

const validateForm = (): boolean => {
  return (
    formData.value.buildingId !== '' &&
    formData.value.name.trim() !== '' &&
    formData.value.type !== ''
  )
}

const handleSubmit = () => {
  if (!validateForm()) {
    // You might want to show an error message here
    return
  }

  const locationData = {
    ...formData.value,
    id: props.location?.id // Include the ID if editing
  }

  emit('save', locationData)
  resetForm()
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

.form-actions {
  margin-top: 24px;
}

/* Error state styles */
.error-message {
  color: var(--ion-color-danger);
  font-size: 12px;
  margin-top: 4px;
  margin-left: 16px;
}

.error-field {
  --background: var(--ion-color-danger-tint);
  --border-color: var(--ion-color-danger);
}

/* Optional: Add animation for modal */
ion-modal {
  --height: auto;
  --width: 100%;
  --max-width: 400px;
  --border-radius: 8px;
}

@media (max-width: 768px) {
  .form-content {
    padding: 16px;
  }

  ion-modal {
    --max-width: 100%;
    --height: 100%;
    --border-radius: 0;
  }
}
</style>
