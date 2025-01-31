<!-- App.vue or your main layout component -->
<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <!-- Side Menu -->
      <SideMenu />
      
      <!-- Main Content -->
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonSplitPane, IonRouterOutlet } from '@ionic/vue'
import SideMenu from './views/common/SideMenu.vue'
</script>
