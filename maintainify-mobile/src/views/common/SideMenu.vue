<!-- src/components/common/SideMenu.vue -->
<template>
  <ion-menu content-id="main-content">
    <ion-content>
      <!-- Logo Section -->
      <div class="menu-header">
        <img src="@/assets/logo.png" alt="Maintenify" class="menu-logo" />
        <h2 class="menu-app-name">Maintenify</h2>
      </div>

      <ion-list lines="none" class="menu-list">
        <ion-menu-toggle auto-hide="false">
          <!-- Dashboard -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/dashboard') }"
            router-link="/dashboard/my-jobs"
            class="menu-item"
          >
            <ion-icon :icon="gridOutline" slot="start"></ion-icon>
            <ion-label>Dashboard</ion-label>
          </ion-item>

          <!-- Calendar -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/calendar') }"
            router-link="/calendar"
            class="menu-item"
          >
            <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
            <ion-label>Calendar</ion-label>
          </ion-item>

          <!-- Assets -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/assets') }"
            router-link="/assets"
            class="menu-item"
          >
            <ion-icon :icon="buildOutline" slot="start"></ion-icon>
            <ion-label>Assets</ion-label>
          </ion-item>

          <!-- Buildings -->
            <ion-item 
            :class="{ 'menu-item-active': isActive('/buildings') }"
            router-link="/buildings"
            class="menu-item"
            >
            <ion-icon :icon="businessOutline" slot="start"></ion-icon>
            <ion-label>Buildings</ion-label>
            </ion-item>
    
          <!-- Locations -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/locations') }"
            router-link="/locations"
            class="menu-item"
          >
            <ion-icon :icon="locationOutline" slot="start"></ion-icon>
            <ion-label>Locations</ion-label>
          </ion-item>

          <!-- Reports -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/reports') }"
            router-link="/reports"
            class="menu-item"
          >
            <ion-icon :icon="barChartOutline" slot="start"></ion-icon>
            <ion-label>Reports</ion-label>
          </ion-item>

          <!-- Settings Section -->
          <ion-item-divider class="menu-divider">
            <ion-label>Settings</ion-label>
          </ion-item-divider>

          <!-- Team Management -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/team') }"
            router-link="/team"
            class="menu-item"
          >
            <ion-icon :icon="peopleOutline" slot="start"></ion-icon>
            <ion-label>Team Management</ion-label>
          </ion-item>

          <!-- Categories -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/categories') }"
            router-link="/categories"
            class="menu-item"
          >
            <ion-icon :icon="listOutline" slot="start"></ion-icon>
            <ion-label>Categories</ion-label>
          </ion-item>

          <!-- Profile Section -->
          <ion-item-divider class="menu-divider">
            <ion-label>Account</ion-label>
          </ion-item-divider>

          <!-- Profile -->
          <ion-item 
            :class="{ 'menu-item-active': isActive('/profile') }"
            router-link="/profile"
            class="menu-item"
          >
            <ion-icon :icon="personOutline" slot="start"></ion-icon>
            <ion-label>Profile</ion-label>
          </ion-item>

          <!-- Logout -->
          <ion-item 
            button
            @click="handleLogout"
            class="menu-item logout-item"
          >
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            <ion-label>Logout</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonIcon,
  IonMenuToggle,
} from '@ionic/vue'
import {
  gridOutline,
  calendarOutline,
  buildOutline,
  barChartOutline,
  peopleOutline,
  locationOutline,
  listOutline,
  personOutline,
  logOutOutline,
  businessOutline,
} from 'ionicons/icons'

const route = useRoute()
const router = useRouter()

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  // Add your logout logic here
  // For example:
  // await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.menu-header {
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--theme-surface);
}

.menu-logo {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
  border-radius: 12px;
}

.menu-app-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-primary-text);
  text-transform: uppercase;
}

.menu-list {
  background: transparent;
  padding: 0;
}

.menu-divider {
  margin-top: 16px;
  font-size: 14px;
  text-transform: uppercase;
  --background: transparent;
  --padding-start: 24px;
  --padding-top: 24px;
  --padding-bottom: 8px;
  --color: var(--ion-color-medium);
}

.menu-item {
  --padding-start: 24px;
  --padding-end: 24px;
  --padding-top: 2px;
  --padding-bottom: 2px;
  --background: transparent;
  --background-hover: rgba(var(--ion-color-primary-rgb), 0.1);
  margin: 4px 16px;
  border-radius: 8px;
  --border-radius: 8px;
}

.menu-item ion-icon {
  color: var(--ion-color-medium);
  margin-right: 16px;
  font-size: 20px;
}

.menu-item ion-label {
  font-weight: 500;
  color: var(--ion-color-dark);
}

.menu-item-active {
  --background: var(--theme-primary);
  --background-hover: var(--theme-primary);
}

.menu-item-active ion-icon,
.menu-item-active ion-label {
  color: var(--ion-color-primary-contrast) !important;
}


.logout-item {
  margin-top: 8px;
  --background-hover: rgba(var(--ion-color-danger-rgb), 0.1);
}

.logout-item ion-icon,
.logout-item ion-label {
  color: var(--ion-color-danger);
}

@media (max-width: 768px) {
  .menu-item {
    margin: 2px 8px;
    --padding-start: 16px;
    --padding-end: 16px;
  }
}
</style>
