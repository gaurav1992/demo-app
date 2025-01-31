<template>
  <ion-page id="main-content">
    <CommonHeader title="Buildings">
      <template #right-buttons>
        <ion-button @click="openNewBuildingModal">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
        </ion-button>
      </template>
    </CommonHeader>
    
    <ion-content>
      <div class="main-container">
        <ion-segment v-model="selectedTab">
          <ion-segment-button value="list">
            <ion-label>List View</ion-label>
          </ion-segment-button>
          <ion-segment-button value="performance">
            <ion-label>Performance</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div v-if="selectedTab === 'list'">
            <DataTable
                :columns="columns"
                :items="items"
                :filters="filters"
                :active-filters="tableState.filters"
                :search-query="tableState.searchQuery"
                :current-page="tableState.currentPage"
                :sort-column="tableState.sortColumn"
                :sort-direction="tableState.sortDirection"
                :show-actions="true"
                search-placeholder="Search..."
                @search="handleSearch"
                @filter="handleFilterChange"
                @clear-filters="clearFilters"
                @sort="handleSort"
                @page-change="handlePageChange"
                @action-click="handleActionClick"
                @row-click="handleRowClick"
            />
        </div>

        <div v-else>
          <div class="performance-container">
            <ion-select
              v-model="selectedBuilding"
              placeholder="Select Building"
              @ionChange="loadBuildingPerformance"
              class="building-select"
            >
              <ion-select-option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </ion-select-option>
            </ion-select>

            <div v-if="selectedBuilding" class="performance-metrics">
              <div class="metric-card">
                <h3>Total Tickets</h3>
                <p class="metric-value">{{ performanceData.totalTickets }}</p>
              </div>

              <div class="metric-card">
                <h3>Average Response Time</h3>
                <p class="metric-value">{{ performanceData.avgResponseTime }}</p>
              </div>

              <div class="metric-card">
                <h3>Completion Rate</h3>
                <p class="metric-value">{{ performanceData.completionRate }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <div class="footer-content">
          <span>Total Buildings: {{ buildings.length }}</span>
          <span>Active Tickets: {{ totalActiveTickets }}</span>
        </div>
      </ion-toolbar>
    </ion-footer>

    <!-- Modals -->
    <NewBuildingModal
      :is-open="showNewBuildingModal"
      :building="editingBuilding"
      :mode="modalMode"
      @close="closeNewBuildingModal"
      @save="saveNewBuilding"
    />

    <!-- Action Sidebar -->
        <ion-modal
            :is-open="showActionsSidebar"
            :breakpoints="[0, 1]"
            :initial-breakpoint="1"
            class="actions-sidebar"
            @didDismiss="closeActionsSidebar"
        >
            <ion-content>
            <div class="action-list">
                <ion-item button @click="viewBuilding">
                <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
                <ion-label>View Details</ion-label>
                </ion-item>

                <ion-item button @click="editBuilding">
                <ion-icon :icon="pencilOutline" slot="start"></ion-icon>
                <ion-label>Edit Building</ion-label>
                </ion-item>

                <ion-item button @click="confirmDelete" class="delete-action">
                <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                <ion-label>Delete Building</ion-label>
                </ion-item>
            </div>
            </ion-content>
        </ion-modal>

    <!-- Delete Confirmation Alert -->
    <ion-alert
      :is-open="showDeleteAlert"
      header="Confirm Delete"
      :message="`Are you sure you want to delete ${selectedBuilding?.name}?`"
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: deleteBuilding,
        },
      ]"
    ></ion-alert>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CommonHeader from '../common/Header.vue'
import NewBuildingModal from './NewBuildingModal.vue'
import DataTable from '../common/DataTable.vue'
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
  IonFooter,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonAlert,
  IonItem,
} from '@ionic/vue'
import {
  addOutline,
  closeOutline,
  eyeOutline,
  pencilOutline,
  trashOutline
} from 'ionicons/icons'

// Interfaces
interface Building {
  id: number
  name: string
  streetLine1: string
  streetLine2?: string
  city: string
  postcode: string
  country: string
  totalAssets: number
  activeTickets: number
}


// Helper function for sorting
const compareValues = (a: any, b: any, isAsc: boolean): number => {
  if (a === null || a === undefined) return isAsc ? 1 : -1
  if (b === null || b === undefined) return isAsc ? -1 : 1
  
  if (typeof a === 'string' && typeof b === 'string') {
    return isAsc ? a.localeCompare(b) : b.localeCompare(a)
  }
  
  if (typeof a === 'number' && typeof b === 'number') {
    return isAsc ? a - b : b - a
  }
  
  const aStr = String(a)
  const bStr = String(b)
  return isAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
}

// Table Configuration
const columns = [
  { key: 'name', label: 'Building Name' },
  { key: 'streetLine1', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'postcode', label: 'Postcode' },
  { key: 'country', label: 'Country' },
  { key: 'totalAssets', label: 'Total Assets' },
  { key: 'activeTickets', label: 'Active Tickets' }
]


// Constants
const cities = ['London', 'Manchester', 'Birmingham', 'Leeds']
const countries = ['United Kingdom', 'United States', 'Canada', 'Australia']

