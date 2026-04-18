export type TradesDataModel = {
  Symbol: string;
  Qty: number;
  QuoteQty: number;
  EffectiveCostBasis: number;
  RealizedGain: number;
  AvgPrice: number;
  CurrentPrice: number;
  CurrentTotalAmount: number;
  TotalDifference: number;
  TotalEarnings: number;
  IsRecouped: boolean;
};
