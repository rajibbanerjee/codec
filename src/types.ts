export interface ChannelData {
  id: string;
  name: string;
  color: string;
  sellingPricePerUnit: number;
  variableCostPerUnit: number;
  fixedCost: number;
  orderSizeMin: number;
  orderSizeMax: number;
  desiredProfitMin: number;
  desiredProfitMax: number;
}

export interface BreakevenResult {
  channelId: string;
  channelName: string;
  color: string;
  contributionMargin: number;
  contributionMarginPct: number;
  breakevenUnits: number;
  breakevenRevenue: number;
  // At min order size
  profitAtMinOrder: number;
  profitAtMaxOrder: number;
  // Required volume for desired profit
  unitsForMinProfit: number;
  unitsForMaxProfit: number;
  // Profitability across order range
  profitabilityData: Array<{ units: number; revenue: number; totalCost: number; profit: number; margin: number }>;
}

export type ViewMode = 'channels' | 'dashboard' | 'report';
