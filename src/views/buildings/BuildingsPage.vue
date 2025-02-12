<!-- src/views/buildings/BuildingsPage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { useBuildingsStore, type Building } from '@/stores/buildings';
import CommonHeader from '../common/Header.vue';
import DataTable from '@/views/common/DataTable.vue';
import NewBuildingModal from './NewBuildingModal.vue';
import type { Column, Filter } from '@/types/table';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const { showToast } = useToast();
const buildingsStore = useBuildingsStore();

// Table state
const showNewBuildingModal = ref(false);

// Table configuration
const columns = ref<Column[]>([
  { key: 'name', label: 'Name', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'country', label: 'Country', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true }
]);

// Cities and countries sets
const cities = computed(() => 
  new Set(buildingsStore.buildings.map(b => b.city))
);

const countries = computed(() => 
  new Set(buildingsStore.buildings.map(b => b.country))
);

// Table state
const tableState = ref({
  currentPage: 1,
  searchQuery: '',
  sortColumn: '',
  sortDirection: 'asc' as 'asc' | 'desc',
  filters: {
    city: '',
    country: ''
  }
});

// Computed properties
const filters = computed<Filter[]>(() => [
  {
    key: 'city',
    placeholder: 'Filter by City',
    options: Array.from(cities.value).map(city => ({
      label: city,
      value: city
    }))
  },
  {
    key: 'country',
    placeholder: 'Filter by Country',
    options: Array.from(countries.value).map(country => ({
      label: country,
      value: country
    }))
  }
]);

// Methods
const handleNewBuilding = () => {
  showNewBuildingModal.value = true;
};

const handleBuildingSaved = async (buildingData: { 
  name: string; 
  city: string; 
  country: string 
}) => {
  try {
    await buildingsStore.createBuilding(buildingData);
    showNewBuildingModal.value = false;
    showToast('Building saved successfully', 'success');
  } catch (error) {
    showToast('Error saving building', 'danger');
  }
};

const handleActionClick = async (building: Building) => {
  try {
    if (confirm('Are you sure you want to delete this building?')) {
      await buildingsStore.deleteBuilding(building.id);
      showToast('Building deleted successfully', 'success');
    }
  } catch (error) {
    console.error('Error deleting building:', error);
    showToast('Error deleting building', 'danger');
  }
};

const handleRowClick = (building: Building) => {
  router.push(`/buildings/${building.id}`);
};

const handleSearch = (value: string) => {
  tableState.value.searchQuery = value;
};

const handleFilter = (key: string, value: string) => {
  tableState.value.filters[key as keyof typeof tableState.value.filters] = value;
};

const handleSort = (column: string) => {
  if (tableState.value.sortColumn === column) {
    tableState.value.sortDirection = 
      tableState.value.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    tableState.value.sortColumn = column;
    tableState.value.sortDirection = 'asc';
  }
};

const handlePageChange = (page: number) => {
  tableState.value.currentPage = page;
};

const clearFilters = () => {
  tableState.value.filters = {
    city: '',
    country: ''
  };
  tableState.value.searchQuery = '';
};

// Filtered and sorted buildings
const filteredBuildings = computed(() => {
  let result = [...buildingsStore.buildings];

  // Apply search
  if (tableState.value.searchQuery) {
    const search = tableState.value.searchQuery.toLowerCase();
    result = result.filter(building => 
      building.name.toLowerCase().includes(search) ||
      building.city.toLowerCase().includes(search) ||
      building.country.toLowerCase().includes(search)
    );
  }

  // Apply filters
  if (tableState.value.filters.city) {
    result = result.filter(building => 
      building.city === tableState.value.filters.city
    );
  }
  if (tableState.value.filters.country) {
    result = result.filter(building => 
      building.country === tableState.value.filters.country
    );
  }

  // Apply sorting
  if (tableState.value.sortColumn) {
    const column = tableState.value.sortColumn;
    const direction = tableState.value.sortDirection === 'asc' ? 1 : -1;
    
    result.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      return aValue > bValue ? direction : -direction;
    });
  }

  return result;
});

// Fetch buildings on component mount
onMounted(async () => {
  try {
    await buildingsStore.fetchBuildings();
  } catch (error) {
    showToast('Error fetching buildings', 'danger');
  }
});
</script>

<template>
  <ion-page>
    <CommonHeader title="Buildings">
      <template #right-buttons> <!-- Changed from #actions to #right-buttons -->
        <ion-button @click="handleNewBuilding">
          Add Building
        </ion-button>
      </template>
    </CommonHeader>

    <ion-content>
      <DataTable
        :columns="columns"
        :items="filteredBuildings"
        :filters="filters"
        :active-filters="tableState.filters"
        :search-query="tableState.searchQuery"
        :current-page="tableState.currentPage"
        :sort-column="tableState.sortColumn"
        :sort-direction="tableState.sortDirection"
        :show-actions="true"
        :loading="buildingsStore.loading"
        @search="handleSearch"
        @filter="handleFilter"
        @clear-filters="clearFilters"
        @sort="handleSort"
        @page-change="handlePageChange"
        @row-click="handleRowClick"
        @action-click="handleActionClick"
      />
    </ion-content>

    <NewBuildingModal
    :is-open="showNewBuildingModal"
    @close="showNewBuildingModal = false"
    @save="handleBuildingSaved"
  />
  </ion-page>
</template>

<style scoped>
ion-content {
  --padding-top: 1rem;
  --padding-start: 1rem;
  --padding-end: 1rem;
  --padding-bottom: 1rem;
}
</style>
