// src/types/models.ts
import type { TableItem } from './table';

export interface Asset extends TableItem {
  name: string;
  relationType: string;
  relationId: string | number;
  relationName: string;
  // add other asset-specific properties
}

export interface Location extends TableItem {
  building: string;
  buildingId: string | number;
  name: string;
  type: string;
  // add other location-specific properties
}

export interface Building extends TableItem {
  name: string;
  city: string;
  country: string;
  // add other building-specific properties
}
