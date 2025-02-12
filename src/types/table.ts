// src/types/table.ts
export interface TableItem {
  id: number | string;
  [key: string]: any;
}

export interface TableState {
  filters: Record<string, any>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
