<template>
  <ion-page id="main-content">
    <CommonHeader title="Assets">
      <template #right-buttons>
        <ion-button @click="openNewAssetModal">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
        </ion-button>
      </template>
    </CommonHeader>
    
    <ion-content>
      <div class="main-container">
        <div class="table-section">
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
            search-placeholder="Search assets..."
            @search="handleSearch"
            @filter="handleFilterChange"
            @clear-filters="clearFilters"
            @sort="handleSort"
            @page-change="handlePageChange"
            @action-click="toggleActionsSidebar"
          />
        </div>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <div class="footer-content">
          <span>Total Assets: {{ assets.length }}</span>
          <span>Active Tickets: {{ totalActiveTickets }}</span>
        </div>
      </ion-toolbar>
    </ion-footer>

    <!-- New Asset Modal -->
    <ion-modal :is-open="showNewAssetModal" @didDismiss="closeNewAssetModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ modalMode === 'new' ? 'New Asset' : 'Edit Asset' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeNewAssetModal">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <form @submit.prevent="saveAsset" class="form-content">
          <ion-item>
            <ion-label position="stacked">Asset Name</ion-label>
            <ion-input v-model="newAsset.name" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Asset Type</ion-label>
            <ion-select v-model="newAsset.relationType" @ionChange="handleRelationTypeChange">
              <ion-select-option value="building">Building Asset</ion-select-option>
              <ion-select-option value="location">Location Asset</ion-select-option>
              <ion-select-option value="asset">Sub-Asset</ion-select-option>
            </ion-select>
          </ion-item>

          <!-- Dynamic relation dropdown based on type -->
          <ion-item v-if="newAsset.relationType">
            <ion-label position="stacked">
              {{ getRelationLabel(newAsset.relationType) }}
            </ion-label>
            <ion-select v-model="newAsset.relationId">
              <ion-select-option 
                v-for="item in getRelationOptions()" 
                :key="item.id" 
                :value="item.id"
              >
                {{ item.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Status</ion-label>
            <ion-select v-model="newAsset.status">
              <ion-select-option value="in-use">In Use</ion-select-option>
              <ion-select-option value="not-in-use">Not In Use</ion-select-option>
            </ion-select>
          </ion-item>

          <div class="form-buttons">
            <ion-button type="submit" expand="block">
              {{ modalMode === 'new' ? 'Create Asset' : 'Update Asset' }}
            </ion-button>
          </div>
        </form>
      </ion-content>
    </ion-modal>

    <!-- Action Sidebar -->
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
            <h3>{{ selectedAsset?.name }}</h3>
            <ion-button fill="clear" @click="closeActionsSidebar">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
          
          <div class="actions-list">
            <ion-item button @click="viewAsset">
              <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
              <ion-label>View Details</ion-label>
            </ion-item>
            
            <ion-item button @click="editAsset">
              <ion-icon :icon="pencilOutline" slot="start"></ion-icon>
              <ion-label>Edit Asset</ion-label>
            </ion-item>
            
            <ion-item button @click="confirmDelete" class="delete-action">
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              <ion-label>Delete Asset</ion-label>
            </ion-item>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Delete Confirmation Alert -->
    <ion-alert
      :is-open="showDeleteAlert"
      header="Confirm Delete"
      :message="`Are you sure you want to delete ${selectedAsset?.name}?`"
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: deleteAsset,
        },
      ]"
    ></ion-alert>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CommonHeader from './common/Header.vue'
import DataTable from './common/DataTable.vue'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonFooter,
  IonToolbar,
  IonModal,
  IonHeader,
  IonTitle,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
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
interface Asset {
  id: number
  name: string
  relationType: 'building' | 'location' | 'asset'
  relationId: number
  relationName: string
  status: 'in-use' | 'not-in-use'
  activeTickets: number
}

// Mock data for relations
const buildings = ref([
  { id: 1, name: 'Building A' },
  { id: 2, name: 'Building B' }
])

const locations = ref([
  { id: 1, name: 'First Floor' },
  { id: 2, name: 'Second Floor' }
])

// Table Configuration
const columns = [
  { key: 'name', label: 'Asset Name' },
  { key: 'relationName', label: 'Related To' },
  { key: 'status', label: 'Status' },
  { key: 'activeTickets', label: 'Active Tickets' }
]

