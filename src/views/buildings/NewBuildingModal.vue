<!-- src/views/buildings/NewBuildingModal.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: { name: string; city: string; country: string }): void;
}>();

const formData = ref({
  name: '',
  city: '',
  country: '',
});

const handleSave = () => {
  emit('save', { ...formData.value });
  formData.value = { name: '', city: '', country: '' }; // Reset form
};
</script>

<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>New Building</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Name</ion-label>
        <ion-input v-model="formData.name" required></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">City</ion-label>
        <ion-input v-model="formData.city" required></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Country</ion-label>
        <ion-input v-model="formData.country" required></ion-input>
      </ion-item>
      <ion-button expand="block" @click="handleSave" class="ion-margin-top">
        Save Building
      </ion-button>
    </ion-content>
  </ion-modal>
</template>


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