// Reactive State
const buildings = ref<Building[]>([])
const selectedTab = ref('list')
const selectedBuilding = ref<Building | null>(null)
const performanceData = ref({
  totalTickets: 0,
  avgResponseTime: '0h',
  completionRate: 0
})

// Table State
const tableState = ref({
  searchQuery: '',
  currentPage: 1,
  sortColumn: 'name',
  sortDirection: 'asc' as 'asc' | 'desc',
  filters: {
    city: '',
    country: ''
  }
})

// Modal State
const showNewBuildingModal = ref(false)
const showActionsSidebar = ref(false)
const showDeleteAlert = ref(false)
const editingBuilding = ref<Building | null>(null)
const modalMode = ref<'new' | 'edit'>('new')

// Computed Properties
const filteredItems = computed(() => {
  let items = [...buildings.value]
  
  if (tableState.value.searchQuery) {
    const query = tableState.value.searchQuery.toLowerCase()
    items = items.filter(building => 
      building.name.toLowerCase().includes(query) ||
      building.city.toLowerCase().includes(query) ||
      building.country.toLowerCase().includes(query)
    )
  }

  if (tableState.value.filters.city) {
    items = items.filter(building => building.city === tableState.value.filters.city)
  }
  if (tableState.value.filters.country) {
    items = items.filter(building => building.country === tableState.value.filters.country)
  }

  items.sort((a, b) => {
    const aValue = a[tableState.value.sortColumn as keyof Building]
    const bValue = b[tableState.value.sortColumn as keyof Building]
    return compareValues(
      aValue,
      bValue,
      tableState.value.sortDirection === 'asc'
    )
  })

  return items
})

const totalActiveTickets = computed(() => {
  return buildings.value.reduce((total, building) => total + building.activeTickets, 0)
})

const filters = [
  {
    key: 'city',
    placeholder: 'Filter by City',
    options: cities.values.map(city => ({ label: city, value: city }))
  },
  {
    key: 'country',
    placeholder: 'Filter by Country',
    options: countries.values.map(country => ({ label: country, value: country }))
  }
]

// Lifecycle Hooks
onMounted(() => {
  buildings.value = [
    {
      id: 1,
      name: 'Building A',
      streetLine1: '123 Main St',
      streetLine2: 'Suite 100',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom',
      totalAssets: 25,
      activeTickets: 5
    }
    // Add more mock buildings as needed
  ]
})

const handleSearch = (value: string) => {
  tableState.value.searchQuery = value
  tableState.value.currentPage = 1
}

const handleFilterChange = (key: string, value: any) => {
  tableState.value.filters[key as keyof typeof tableState.value.filters] = value
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
    city: '',
    country: ''
  }
  tableState.value.searchQuery = ''
  tableState.value.currentPage = 1
}

// Modal Handlers
const openNewBuildingModal = () => {
  modalMode.value = 'new'
  editingBuilding.value = null
  showNewBuildingModal.value = true
}

const closeNewBuildingModal = () => {
  showNewBuildingModal.value = false
  editingBuilding.value = null
}

const saveNewBuilding = (buildingData: any) => {
  console.log('New building data:', buildingData)
  closeNewBuildingModal()
}

// Navigation Methods
const openBuildingDetails = (building: Building) => {
  console.log('Opening building details:', building)
}

// Performance Methods
const loadBuildingPerformance = async () => {
  performanceData.value = {
    totalTickets: 150,
    avgResponseTime: '4h',
    completionRate: 92
  }
}

// Action Handlers
const toggleActionsSidebar = (building: Building) => {
  selectedBuilding.value = building
  showActionsSidebar.value = true
}

const closeActionsSidebar = () => {
  showActionsSidebar.value = false
  selectedBuilding.value = null
}

const viewBuilding = () => {
  if (selectedBuilding.value) {
    const building = buildings.value.find(b => b.id === selectedBuilding.value?.id)
    console.log('Viewing building:', building)
    // Add your view logic here
  }
  closeActionsSidebar()
}

const editBuilding = () => {
  if (selectedBuilding.value) {
    const building = buildings.value.find(b => b.id === selectedBuilding.value?.id)
    editingBuilding.value = building || null
    modalMode.value = 'edit'
    showNewBuildingModal.value = true
  }
  closeActionsSidebar()
}

const confirmDelete = () => {
  showDeleteAlert.value = true
  closeActionsSidebar()
}

const deleteBuilding = () => {
  if (selectedBuilding.value) {
    buildings.value = buildings.value.filter(b => b.id !== selectedBuilding.value?.id)
  }
  showDeleteAlert.value = false
}
</script>

<style scoped>
.main-container {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.performance-container {
   flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.building-select {
  max-width: 300px;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-card h3 {
  margin: 0 0 8px 0;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.metric-value {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}
.action-list {
  padding: 8px;
}

.action-list ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --border-radius: 8px;
  margin-bottom: 4px;
}

.action-list ion-item:last-child {
  margin-bottom: 0;
}

.delete-action {
  --highlight-color-focused: var(--ion-color-danger);
  color: var(--ion-color-danger);
}

.delete-action ion-icon {
  color: var(--ion-color-danger);
}
</style>
