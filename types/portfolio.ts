export interface Asset {
  asset_id: string;
  name: string;
  asset_type: string;
  invested_amount: number;
  current_value: number;
  absolute_delta: number;
  percentage_delta: number;
  updated_at: string;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  absolute_delta: number;
  percentage_delta: number;
  assets: Asset[];
}
