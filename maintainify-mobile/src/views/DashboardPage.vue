<template>
    <ion-page>
      <ion-split-pane content-id="main-content">
        <!-- Side Menu -->
        <SideMenu />
  
        <!-- Main Content -->
        <ion-page id="main-content">
          <ion-content>
            <ion-tabs>
              <ion-router-outlet></ion-router-outlet>
              <ion-tab-bar slot="bottom" :style="{ '--background': $theme.surface }">
                <ion-tab-button tab="my-jobs" href="/dashboard/my-jobs">
                  <ion-icon :icon="briefcaseOutline"></ion-icon>
                  <ion-label>My Jobs</ion-label>
                </ion-tab-button>
  
                <ion-tab-button tab="ppm-tasks" href="/dashboard/ppm-tasks">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  <ion-label>PPM Tasks</ion-label>
                </ion-tab-button>
  
                <ion-tab-button tab="reactive-tasks" href="/dashboard/reactive-tasks">
                  <ion-icon :icon="flashOutline"></ion-icon>
                  <ion-label>Reactive Tasks</ion-label>
                </ion-tab-button>
              </ion-tab-bar>
            </ion-tabs>
          </ion-content>
        </ion-page>
      </ion-split-pane>
    </ion-page>
  </template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonMenuToggle,
  IonButtons,
  IonMenuButton,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonRouterOutlet
} from '@ionic/vue'
import {
  gridOutline,
  calendarOutline,
  buildOutline,
  briefcaseOutline,
  checkmarkCircleOutline,
  flashOutline
} from 'ionicons/icons'
import SideMenu from './common/SideMenu.vue'


const route = useRoute()

const isActive = (path: string) => {
  return route.path.startsWith(path)
}
</script>

<style scoped>
ion-tab-bar {
  border-top: 1px solid var(--ion-color-light-shade);
}

ion-tab-button {
  --color: var(--ion-color-medium);
  --color-selected: var(--theme-primary);
}

ion-tab-button.tab-selected {
  --color: var(--theme-primary);
}

ion-tab-button ion-icon {
  font-size: 24px;
}
</style>
