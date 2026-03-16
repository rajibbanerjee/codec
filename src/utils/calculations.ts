import type { ChannelData, BreakevenResult } from '../types';

export function calculateBreakeven(channel: ChannelData): BreakevenResult {
  const {
    id,
    name,
    color,
    sellingPricePerUnit,
    variableCostPerUnit,
    fixedCost,
    orderSizeMin,
    orderSizeMax,
    desiredProfitMin,
    desiredProfitMax,
  } = channel;

  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  const contributionMarginPct = sellingPricePerUnit > 0
    ? (contributionMargin / sellingPricePerUnit) * 100
    : 0;

  const breakevenUnits = contributionMargin > 0 ? fixedCost / contributionMargin : Infinity;
  const breakevenRevenue = breakevenUnits * sellingPricePerUnit;

  const profitAtMinOrder = contributionMargin * orderSizeMin - fixedCost;
  const profitAtMaxOrder = contributionMargin * orderSizeMax - fixedCost;

  const unitsForMinProfit = contributionMargin > 0
    ? (fixedCost + desiredProfitMin) / contributionMargin
    : Infinity;
  const unitsForMaxProfit = contributionMargin > 0
    ? (fixedCost + desiredProfitMax) / contributionMargin
    : Infinity;

  // Build profitability curve across the order range
  const steps = 20;
  void steps;
  const profitabilityData: BreakevenResult['profitabilityData'] = [];

  const minUnits = Math.min(orderSizeMin, Math.floor(breakevenUnits * 0.5));
  const maxUnits = Math.max(orderSizeMax, Math.ceil(breakevenUnits * 1.5));
  const rangeStep = Math.max(1, Math.round((maxUnits - minUnits) / 30));

  for (let units = minUnits; units <= maxUnits; units += rangeStep) {
    const revenue = units * sellingPricePerUnit;
    const totalCost = fixedCost + units * variableCostPerUnit;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    profitabilityData.push({ units, revenue, totalCost, profit, margin });
  }

  return {
    channelId: id,
    channelName: name,
    color,
    contributionMargin,
    contributionMarginPct,
    breakevenUnits,
    breakevenRevenue,
    profitAtMinOrder,
    profitAtMaxOrder,
    unitsForMinProfit,
    unitsForMaxProfit,
    profitabilityData,
  };
}

export function formatCurrency(value: number): string {
  if (!isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  if (!isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPct(value: number): string {
  if (!isFinite(value)) return 'N/A';
  return `${value.toFixed(1)}%`;
}
