// src/stores/buildings.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Building {
  id: string | number;
  name: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export const useBuildingsStore = defineStore('buildings', () => {
  const buildings = ref<Building[]>([]);
  const loading = ref(false);
  // For testing/development, you can use this mock data
  const mockBuildings: Building[] = [
    {
      id: 1,
      name: 'Building A',
      city: 'New York',
      country: 'USA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Add more mock data as needed
  ];
  const fetchBuildings = async () => {
    try {
      loading.value = true;
      // For development, use mock data
      buildings.value = mockBuildings;
      
      // When API is ready, uncomment this:
      /*
      const response = await fetch('http://your-actual-api-url/buildings');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      buildings.value = data;
      */
    } catch (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createBuilding = async (buildingData: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      // Replace with your actual API call
      const response = await fetch('YOUR_API_URL/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildingData),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      await fetchBuildings(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error creating building:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteBuilding = async (id: string | number) => {
    try {
      loading.value = true;
      // Replace with your actual API call
      const response = await fetch(`YOUR_API_URL/buildings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      
      await fetchBuildings(); // Refresh the list
    } catch (error) {
      console.error('Error deleting building:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    buildings,
    loading,
    fetchBuildings,
    createBuilding,
    deleteBuilding,
  };
});
