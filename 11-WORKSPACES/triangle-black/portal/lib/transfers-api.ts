// Warehouse Transfers API — Triangle Black
import { api } from "@/lib/api";

export interface TransferCreate {
  item_id:           string;
  from_warehouse_id: string;
  to_warehouse_id:   string;
  qty:               number;
  unit_cost?:        number;
  reason?:           string;
  notes?:            string;
}

export interface TransferListItem {
  transfer_id:       string;
  item_id:           string;
  item_name:         string;
  from_warehouse_id: string;
  from_warehouse:    string;
  to_warehouse_id:   string;
  to_warehouse:      string;
  qty:               number;
  unit_cost:         number;
  total_cost:        number;
  reason:            string | null;
  created_at:        string;
  status:            string;
}

export interface TransferResponse {
  transfer_id:      string;
  item_id:          string;
  from_warehouse_id:string;
  to_warehouse_id:  string;
  qty:              number;
  unit_cost:        number;
  total_cost:       number;
  created_at:       string;
  out_movement:     { movement_number: string };
  in_movement:      { movement_number: string };
}

export async function fetchTransfers(): Promise<TransferListItem[]> {
  const res = await api.get<any>("/inventory/transfers");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

export async function createTransfer(payload: TransferCreate): Promise<TransferResponse> {
  const res = await api.post<any>("/inventory/transfers", payload);
  return res.data;
}

export async function fetchWarehouses() {
  const res = await api.get<any>("/warehouses");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

export async function fetchInventoryItems() {
  const res = await api.get<any>("/inventory-items");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}
