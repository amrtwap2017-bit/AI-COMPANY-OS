// Stock Balances API — Triangle Black
// Connects to GET /api/v1/stock-balances/summary and /enriched

import { api } from "@/lib/api";

export interface StockSummary {
  total_items:     number;
  total_qty:       number;
  portfolio_value: number;
  out_of_stock:    number;
  low_stock:       number;
  healthy:         number;
}

export interface StockBalanceItem {
  id:             string;
  item_id:        string;
  warehouse_id:   string;
  item_name:      string;
  sku:            string;
  unit:           string;
  category:       string;
  warehouse_name: string;
  qty_on_hand:    number;
  qty_reserved:   number;
  qty_available:  number;
  avg_cost:       number;
  total_value:    number;
  updated_at:     string;
  status:         "ok" | "low" | "critical";
}

export async function fetchStockSummary(): Promise<StockSummary> {
  const res = await api.get<any>("/inventory/stock-balances/summary");
  return res.data;
}

export async function fetchStockBalances(): Promise<StockBalanceItem[]> {
  const res = await api.get<any>("/inventory/stock-balances/enriched");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}
