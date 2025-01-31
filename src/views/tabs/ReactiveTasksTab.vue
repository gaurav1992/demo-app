<!-- ReactiveTicketsTab.vue -->
<template>
  <ion-page>
    <!-- Using Common Header -->
    <CommonHeader title="Reactive Tickets">
      <!-- Adding the New Ticket button in header -->
      <template #right-buttons>
        <ion-button @click="openNewTicketModal" class="add-button">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
          New Ticket
        </ion-button>
      </template>
    </CommonHeader>
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

    <!-- New Ticket Modal -->
    <NewTicketModal 
      :is-open="showNewTicketModal"
      @close="closeNewTicketModal"
      @save="saveNewTicket"
    />
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
  addOutline,
  arrowUp,
  arrowDown,
  chevronBack,
  chevronForward,
  closeCircleOutline
} from 'ionicons/icons'
import NewTicketModal from './NewTicketModal.vue'

// Table columns configuration
const columns = [
  { key: 'dueDate', label: 'Due Date' },
  { key: 'ticketNumber', label: 'Ticket #' },
  { key: 'title', label: 'Title' },
  { key: 'priority', label: 'Priority' },
  { key: 'building', label: 'Building' },
  { key: 'location', label: 'Location' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'asset', label: 'Asset' },
  { key: 'lastUpdated', label: 'Last Updated' }
]

// Reactive references
const searchQuery = ref('')
const selectedTab = ref('open')
const currentPage = ref(1)
const sortColumn = ref('dueDate')
const sortDirection = ref('asc')
const showNewTicketModal = ref(false)

const filters = ref({
  location: '',
  asset: '',
  category: ''
})

// Mock data (replace with actual data from your API)
const locations = ['Location 1', 'Location 2', 'Location 3']
const assets = ['Asset 1', 'Asset 2', 'Asset 3']
const categories = ['Category 1', 'Category 2', 'Category 3']

// Sample tickets data (replace with actual data)
const tickets = ref([
  {
    id: 1,
    dueDate: '2024-02-01',
    ticketNumber: 'RT-001',
    title: 'Fix AC',
    priority: 'high',
    building: 'Building A',
    location: 'Floor 1',
    assignedTo: 'John Doe',
    asset: 'AC Unit 1',
    lastUpdated: '2024-01-30'
  },
  // Add more ticket objects...
])

// Computed properties
const hasActiveFilters = computed(() => {
  return filters.value.location !== '' || 
         filters.value.asset !== '' || 
         filters.value.category !== ''
})

const filteredTickets = computed(() => {
  let filtered = [...tickets.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(ticket => 
      ticket.title.toLowerCase().includes(query) ||
      ticket.ticketNumber.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  filtered = filtered.filter(ticket => {
    // Add your status filtering logic here
    return true
  })

  // Apply other filters
  if (filters.value.location) {
    filtered = filtered.filter(ticket => ticket.location === filters.value.location)
  }
  if (filters.value.asset) {
    filtered = filtered.filter(ticket => ticket.asset === filters.value.asset)
  }
  if (filters.value.category) {
    filtered = filtered.filter(ticket => ticket.category === filters.value.category)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortColumn.value]
    const bValue = b[sortColumn.value]
    if (sortDirection.value === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  return filtered
})

const paginatedTickets = computed(() => {
  const perPage = 10
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return filteredTickets.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTickets.value.length / 10)
})

// Methods
const handleSearch = (event: CustomEvent) => {
  searchQuery.value = event.detail.value
  currentPage.value = 1
}

const handleFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    location: '',
    asset: '',
    category: ''
  }
  handleFilters()
}

const handleTabChange = () => {
  currentPage.value = 1
}

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'medium'
  }
}

// Modal methods
const openNewTicketModal = () => {
  showNewTicketModal.value = true
}

const closeNewTicketModal = () => {
  showNewTicketModal.value = false
}

const saveNewTicket = (ticketData: any) => {
  // Handle saving the new ticket
  console.log('New ticket data:', ticketData)
  // Add your save logic here
  closeNewTicketModal()
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
  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

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

  .table-container {
    margin: 0 -16px;
    border-radius: 0;
  }
}
</style>
