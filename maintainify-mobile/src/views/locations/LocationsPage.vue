<!-- src/views/LocationsPage.vue -->
<template>
  <ion-page id="main-content">
    <CommonHeader title="Locations">
      <template #right-buttons>
        <ion-button @click="openNewLocationModal" class="add-button">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
        </ion-button>
      </template>
    </CommonHeader>
    
    <ion-content>
      <div class="main-container">
        <DataTable
          :columns="columns"
          :items="filteredItems"
          :filters="tableFilters"
          :active-filters="tableState.filters"
          :search-query="tableState.searchQuery"
          :current-page="tableState.currentPage"
          :sort-column="tableState.sortColumn"
          :sort-direction="tableState.sortDirection"
          :show-actions="true"
          search-placeholder="Search locations..."
          @search="handleSearch"
          @filter="handleFilterChange"
          @clear-filters="clearFilters"
          @sort="handleSort"
          @page-change="handlePageChange"
          @action-click="toggleActionsSidebar"
        />
      </div>
    </ion-content>

    <!-- Footer -->
    <ion-footer>
      <ion-toolbar>
        <div class="footer-content">
          <span>Total Locations: {{ locations.length }}</span>
          <span>Active Tickets: {{ totalActiveTickets }}</span>
        </div>
      </ion-toolbar>
    </ion-footer>

    <!-- Actions Sidebar -->
    <ion-modal
      :is-open="showActionsSidebar"
      :breakpoints="[0, 1]"
      :initial-breakpoint="1"
      class="actions-sidebar"
      @didDismiss="closeActionsSidebar"
    >
      <ion-content>
        <div class="actions-content">
          <div class="actions-header">
            <h3>{{ selectedLocation?.name }}</h3>
            <ion-button fill="clear" @click="closeActionsSidebar">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
          
          <div class="actions-list">
            <ion-item button @click="viewLocation">
              <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
              <ion-label>View Details</ion-label>
            </ion-item>
            
            <ion-item button @click="editLocation">
              <ion-icon :icon="pencilOutline" slot="start"></ion-icon>
              <ion-label>Edit Location</ion-label>
            </ion-item>
            
            <ion-item button @click="confirmDelete" class="delete-action">
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              <ion-label>Delete Location</ion-label>
            </ion-item>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- New/Edit Location Modal -->
    <NewLocationModal
      :is-open="showLocationModal"
      :location="editingLocation"
      :mode="modalMode"
      @close="closeLocationModal"
      @save="saveLocation"
    />

    <!-- Delete Confirmation Alert -->
    <ion-alert
      :is-open="showDeleteAlert"
      header="Confirm Delete"
      :message="`Are you sure you want to delete ${selectedLocation?.name}?`"
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: deleteLocation,
        },
      ]"
    ></ion-alert>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CommonHeader from '../common/Header.vue'
import NewLocationModal from './NewLocationModal.vue'
import DataTable from '../common/DataTable.vue'

import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonFooter,
  IonToolbar,
  IonModal,
  IonItem,
  IonLabel,
  IonAlert
} from '@ionic/vue'
import {
  addOutline,
  closeOutline,
  eyeOutline,
  pencilOutline,
  trashOutline
} from 'ionicons/icons'

// Interfaces
interface Location {
  id: number
  building: string
  buildingId: number
  name: string
  type: string
  totalAssets: number
  activeTickets: number
}

interface Building {
  id: number
  name: string
}

// Constants
const locationTypes = ['Floor', 'Room', 'Area', 'Outdoors', 'General']

// Table Configuration
const columns = [
  { key: 'building', label: 'Building' },
  { key: 'name', label: 'Location Name' },
  { key: 'type', label: 'Type' },
  { key: 'totalAssets', label: 'Total Assets' },
  { key: 'activeTickets', label: 'Active Tickets' }
]

// Reactive State
const locations = ref<Location[]>([])
const buildings = ref<Building[]>([])

// Table State
const tableState = ref({
  searchQuery: '',
  currentPage: 1,
  sortColumn: 'name',
  sortDirection: 'asc' as 'asc' | 'desc',
  filters: {
    building: '',
    type: ''
  }
})

// Modal State
const showLocationModal = ref(false)
const showActionsSidebar = ref(false)
const showDeleteAlert = ref(false)
const selectedLocation = ref<Location | null>(null)
const editingLocation = ref<Location | null>(null)
const modalMode = ref<'new' | 'edit'>('new')

