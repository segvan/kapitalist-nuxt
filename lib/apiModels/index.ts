export type LoginDataModel = { username: string; password: string };

export type UserModel = { username?: string; hashedPassword?: string; email: string };

export type AssetModel = { id: string; };

export type JobsModel = { id: string; name: string; timestamp: Date; };

export type AssetPriceModel = { id: string; price: number; timestamp: Date; };

export type TradesAggregateModel = {
  symbol: string;
  qty: number;
  quoteQty: number;
  avgPrice: number;
  timestamp: Date;
};

export type SymbolModel = {
  Id: string;
  Stable: string;
  Code: string;
};