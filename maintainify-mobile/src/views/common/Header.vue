<template>
  <ion-header>
    <ion-toolbar :style="{ '--background': $theme.surface }">
      <ion-buttons slot="start">
        <ion-menu-button :style="{ '--color': $theme.primary }"></ion-menu-button>
      </ion-buttons>
      
      <ion-title :style="{ color: $theme.textPrimary }">{{ title }}</ion-title>
      
      <!-- Right side buttons slot -->
      <ion-buttons slot="end">
        <slot name="right-buttons"></slot>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton
} from '@ionic/vue'

defineProps<{
  title: string
}>()
</script>

<style scoped>
ion-toolbar {
  --padding-top: 8px;
  --padding-bottom: 8px;
  --min-height: 60px;
}

ion-title {
  font-size: 20px;
  font-weight: 600;
}
</style>