// Computed Properties
const filteredItems = computed(() => {
  let items = [...locations.value]
  
  // Apply search
  if (tableState.value.searchQuery) {
    const query = tableState.value.searchQuery.toLowerCase()
    items = items.filter(location => 
      location.name.toLowerCase().includes(query) ||
      location.building.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query)
    )
  }

  // Apply filters
  if (tableState.value.filters.building) {
    items = items.filter(location => 
      location.buildingId === tableState.value.filters.building
    )
  }
  if (tableState.value.filters.type) {
    items = items.filter(location => 
      location.type === tableState.value.filters.type
    )
  }

  // Apply sorting
  items.sort((a, b) => {
    const aValue = a[tableState.value.sortColumn as keyof Location]
    const bValue = b[tableState.value.sortColumn as keyof Location]
    if (tableState.value.sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  return items
})

const totalActiveTickets = computed(() => {
  return locations.value.reduce((total, location) => total + location.activeTickets, 0)
})

// Table Filters Configuration
const tableFilters = computed(() => [
  {
    key: 'building',
    placeholder: 'Filter by Building',
    options: buildings.value.map(b => ({ label: b.name, value: b.id }))
  },
  {
    key: 'type',
    placeholder: 'Filter by Type',
    options: locationTypes.map(type => ({ label: type, value: type }))
  }
])

// Lifecycle Hooks
onMounted(() => {
  // Simulate API call
  locations.value = [
    {
      id: 1,
      building: 'Building A',
      buildingId: 1,
      name: 'First Floor',
      type: 'Floor',
      totalAssets: 10,
      activeTickets: 2
    },
    {
      id: 2,
      building: 'Building B',
      buildingId: 2,
      name: 'Second Floor',
      type: 'Floor',
      totalAssets: 8,
      activeTickets: 1
    }
  ]

  buildings.value = [
    { id: 1, name: 'Building A' },
    { id: 2, name: 'Building B' }
  ]
})

// Table Event Handlers
const handleSearch = (value: string) => {
  tableState.value.searchQuery = value
  tableState.value.currentPage = 1
}

const handleFilterChange = (key: string, value: any) => {
  tableState.value.filters[key] = value
  tableState.value.currentPage = 1
}

const handleSort = (column: string) => {
  if (tableState.value.sortColumn === column) {
    tableState.value.sortDirection = tableState.value.sortDirection === 'asc' ? 'desc' : 'asc'
  } else {
    tableState.value.sortColumn = column
    tableState.value.sortDirection = 'asc'
  }
}

const handlePageChange = (page: number) => {
  tableState.value.currentPage = page
}

const clearFilters = () => {
  tableState.value.filters = {
    building: '',
    type: ''
  }
  tableState.value.searchQuery = ''
  tableState.value.currentPage = 1
}

// Modal Handlers
const openNewLocationModal = () => {
  modalMode.value = 'new'
  editingLocation.value = null
  showLocationModal.value = true
}

const closeLocationModal = () => {
  showLocationModal.value = false
  editingLocation.value = null
}

const saveLocation = (locationData: Partial<Location>) => {
  if (modalMode.value === 'edit' && editingLocation.value) {
    // Update existing location
    const index = locations.value.findIndex(loc => loc.id === editingLocation.value?.id)
    if (index !== -1) {
      locations.value[index] = {
        ...editingLocation.value,
        ...locationData
      }
    }
  } else {
    // Add new location
    const newLocation: Location = {
      id: locations.value.length + 1,
      building: buildings.value.find(b => b.id === locationData.buildingId)?.name || '',
      buildingId: locationData.buildingId || 0,
      name: locationData.name || '',
      type: locationData.type || '',
      totalAssets: 0,
      activeTickets: 0
    }
    locations.value.push(newLocation)
  }
  closeLocationModal()
}

// Action Sidebar Handlers
const toggleActionsSidebar = (location: Location) => {
  selectedLocation.value = location
  showActionsSidebar.value = true
}

const closeActionsSidebar = () => {
  showActionsSidebar.value = false
  selectedLocation.value = null
}

const viewLocation = () => {
  console.log('Viewing location:', selectedLocation.value)
  closeActionsSidebar()
}

const editLocation = () => {
  editingLocation.value = selectedLocation.value
  modalMode.value = 'edit'
  showLocationModal.value = true
  closeActionsSidebar()
}

const confirmDelete = () => {
  showDeleteAlert.value = true
  closeActionsSidebar()
}

const deleteLocation = () => {
  if (selectedLocation.value) {
    locations.value = locations.value.filter(loc => loc.id !== selectedLocation.value?.id)
  }
  showDeleteAlert.value = false
}
</script>



<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

/* If you have a container around DataTable, style it like this */
.table-section {
  flex: 1;
  min-height: 0; /* Add this */
  display: flex;
  flex-direction: column;
}
.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}
</style>
