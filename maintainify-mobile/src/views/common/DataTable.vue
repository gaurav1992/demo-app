<template>
    <div class="data-table-wrapper">
      <!-- Search and Filter Section -->
      <div class="search-filter-container">
        <div class="search-row">
          <ion-searchbar
            :value="searchQuery"
            :placeholder="searchPlaceholder"
            @ionInput="handleSearch"
          ></ion-searchbar>
        </div>
        
        <div class="filters-row" v-if="filters.length > 0">
          <div class="filters-group">
            <ion-select
              v-for="filter in filters"
              :key="filter.key"
              :value="activeFilters[filter.key]"
              :placeholder="filter.placeholder"
              @ionChange="(e) => handleFilterChange(filter.key, e)"
              class="filter-select"
            >
              <ion-select-option 
                v-for="option in filter.options" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </ion-select-option>
            </ion-select>
          </div>
  
          <ion-button 
            v-if="hasActiveFilters"
            fill="clear"
            @click="$emit('clear-filters')"
            class="clear-button"
          >
            <ion-icon :icon="closeCircleOutline" slot="start"></ion-icon>
            Clear
          </ion-button>
        </div>
      </div>
  
      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th 
                v-for="column in columns" 
                :key="column.key"
                @click="column.sortable !== false && handleSort(column.key)"
                :class="{ sortable: column.sortable !== false }"
              >
                {{ column.label }}
                <ion-icon
                  v-if="column.sortable !== false && sortColumn === column.key"
                  :icon="sortDirection === 'asc' ? arrowUp : arrowDown"
                  size="small"
                ></ion-icon>
              </th>
              <th v-if="showActions" class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in safeItems" 
              :key="item.id"
              @click="$emit('row-click', item)"
            >
              <td v-for="column in columns" :key="column.key">
                <slot :name="`column-${column.key}`" :item="item">
                  {{ item[column.key] }}
                </slot>
              </td>
              <td v-if="showActions" class="actions-cell">
                <slot name="actions" :item="item">
                  <ion-button 
                    fill="clear"
                    @click.stop="$emit('action-click', item)"
                  >
                    <ion-icon :icon="ellipsisVertical"></ion-icon>
                  </ion-button>
                </slot>
              </td>
            </tr>
            <tr v-if="safeItems.length === 0">
              <td :colspan="showActions ? columns.length + 1 : columns.length" class="no-data">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination -->
      <div class="pagination">
        <ion-button 
          fill="clear" 
          :disabled="currentPage === 1"
          @click="$emit('page-change', currentPage - 1)"
        >
          <ion-icon :icon="chevronBack"></ion-icon>
        </ion-button>
        
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        
        <ion-button 
          fill="clear" 
          :disabled="currentPage === totalPages"
          @click="$emit('page-change', currentPage + 1)"
        >
          <ion-icon :icon="chevronForward"></ion-icon>
        </ion-button>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
} from '@ionic/vue'
import {
  arrowUp,
  arrowDown,
  chevronBack,
  chevronForward,
  closeCircleOutline,
  ellipsisVertical,
} from 'ionicons/icons'
import { SearchbarCustomEvent, SelectCustomEvent } from '@ionic/vue'

// Define interfaces for better type safety and reusability
interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface FilterOption {
  label: string
  value: any
}

interface Filter {
  key: string
  placeholder: string
  options: FilterOption[]
}

interface TableItem {
  id: string | number
  [key: string]: any
}

// Props interface
interface Props {
  columns: Column[]
  items: TableItem[]
  filters: Filter[]
  activeFilters: Record<string, any>
  searchQuery: string
  currentPage: number
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  showActions?: boolean
  searchPlaceholder?: string
  itemsPerPage?: number
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  showActions: false,
  searchPlaceholder: 'Search...'
})

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.itemsPerPage)
})

const safeItems = computed((): TableItem[] => {
  return props.items || []
})

const hasActiveFilters = computed(() => {
  return Object.values(props.activeFilters).some(value => value !== '') || props.searchQuery !== ''
})

// Define emits
const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'filter', key: string, value: any): void
  (e: 'clear-filters'): void
  (e: 'sort', column: string): void
  (e: 'page-change', page: number): void
  (e: 'row-click', item: TableItem): void
  (e: 'action-click', item: TableItem): void
}>()

// Event handlers with proper typing
const handleSearch = (event: SearchbarCustomEvent) => {
  const value = event.detail.value
  if (value !== undefined && value !== null) {
    emit('search', value)
  }
}

const handleFilterChange = (key: string, event: SelectCustomEvent) => {
  emit('filter', key, event.detail.value)
}

const handleSort = (column: string) => {
  emit('sort', column)
}
</script>

<style scoped>
.data-table-wrapper {
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

.filter-select {
  flex: 1;
  max-width: 200px;
}

.clear-button {
  --color: var(--ion-color-danger);
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto;
  flex: 1;
  min-height: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th {
  background: var(--ion-color-light);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table th.sortable {
  cursor: pointer;
}

.data-table td {
  padding: 12px 16px;
  border-top: 1px solid var(--ion-color-light);
}

.data-table tbody tr {
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background: var(--ion-color-light-tint);
}

.actions-column {
  width: 80px;
  text-align: center;
}

.actions-cell {
  text-align: center;
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

  .filter-select {
    max-width: 100%;
  }

  .clear-button {
    align-self: flex-end;
  }
}

.no-data {
  text-align: center;
  padding: 2rem !important;
  color: var(--ion-color-medium);
}
</style>
