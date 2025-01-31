<template>
    <ion-page>
    <CommonHeader title="My Jobs" />
      <ion-content>
        <div class="main-container">
          <!-- Search and Filter Section -->
          <div class="search-filter-container">
            <div class="search-row">
              <ion-searchbar
                v-model="searchQuery"
                placeholder="Search tickets..."
                @ionInput="handleSearch"
              ></ion-searchbar>
            </div>
            
            <div class="filters-row">
              <div class="filters-group">
                <ion-select
                  v-model="filters.location"
                  placeholder="Location"
                  @ionChange="handleFilters"
                  interface="popover"
                >
                  <ion-select-option v-for="location in locations" :key="location" :value="location">
                    {{ location }}
                  </ion-select-option>
                </ion-select>
  
                <ion-select
                  v-model="filters.asset"
                  placeholder="Asset"
                  @ionChange="handleFilters"
                  interface="popover"
                >
                  <ion-select-option v-for="asset in assets" :key="asset" :value="asset">
                    {{ asset }}
                  </ion-select-option>
                </ion-select>
  
                <ion-select
                  v-model="filters.category"
                  placeholder="Category"
                  @ionChange="handleFilters"
                  interface="popover"
                >
                  <ion-select-option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </ion-select-option>
                </ion-select>
              </div>
  
              <ion-button 
                v-if="hasActiveFilters"
                fill="clear"
                @click="clearFilters"
                class="clear-button"
              >
                <ion-icon :icon="closeCircleOutline" slot="start"></ion-icon>
                Clear
              </ion-button>
            </div>
          </div>
  
          <!-- Status Tabs -->
          <ion-segment v-model="selectedTab" @ionChange="handleTabChange" class="status-segment">
            <ion-segment-button value="open">
              <ion-label>Open Tickets</ion-label>
            </ion-segment-button>
            <ion-segment-button value="closed">
              <ion-label>Closed Tickets</ion-label>
            </ion-segment-button>
          </ion-segment>
  
          <!-- Table Container -->
          <div class="table-container">
            <table class="tickets-table">
              <thead>
                <tr>
                  <th v-for="column in columns" :key="column.key" @click="sortBy(column.key)">
                    {{ column.label }}
                    <ion-icon
                      v-if="sortColumn === column.key"
                      :icon="sortDirection === 'asc' ? arrowUp : arrowDown"
                      size="small"
                    ></ion-icon>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in paginatedTickets" :key="ticket.id">
                  <td>{{ formatDate(ticket.dueDate) }}</td>
                  <td>{{ ticket.ticketNumber }}</td>
                  <td>{{ ticket.frequency }}</td>
                  <td>{{ ticket.title }}</td>
                  <td>
                    <ion-badge :color="getPriorityColor(ticket.priority)">
                      {{ ticket.priority }}
                    </ion-badge>
                  </td>
                  <td>{{ ticket.building }}</td>
                  <td>{{ ticket.location }}</td>
                  <td>{{ ticket.assignedTo }}</td>
                  <td>{{ ticket.asset }}</td>
                  <td>{{ formatDate(ticket.lastUpdated) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Pagination -->
          <div class="pagination">
            <ion-button 
              fill="clear" 
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <ion-icon :icon="chevronBack"></ion-icon>
            </ion-button>
            
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            
            <ion-button 
              fill="clear" 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <ion-icon :icon="chevronForward"></ion-icon>
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CommonHeader from '../common/Header.vue'
import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon
} from '@ionic/vue'
import {
  arrowUp,
  arrowDown,
  chevronBack,
  chevronForward
} from 'ionicons/icons'

// Interfaces
interface Ticket {
  id: number;
  dueDate: string;
  ticketNumber: string;
  frequency: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  building: string;
  location: string;
  assignedTo: string;
  asset: string;
  lastUpdated: string;
  status: 'open' | 'closed';
  category: string;
}

interface Column {
  key: keyof Ticket;
  label: string;
}

interface Filters {
  location: string;
  asset: string;
  category: string;
}

// Constants
const locations = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5']
const assets = ['HVAC-001', 'HVAC-002', 'Elevator-001', 'Elevator-002', 'Generator-001']
const categories = ['Maintenance', 'Repair', 'Installation', 'Inspection', 'Emergency']

const columns: Column[] = [
  { key: 'dueDate', label: 'Due Date' },
  { key: 'ticketNumber', label: 'Ticket #' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'title', label: 'Title' },
  { key: 'priority', label: 'Priority' },
  { key: 'building', label: 'Building' },
  { key: 'location', label: 'Location' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'asset', label: 'Asset' },
  { key: 'lastUpdated', label: 'Last Updated' }
]

// Mock Data
const mockTickets: Ticket[] = [
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },
  {
    id: 1,
    dueDate: '2024-02-20',
    ticketNumber: 'TK-001',
    frequency: 'Weekly',
    title: 'HVAC Maintenance',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'HVAC-001',
    lastUpdated: '2024-02-15',
    status: 'open',
    category: 'Maintenance'
  },

  // Add more mock tickets as needed
]

// State
const selectedTab = ref<'open' | 'closed'>('open')
const searchQuery = ref('')
const filters = ref<Filters>({
  location: '',
  asset: '',
  category: ''
})
const sortColumn = ref<keyof Ticket>('dueDate')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const tickets = ref<Ticket[]>(mockTickets)

// Computed
const filteredTickets = computed(() => {
  let filtered = tickets.value.filter(ticket => 
    ticket.status === selectedTab.value &&
    (searchQuery.value === '' || 
      ticket.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )

  if (filters.value.location) {
    filtered = filtered.filter(ticket => ticket.location === filters.value.location)
  }
  if (filters.value.asset) {
    filtered = filtered.filter(ticket => ticket.asset === filters.value.asset)
  }
  if (filters.value.category) {
    filtered = filtered.filter(ticket => ticket.category === filters.value.category)
  }

  return filtered.sort((a, b) => {
    const aValue = a[sortColumn.value]
    const bValue = b[sortColumn.value]
    
    if (sortDirection.value === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })
})

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.value.location !== '' || 
         filters.value.asset !== '' || 
         filters.value.category !== ''
})

const totalPages = computed(() => 
  Math.ceil(filteredTickets.value.length / itemsPerPage.value)
)

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTickets.value.slice(start, end)
})

// Methods
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilters = () => {
  currentPage.value = 1
}

const handleTabChange = () => {
  currentPage.value = 1
}

const sortBy = (column: keyof Ticket) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return colors[priority.toLowerCase()] || 'medium'
}

// Method to clear all filters
const clearFilters = () => {
  filters.value = {
    location: '',
    asset: '',
    category: ''
  }
  handleFilters()
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

.search-filter-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-row {
  width: 100%;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filters-group {
  display: flex;
  gap: 16px;
  flex: 1;
}

ion-select {
  background: var(--ion-color-light);
  border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
}

.clear-button {
  --color: var(--ion-color-danger);
  white-space: nowrap;
}

.status-segment {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto;
  flex: 1;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.tickets-table th {
  background: var(--ion-color-light);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  position: sticky;
  top: 0;
}

.tickets-table td {
  padding: 12px;
  border-top: 1px solid var(--ion-color-light);
  white-space: nowrap;
}

.tickets-table tr:hover {
  background: var(--ion-color-light-tint);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-group {
    flex-direction: column;
  }

  .clear-button {
    align-self: flex-end;
  }
}
</style>