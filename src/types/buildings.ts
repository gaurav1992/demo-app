// First, let's define the necessary interfaces
// src/types/buildings.ts
export interface Building {
  id: string | number;
  name: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface BuildingFilters {
  city: string;
  country: string;
}