// Reactive State
const assets = ref<Asset[]>([])
const showNewAssetModal = ref(false)
const showActionsSidebar = ref(false)
const showDeleteAlert = ref(false)
const selectedAsset = ref<Asset | null>(null)
const modalMode = ref<'new' | 'edit'>('new')

// New Asset Form State
const newAsset = ref({
  name: '',
  relationType: '' as 'building' | 'location' | 'asset',
  relationId: null as number | null,
  status: 'in-use' as 'in-use' | 'not-in-use'
})

// Table State
const tableState = ref({
  searchQuery: '',
  currentPage: 1,
  sortColumn: 'name',
  sortDirection: 'asc' as 'asc' | 'desc',
  filters: {
    relationType: '',
    status: '',
  } as { [key: string]: string }
})

// Computed Properties
const filteredItems = computed(() => {
  let items = [...assets.value]
  
  if (tableState.value.searchQuery) {
    const query = tableState.value.searchQuery.toLowerCase()
    items = items.filter(asset => 
      asset.name.toLowerCase().includes(query) ||
      asset.relationName.toLowerCase().includes(query)
    )
  }

  if (tableState.value.filters.relationType) {
    items = items.filter(asset => asset.relationType === tableState.value.filters.relationType)
  }
  if (tableState.value.filters.status) {
    items = items.filter(asset => asset.status === tableState.value.filters.status)
  }

  return items
})

const totalActiveTickets = computed(() => {
  return assets.value.reduce((total, asset) => total + asset.activeTickets, 0)
})

const tableFilters = computed(() => [
  {
    key: 'relationType',
    placeholder: 'Filter by Type',
    options: [
      { label: 'Building Asset', value: 'building' },
      { label: 'Location Asset', value: 'location' },
      { label: 'Sub-Asset', value: 'asset' }
    ]
  },
  {
    key: 'status',
    placeholder: 'Filter by Status',
    options: [
      { label: 'In Use', value: 'in-use' },
      { label: 'Not In Use', value: 'not-in-use' }
    ]
  }
])

// Methods
const getRelationLabel = (type: string) => {
  switch (type) {
    case 'building': return 'Select Building'
    case 'location': return 'Select Location'
    case 'asset': return 'Select Parent Asset'
    default: return ''
  }
}

const getRelationOptions = () => {
  switch (newAsset.value.relationType) {
    case 'building': return buildings.value
    case 'location': return locations.value
    case 'asset': return assets.value
    default: return []
  }
}

const handleRelationTypeChange = () => {
  newAsset.value.relationId = null
}

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
    relationType: '',
    status: ''
  }
  tableState.value.searchQuery = ''
  tableState.value.currentPage = 1
}

// Modal Handlers
const openNewAssetModal = () => {
  modalMode.value = 'new'
  newAsset.value = {
    name: '',
    relationType: '' as 'building' | 'location' | 'asset',
    relationId: null,
    status: 'in-use'
  }
  showNewAssetModal.value = true
}

const closeNewAssetModal = () => {
  showNewAssetModal.value = false
}

const saveAsset = () => {
  // Add your save logic here
  console.log('Saving asset:', newAsset.value)
  closeNewAssetModal()
}

// Action Handlers
const toggleActionsSidebar = (asset: Asset) => {
  selectedAsset.value = asset
  showActionsSidebar.value = true
}

const closeActionsSidebar = () => {
  showActionsSidebar.value = false
  selectedAsset.value = null
}

const viewAsset = () => {
  console.log('Viewing asset:', selectedAsset.value)
  closeActionsSidebar()
}

const editAsset = () => {
  if (selectedAsset.value) {
    modalMode.value = 'edit'
    newAsset.value = { ...selectedAsset.value }
    showNewAssetModal.value = true
  }
  closeActionsSidebar()
}

const confirmDelete = () => {
  showDeleteAlert.value = true
  closeActionsSidebar()
}

const deleteAsset = () => {
  if (selectedAsset.value) {
    assets.value = assets.value.filter(a => a.id !== selectedAsset.value?.id)
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

.table-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}

.form-content {
  padding: 16px;
}

.form-buttons {
  margin-top: 24px;
}

.actions-content {
  padding: 16px;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.actions-header h3 {
  margin: 0;
}

.actions-list ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --border-radius: 8px;
  margin-bottom: 4px;
}

.delete-action {
  --highlight-color-focused: var(--ion-color-danger);
  color: var(--ion-color-danger);
}

.delete-action ion-icon {
  color: var(--ion-color-danger);
}
</style>
